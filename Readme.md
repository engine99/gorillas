## About
A web app that streams Gorillas.bas running on Dosbox emulator.

Requirements:
1) Dosbox https://www.dosbox.com/download.php?main=1
2) AutoIt3 https://www.autoitscript.com/site/autoit/downloads/

Gorillas.bas is Copyright 1990 Microsoft.

Specs:
Single-environment
Express server
Typescript

To start:
npm run build
npm run dev
npm run start

Notes:
Todo Game windows & processes should close after timeout.
Todo Wss should fall back to ws to help with development, if not, have environments
Bug - If running on VM, need an open RDP to the VM


