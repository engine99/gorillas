import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import assert from 'node:assert';
import { User32 as User32Sync } from 'win32-api'
import { DModel as M,
         DTypes as W,
         DStruct as DS,
         ucsBufferFrom,
         ucsBufferToString,
         
     } from 'win32-api';
import keycode from 'keycode';
     
import { HWND } from 'win32-def';

import { CaptureScreenshot, GetForegroundWindowHandle, VRect} from 'windows-ffi';



export function runGorillas(): Promise<HWND> {
  return new Promise((res, rej) => {

    const child = spawn("AutoIt3.exe", [ "/ErrorStdOut", ".\\dist\\backend\\runGorillas.au3"]);
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', console.log);
    child.stderr.on('error', console.log);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', console.log);
    child.stdout.on('error', console.log);
    setTimeout(() => {
      const user32 = User32Sync.load();
      const hWnd = user32.FindWindowExW(0, 0, ucsBufferFrom("SDL_app\0"), null)
      
      console.log("Found", hWnd);
      if (!((typeof hWnd === 'string' && hWnd.length > 0) || hWnd != null)) {
        rej('found no SDL_app window');
      }
      
      const len = 1028;
      const buf = Buffer.alloc(len * 2)
      user32.GetWindowTextW(hWnd, buf, len);
      
      const windowTitle = ucsBufferToString(buf, len);
      
      if (!(windowTitle.startsWith("DOSBox") && windowTitle.endsWith("QB"))) {
        rej('SDL_app window is not dosbox QB:'+windowTitle);            
      }
      
      // First capture a screenshot of a section of the screen.
      const screenshot = CaptureScreenshot({
        windowHandle: hWnd.valueOf() as any, // comment to screenshot all windows
        rectToCapture: new VRect(0, 0, 800, 600),
      });
      
      //console.log(screenshot.buffer.toString());
      
      // console.log("Killing");
      // user32.CloseWindow(hWnd);
      res(hWnd);
      
    }, 6000);
  });    

}