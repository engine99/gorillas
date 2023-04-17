import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import assert from 'node:assert';
import { User32 as User32Sync } from 'win32-api'
import { DModel as M,
         DTypes as W,
         DStruct as DS,
         ucsBufferFrom,
         ucsBufferToString,
     } from 'win32-api';
     
import { CaptureScreenshot, GetForegroundWindowHandle, VRect} from 'windows-ffi';

export class runGorillas {
  
  private child: any;
  user32 = User32Sync.load();

  constructor() {
    
  }
  
  launchGame() {
    
    this.child = spawn("AutoIt3.exe", [ "/ErrorStdOut", ".\\dist\\backend\\runGorillas.au3"]);
    this.child.stderr.setEncoding('utf8');
    this.child.stderr.on('data', console.log);
    this.child.stderr.on('error', console.log);
    this.child.stdout.setEncoding('utf8');
    this.child.stdout.on('data', console.log);
    this.child.stdout.on('error', console.log);
    setTimeout(this.connectGame, 8000);

  }

  connectGame() {
    
      console.log("spawned", this.child.pid);
      
      const hWnd = this.user32.FindWindowExW(0, 0, ucsBufferFrom("SDL_app\0"), null)
      
      console.log("Found", hWnd);
      assert((typeof hWnd === 'string' && hWnd.length > 0) || hWnd != null, 'found no SDL_app window')
      
      const len = 1028;
      const buf = Buffer.alloc(len * 2)
      this.user32.GetWindowTextW(hWnd, buf, len);
      
      const windowTitle = ucsBufferToString(buf, len);
      
      assert(windowTitle.startsWith("DOSBox") && windowTitle.endsWith("QB"), 'SDL_app window is not dosbox QB:'+windowTitle);
      
      
      // First capture a screenshot of a section of the screen.
      const screenshot = CaptureScreenshot({
        windowHandle: GetForegroundWindowHandle(), // comment to screenshot all windows
        rectToCapture: new VRect(0, 0, 800, 600),
      });
      
      //console.log(screenshot.buffer.toString());
      
      console.log("Killing");
      this.user32.CloseWindow(hWnd);
      console.log(this.child.kill());

  }
}