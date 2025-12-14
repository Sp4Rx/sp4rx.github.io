import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { PATHS } from '../src/constants/paths';

const themes = ['light', 'dark'] as const;

// Helper function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generatePDF(theme: (typeof themes)[number]) {
  let browser;
  
  try {
    browser = await chromium.launch({
      headless: true,
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
      ]
    });
  } catch (error) {
    console.error('❌ Failed to launch browser:', error);
    throw error;
  }

  try {
    const context = await browser.newContext({
      viewport: {
        width: 1024,
        height: 10
      },
      deviceScaleFactor: 2
    });
    
    const page = await context.newPage();
    
    // Set longer timeouts
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    const url = `http://localhost:4173/?theme=${theme}`;
    console.log(`Navigating to ${url}`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle',
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
    await delay(2000);
    
    // Wait for resume content to be visible
    await page.waitForSelector('.resume-content', { timeout: 10000 }).catch(() => {
      console.log('Resume content selector not found, continuing anyway...');
    });

    // Remove unwanted elements and replace headings with ATS-friendly versions
    await page.evaluate(() => {
      const selectors = [
        '#game-container',
        '#theme-toggle',
        '#download-resume',
        '.stack-overflow-flair' // Hide Stack Overflow flair in PDF (badge will show instead)
      ];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) el.remove();
      }

      // Show Stack Overflow badge in PDF (it's hidden on webpage)
      const stackOverflowBadge = document.querySelector('.stack-overflow-badge');
      if (stackOverflowBadge) {
        (stackOverflowBadge as HTMLElement).style.display = 'block';
      }

      // Show phone number in PDF if showPhoneNumberInPDF is true
      const phoneElement = document.querySelector('.pdf-only-phone');
      if (phoneElement) {
        (phoneElement as HTMLElement).style.display = 'block';
      }

      // Show website URL in PDF if showWebsiteUrlInPDF is true
      const websiteElement = document.querySelector('.pdf-only-website');
      if (websiteElement) {
        (websiteElement as HTMLElement).style.display = 'block';
      }

      // Replace retro-themed headings with ATS-friendly headings
      // Use the data-ats-title attribute set by ResumeSection component (single source of truth)
      const headings = document.querySelectorAll('.pixel-heading');
      headings.forEach((heading) => {
        const atsTitle = heading.getAttribute('data-ats-title');
        if (atsTitle) {
          heading.textContent = atsTitle;
        }
      });

      // Also update any h2 elements that might have retro titles
      // Check if they have data-ats-title attribute
      const allHeadings = document.querySelectorAll('h2');
      allHeadings.forEach((heading) => {
        const atsTitle = heading.getAttribute('data-ats-title');
        if (atsTitle) {
          heading.textContent = atsTitle;
        }
      });
    });

    // Wait for all content to be fully rendered
    await delay(1000);
    
    // Wait for images and other resources to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
          });
        })
      );
    });

    // Calculate actual content height using scrollHeight to get full content
    // First, set a large viewport to ensure all content is visible for accurate measurement
    await page.setViewportSize({
      width: 1024,
      height: 50000 // Large initial viewport to capture all content
    });
    
    // Wait for viewport to settle
    await delay(300);

    // Calculate the actual content height dynamically
    const contentHeight = await page.evaluate(() => {
      const resumeContent = document.querySelector('.resume-content') as HTMLElement;
      if (resumeContent) {
        // Use scrollHeight to get the full content height, including clipped content
        const scrollHeight = resumeContent.scrollHeight;
        const offsetHeight = resumeContent.offsetHeight;
        // Use the larger of the two to ensure we capture all content
        const height = Math.max(scrollHeight, offsetHeight);
        // Add minimal padding (20px) to prevent clipping
        return Math.ceil(height + 20);
      }
      // Fallback to body scroll height
      const body = document.body;
      const html = document.documentElement;
      return Math.ceil(Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.scrollHeight,
        html.offsetHeight
      ));
    });

    // Set viewport to exactly match the content height (fully dynamic)
    await page.setViewportSize({
      width: 1024,
      height: contentHeight // Dynamic height based on actual content
    });

    // Wait for viewport to settle and content to reflow
    await delay(300);

    // Final height calculation to ensure accuracy
    const finalHeight = await page.evaluate(() => {
      const resumeContent = document.querySelector('.resume-content') as HTMLElement;
      if (resumeContent) {
        const scrollHeight = resumeContent.scrollHeight;
        const offsetHeight = resumeContent.offsetHeight;
        const height = Math.max(scrollHeight, offsetHeight);
        return Math.ceil(height + 20);
      }
      return Math.ceil(Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ));
    });

    const outputDir = path.join(process.cwd(), 'dist');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, PATHS.PDF.FILE_NAME);

    await page.pdf({
      path: outputPath,
      printBackground: true,
      width: '1024px',
      height: `${finalHeight}px`,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
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
    console.error('❌ Fatal error in PDF generation:', error);
    process.exit(1);
  }
}

main().catch((error: any) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
