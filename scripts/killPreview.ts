// scripts/killPreview.ts
import { readFileSync, existsSync, unlinkSync } from 'fs';

try {
    const pidFile = '.preview-pid';
    if (!existsSync(pidFile)) {
        throw new Error('No .preview-pid file found.');
    }

    const pid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10);

    if (isNaN(pid)) {
        throw new Error('Invalid PID in .preview-pid');
    }

    process.kill(pid);
    unlinkSync(pidFile);

    console.log(`✅ Killed preview server with PID ${pid}`);
} catch (error: any) {
    console.error(`❌ Failed to kill preview: ${error.message}`);
    process.exit(1);
}
