import { spawn } from 'node:child_process';
import assert from 'node:assert';
import { User32 as User32Sync } from 'win32-api'
import ffi from 'ffi-napi'
import { DModel as M,
         DTypes as W,
         DStruct as DS,
         retrieveStructFromPtrAddress,
         StructFactory,
         ucsBufferFrom,
         ucsBufferToString,
     } from 'win32-api';
     
const wffi = import ("windows-ffi");

const user32 = User32Sync.load();
const child = spawn("AutoIt3.exe", [ "/ErrorStdOut", "C:\\dev\\gorillas\\runGorillas.au3"]);




function connectGame(wffi: any) {
  setTimeout( () => {
    console.log("spawned", child.pid);
    
    const hWnd = user32.FindWindowExW(0, 0, ucsBufferFrom("SDL_app\0"), null)
    
    console.log("Found", hWnd);
    assert((typeof hWnd === 'string' && hWnd.length > 0) || hWnd != null, 'found no SDL_app window')
    
    const len = 1028;
    const buf = Buffer.alloc(len * 2)
    user32.GetWindowTextW(hWnd, buf, len);
    
    const windowTitle = ucsBufferToString(buf, len);
    
    assert(windowTitle.startsWith("DOSBox") && windowTitle.endsWith("QB"), 'SDL_app window is not dosbox QB:'+windowTitle);
    
    
    // First capture a screenshot of a section of the screen.
    const screenshot = wffi.CaptureScreenshot({
      windowHandle: wffi.GetForegroundWindowHandle(), // comment to screenshot all windows
      rectToCapture: new wffi.VRect(0, 0, 800, 600),
    });
    
    console.log(screenshot.buffer.toString());
    
    console.log("Killing");
    child.kill();
  });
}


wffi.then((x) => connectGame(x));