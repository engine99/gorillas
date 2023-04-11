Local $iPID = Run("""C:\Program Files (x86)\DOSBox-0.74-3\DOSBox.exe""")

#cs

Local $hWnd = WinGetHandle("[REGEXPTITLE:(DOSBox.*DOSBOX)]")

WinActivate($hWnd)
#ce


WinWaitActive("[REGEXPTITLE:(DOSBox.*DOSBOX)]")

Send("MOUNT C: C:\dev\gorillas{ENTER}")

Sleep(1000)

Send("C:\{ENTER}QB.exe gorilla.bas{ENTER}")

Sleep(1000)

Send("{ESC}")

Sleep(3000)

Send("{F5}")