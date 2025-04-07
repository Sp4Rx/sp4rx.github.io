import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePDF() {
  console.log('Generating PDF...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
      width: 1024,
      height: 1400,
      deviceScaleFactor: 2
    });

    // Instead of setContent, navigate to your running local server
    const url = 'http://localhost:4173/';
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Remove unwanted elements
    await page.evaluate(() => {
      const elementsToRemove = [
        '#pixel-button',
        '#help-icon'
      ];
      elementsToRemove.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) element.remove();
      });
    });

    // Ensure the /public directory exists
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Generate PDF
    const pdfPath = path.join(publicDir, 'resume.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
    });

    console.log('✅ PDF generated successfully at:', pdfPath);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generatePDF();
