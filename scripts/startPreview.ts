// scripts/startPreview.ts
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const vitePath = resolve('node_modules/.bin/vite');

const preview = spawn(vitePath, ['preview'], {
    detached: true,
    stdio: 'ignore',
    shell: process.platform === 'win32', // Required for Windows support
});

writeFileSync('.preview-pid', String(preview.pid));
preview.unref();
