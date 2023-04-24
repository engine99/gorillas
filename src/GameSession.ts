import { runGorillas } from './services/runGorillas.js'
import { HWND } from 'win32-def';
import Jimp from 'jimp';
import { WebSocket } from 'ws';
import keycode from 'keycode';
import FFI from 'ffi-napi';
import ref from 'ref-napi';

import { CaptureScreenshot, GetForegroundWindowHandle, VRect, ffi } from 'windows-ffi';
import { exec, spawn } from 'node:child_process';


export class Player {
    public ip: string = '----';
    public cookie: string = '';
    public ws: WebSocket | null = null;
    constructor() {}
}



export class GameSession {

    startGameAndStream() {
        runGorillas().then((hWnd) => {
            this.handle = hWnd;
            const poll = setInterval(()=>{
                const screenshot = CaptureScreenshot({
                    windowHandle: hWnd.valueOf() as any, // comment to screenshot all windows

                });
                new Jimp(screenshot.width, screenshot.width, (err, image) => {
                    for (let x = 0; x < screenshot.width; x++) {
                        for (let y = 0; y < screenshot.height; y++) {
                            image.setPixelColour(Jimp.cssColorToHex(screenshot.GetPixel(x,y).ToHex_RGB()), x, y);
                        }
                    }
                    // this image is 256 x 256, every pixel is set to 0x00000000
                    image.getBuffer(Jimp.MIME_PNG, (err, result)=>{
                        this.players.forEach(p => {
                            p.ws?.send(result);
                        })
                    });
                });
            },
            1000);
        });
    }

    public sendKeys(input: string) {
        if (this.handle) {
            // const user32 = User32Sync.load();
            // console.log(keycode(input));
            // user32.SetForegroundWindow(this.handle);
            // console.log(user32.PostMessageW(this.handle, 0x0100, keycode.codes.a, 0));
            const child = spawn("AutoIt3.exe", [ "/ErrorStdOut", ".\\dist\\backend\\runGorillas.au3"]);
    
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', console.log);
            child.stderr.on('error', console.log);

            child.stdout.setEncoding('utf8');
            child.stdout.on('data', console.log);
            child.stdout.on('error', console.log);

        }
    }
    public oid: string = '';
    public players: Player[] = [];
    handle: any;

}