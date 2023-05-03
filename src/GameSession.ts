import { runGorillas } from './services/runGorillas.js'
import Jimp from 'jimp';
import { WebSocket } from 'ws';
import { CaptureScreenshot } from 'windows-ffi';
import { spawn } from 'node:child_process';

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
                new Jimp(screenshot.width, screenshot.height, (err, image) => {
                    for (let x = 0; x < screenshot.width; x++) {
                        for (let y = 0; y < screenshot.height; y++) {
                            const pix = screenshot.GetPixel(x,y);
                            image.setPixelColour((((((pix.red * 256)+pix.green)*256)+pix.blue)*256) + 255, x, y);
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
            50);
        });
    }

    public sendKeys(input: string) {
        if (this.handle) {

            if (input.match(/(Backspace|Enter|^[\w. ]$)/)) {
                let decoded = input;
                if (decoded === "Enter" || decoded.endsWith("\n")) {
                    decoded = "{Enter}";
                } else if (decoded === "Backspace") {
                    decoded = "{BS}"
                }
                const command = `Global $a = WinActivate(HWnd('${this.handle}')) & Send('${decoded}')`;
                console.log(command);
                const child = spawn("AutoIt3.exe", 
                [ 
                    "/ErrorStdOut", 
                    "/AutoIt3ExecuteLine",
                    command
                ]);
            } else {
                console.log("Illegal Input:" + input);
            }

        }
    }
    public oid: string = '';
    public players: Player[] = [];
    handle: any;

}