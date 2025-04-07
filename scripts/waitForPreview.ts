// scripts/waitForPreview.ts
import http from 'http';

const PORT = 4173;
const TIMEOUT = 10000;

function waitForServer(port: number, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const req = http.get({ host: 'localhost', port, timeout: 1000 }, (res) => {
        res.resume();
        resolve();
      });

      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for preview server'));
        } else {
          setTimeout(check, 500);
        }
      });
    };

    check();
  });
}

waitForServer(PORT, TIMEOUT)
  .then(() => {
    console.log('✅ Preview server is up');
  })
  .catch((err) => {
    console.error('❌', err.message);
    process.exit(1);
  });
