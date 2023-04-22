import { runGorillas } from './services/runGorillas.js'
import { spawn } from 'node:child_process';
import { start } from 'node:repl';
import { User32 as User32Sync } from 'win32-api';
import { HWND } from 'win32-def';
import Jimp from 'jimp';
import { WebSocket } from 'ws';

import { CaptureScreenshot, GetForegroundWindowHandle, VRect} from 'windows-ffi';

export class Player {
    public ip: string = '----';
    public cookie: string = '';
    public ws: WebSocket | null = null;
    constructor() {}
}

export class GameSession {

    startGameAndStream() {
        runGorillas().then((hWnd) => {
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
    
    public oid: string = '';
    public players: Player[] = [];
}