"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_child_process_1 = require("node:child_process");
var node_assert_1 = require("node:assert");
var win32_api_1 = require("win32-api");
var win32_api_2 = require("win32-api");
var windows_ffi_1 = require("windows-ffi");
var user32 = win32_api_1.User32.load();
var child = (0, node_child_process_1.spawn)("AutoIt3.exe", ["/ErrorStdOut", "C:\\dev\\gorillas\\runGorillas.au3"]);
setTimeout(connectGame, 8000);
function connectGame() {
    console.log("spawned", child.pid);
    var hWnd = user32.FindWindowExW(0, 0, (0, win32_api_2.ucsBufferFrom)("SDL_app\0"), null);
    console.log("Found", hWnd);
    (0, node_assert_1.default)((typeof hWnd === 'string' && hWnd.length > 0) || hWnd != null, 'found no SDL_app window');
    var len = 1028;
    var buf = Buffer.alloc(len * 2);
    user32.GetWindowTextW(hWnd, buf, len);
    var windowTitle = (0, win32_api_2.ucsBufferToString)(buf, len);
    (0, node_assert_1.default)(windowTitle.startsWith("DOSBox") && windowTitle.endsWith("QB"), 'SDL_app window is not dosbox QB:' + windowTitle);
    // First capture a screenshot of a section of the screen.
    var screenshot = (0, windows_ffi_1.CaptureScreenshot)({
        windowHandle: (0, windows_ffi_1.GetForegroundWindowHandle)(),
        rectToCapture: new windows_ffi_1.VRect(0, 0, 800, 600),
    });
    console.log(screenshot.buffer.toString());
    console.log("Killing");
    child.kill();
}
