import { runGorillas } from './services/runGorillas.js'
import { spawn } from 'node:child_process';
import { start } from 'node:repl';
import { DModel as M,
    DTypes as W,
    DStruct as DS,
    User32 as User32Sync} from 'win32-api';
import { HWND } from 'win32-def';
import Jimp from 'jimp';
import { WebSocket } from 'ws';
import keycode from 'keycode';
import FFI from 'ffi-napi';
import ref from 'ref-napi';

import { CaptureScreenshot, GetForegroundWindowHandle, VRect, ffi } from 'windows-ffi';
import { K } from 'node_modules/win32-api/dist/index.cjs';

import UnionType from 'ref-union-napi';

import StructType from 'ref-struct-napi';

export class Player {
    public ip: string = '----';
    public cookie: string = '';
    public ws: WebSocket | null = null;
    constructor() {}
}



const user32 = new FFI.Library('user32.dll', {
    // UINT SendInput(
    //   _In_ UINT cInputs,                     // number of input in the array
    //   _In_reads_(cInputs) LPINPUT pInputs,  // array of inputs
    //   _In_ int cbSize);                      // sizeof(INPUT)
    'SendInput': ['uint32', ['int32', 'pointer', 'int32']],
  })    

  const KEYBDINPUT = StructType({
    vk: M.Def.uint16,//'uint16',
    scan: M.Def.uint16,//'uint16',
    flags: M.Def.uint32, //'uint32',
    time: M.Def.uint32,//'uint32',
    extraInfo: M.Def.ptr
  })

  const MOUSEINPUT = StructType({
    dx: M.Def.int32,//'int32',
    dy: M.Def.int32,//'int32',
    mouseData: M.Def.uint32,//'uint32',
    flags: M.Def.uint32,//'uint32',
    time: M.Def.uint32,//'uint32',
    extraInfo: M.Def.ptr
  })
  
  const HARDWAREINPUT = StructType({
    msg: M.Def.uint32,//'uint32',
    paramL: M.Def.uint16,//'uint16',
    paramH: M.Def.uint16,//'uint16',
  })

  const INPUT_UNION = UnionType({
    mi: MOUSEINPUT,
    ki: KEYBDINPUT,
    hi: HARDWAREINPUT,
  })
  const INPUT = StructType({
    type: M.Def.uint32,//'uint32',
    union: INPUT_UNION,
  })

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

            const keyDownKeyboardInput = KEYBDINPUT({vk: 0, extraInfo: ref.NULL_POINTER, time: 0, scan: 0x1E, flags: 0x0008})
            
            const keyDownInput = INPUT({type: 1, union: INPUT_UNION({ki: keyDownKeyboardInput})})
            user32.SendInput(1, keyDownInput.ref(), INPUT.size)


        }
    }
    public oid: string = '';
    public players: Player[] = [];
    handle: any;

}