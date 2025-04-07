import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themes = ['light', 'dark'] as const;

async function generatePDF(theme: (typeof themes)[number]) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();

    // First set a standard viewport
    await page.setViewport({
      width: 1024,
      height: 8000,
      deviceScaleFactor: 2
    });

    const url = `http://localhost:4173/?theme=${theme}`;
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Remove unwanted elements
    await page.evaluate(() => {
      const selectors = [
        '#game-container',
        '#snake',
        '#food',
        '#message-box',
        '#help',
        '#theme-toggle',
        '#download-resume'
      ];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) el.remove();
      }
    });

    // Calculate full height of the page
    const pageHeight = await page.evaluate(() => document.documentElement.offsetHeight);

    // Update viewport to match content height
    await page.setViewport({
      width: 1024,
      height: pageHeight,
      deviceScaleFactor: 2
    });

    const outputDir = path.join(__dirname, '../public');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const outputPath = path.join(outputDir, `resume.pdf`);

    await page.pdf({
      path: outputPath,
      printBackground: true,
      width: '1024px',
      height: `${pageHeight}px`,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    console.log(`✅ PDF (${theme}) generated: ${outputPath}, with height: ${pageHeight}`);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

async function main() {
  await generatePDF('light');
}
main();
