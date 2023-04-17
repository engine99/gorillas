import { runGorillas } from './services/runGorillas.js'
import { spawn } from 'node:child_process';
import { User32 as User32Sync } from 'win32-api'
export class Player {
    public ip: string = '----';
    public cookie: string = '';
    constructor() {}
}

export class GameSession {
    runGame() {
        new runGorillas().launchGame();
    }
    public oid: string = '';
    public player1: Player | null = null;
    public player2: Player | null = null;
}