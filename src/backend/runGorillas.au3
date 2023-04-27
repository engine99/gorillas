Local $iPID = Run("""C:\Program Files (x86)\DOSBox-0.74-3\DOSBox.exe""")

#cs

Local $hWnd = WinGetHandle("[REGEXPTITLE:(DOSBox.*DOSBOX)]")

WinActivate($hWnd)
#ce


Local $hGame = WinWaitActive("[REGEXPTITLE:(DOSBox.*DOSBOX)]")

Send("MOUNT C: .\dist\backend{ENTER}")
#Send("MOUNT C: C:\dev\gorillas\dist\backend{ENTER}")

Sleep(1000)

WinWaitActive($hGame)
Send("C:\{ENTER}QB.exe gorilla.bas{ENTER}")

Sleep(1000)

WinWaitActive($hGame)
Send("{ESC}")

Sleep(3000)

WinWaitActive($hGame)
Send("{F5}")

ConsoleWrite($hGame)
ConsoleWrite("done")