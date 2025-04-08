import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { PATHS } from '../src/constants/paths';


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

    const outputDir = path.join(process.cwd(), 'dist');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, PATHS.PDF.FILE_NAME);

    await page.pdf({
      path: outputPath,
      printBackground: true,
      width: '1024px',
      height: `${pageHeight}px`,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    console.log(`✅ PDF (${theme}) generated: ${outputPath}, with height: ${pageHeight}`);

    // Copy the generated PDF to the public directory
    const publicDir = path.join(process.cwd(), PATHS.PDF.OUTPUT_DIR);
    await fs.mkdir(publicDir, { recursive: true });
    const publicPath = path.join(publicDir, PATHS.PDF.FILE_NAME);
    await fs.copyFile(outputPath, publicPath);
    console.log(`✅ PDF copied to: ${publicPath}`);
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
