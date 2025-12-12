import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { PATHS } from '../src/constants/paths';

// Suppress WebSocket errors that are non-fatal
process.on('unhandledRejection', (reason, promise) => {
  if (reason && typeof reason === 'object' && 'code' in reason && reason.code === 'ECONNRESET') {
    // Ignore WebSocket connection reset errors - they're often non-fatal
    console.log('⚠️  WebSocket connection warning (non-fatal), continuing...');
    return;
  }
  // Re-throw other errors
  throw reason;
});

const themes = ['light', 'dark'] as const;

async function generatePDF(theme: (typeof themes)[number]) {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true, // Use 'true' instead of 'new' for better stability
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      protocolTimeout: 120000, // Increase to 120 seconds
      ignoreHTTPSErrors: true,
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false
    });
  } catch (error) {
    console.error('❌ Failed to launch browser:', error);
    throw error;
  }

  try {
    const page = await browser.newPage();
    
    // Set longer timeouts
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // First set a standard viewport
    await page.setViewport({
      width: 1024,
      height: 8000,
      deviceScaleFactor: 2
    });

    const url = `http://localhost:4173/?theme=${theme}`;
    console.log(`Navigating to ${url}`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });
    } catch (error) {
      console.log('Network idle timeout, trying domcontentloaded...');
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
    }

    // Wait for content to be fully rendered
    await page.waitForTimeout(2000);
    
    // Wait for resume content to be visible
    await page.waitForSelector('.resume-content', { timeout: 10000 }).catch(() => {
      console.log('Resume content selector not found, continuing anyway...');
    });

    // Remove unwanted elements and replace headings with ATS-friendly versions
    await page.evaluate(() => {
      const selectors = [
        '#game-container',
        '#theme-toggle',
        '#download-resume'
      ];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) el.remove();
      }

      // Replace retro-themed headings with ATS-friendly headings
      const headingMap: Record<string, string> = {
        '[JOB DUNGEONS]': 'Work Experience',
        '[POWER UPS]': 'Technical Skills',
        '[PROJECT LOGS]': 'Projects',
        '[EDU QUEST]': 'Education',
        '[SPELL BOOK]': 'Languages',
        '[SIDE QUESTS]': 'Interests'
      };

      // Find all pixel-heading elements and replace their text content
      const headings = document.querySelectorAll('.pixel-heading');
      headings.forEach((heading) => {
        const currentText = heading.textContent?.trim() || '';
        const atsTitle = heading.getAttribute('data-ats-title');
        if (atsTitle) {
          heading.textContent = atsTitle;
        } else if (headingMap[currentText]) {
          heading.textContent = headingMap[currentText];
        }
      });

      // Also update any h2 elements that might have retro titles
      const allHeadings = document.querySelectorAll('h2');
      allHeadings.forEach((heading) => {
        const currentText = heading.textContent?.trim() || '';
        if (headingMap[currentText]) {
          heading.textContent = headingMap[currentText];
        }
      });
    });

    // Calculate actual content height (resume content + some padding)
    const pageHeight = await page.evaluate(() => {
      // Try to get the resume content height first
      const resumeContent = document.querySelector('.resume-content');
      if (resumeContent) {
        const rect = resumeContent.getBoundingClientRect();
        // Add some padding for margins
        return Math.ceil(rect.height + 100);
      }
      // Fallback to body scroll height
      const body = document.body;
      const html = document.documentElement;
      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
    });

    // Update viewport to match content height (but cap at reasonable max)
    const viewportHeight = Math.min(pageHeight, 20000); // Cap at 20k pixels
    await page.setViewport({
      width: 1024,
      height: viewportHeight,
      deviceScaleFactor: 2
    });

    // Wait a bit for viewport to settle
    await page.waitForTimeout(500);

    // Recalculate height after viewport is set
    const finalHeight = await page.evaluate(() => {
      const resumeContent = document.querySelector('.resume-content');
      if (resumeContent) {
        const rect = resumeContent.getBoundingClientRect();
        return Math.ceil(rect.height + 100);
      }
      return Math.ceil(document.body.scrollHeight);
    });

    const outputDir = path.join(process.cwd(), 'dist');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, PATHS.PDF.FILE_NAME);

    await page.pdf({
      path: outputPath,
      printBackground: true,
      width: '1024px',
      height: `${finalHeight}px`,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      preferCSSPageSize: false
    });

    console.log(`✅ PDF (${theme}) generated: ${outputPath}, with height: ${finalHeight}px`);

    // Copy the generated PDF to the public directory
    const publicDir = path.join(process.cwd(), PATHS.PDF.OUTPUT_DIR);
    await fs.mkdir(publicDir, { recursive: true });
    const publicPath = path.join(publicDir, PATHS.PDF.FILE_NAME);
    await fs.copyFile(outputPath, publicPath);
    console.log(`✅ PDF copied to: ${publicPath}`);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error; // Re-throw to be caught by main()
  } finally {
    if (browser) {
      try {
        const pages = await browser.pages();
        await Promise.all(pages.map(page => page.close().catch(() => {})));
        await browser.close();
      } catch (closeError) {
        // Ignore close errors - browser might already be closed
        console.log('Browser cleanup completed');
      }
    }
  }
}

async function main() {
  try {
    await generatePDF('light');
    console.log('✅ PDF generation completed successfully');
    process.exit(0);
  } catch (error: any) {
    // Check if it's a WebSocket error that we can ignore
    if (error?.code === 'ECONNRESET' || error?.message?.includes('socket hang up')) {
      console.log('⚠️  WebSocket error occurred but PDF might still be generated. Checking...');
      // Check if PDF was actually created
      const outputPath = path.join(process.cwd(), 'dist', PATHS.PDF.FILE_NAME);
      try {
        await fs.access(outputPath);
        console.log('✅ PDF was generated successfully despite WebSocket warning');
        process.exit(0);
      } catch {
        console.error('❌ PDF was not generated. Fatal error:', error);
        process.exit(1);
      }
    } else {
      console.error('❌ Fatal error in PDF generation:', error);
      process.exit(1);
    }
  }
}

main().catch((error: any) => {
  // Final catch for any unhandled errors
  if (error?.code === 'ECONNRESET') {
    console.log('⚠️  WebSocket connection issue (non-fatal)');
    process.exit(0); // Exit successfully if it's just a WebSocket issue
  } else {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  }
});
