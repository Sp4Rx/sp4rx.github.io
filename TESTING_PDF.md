# Testing PDF Generation Locally

## Quick Start

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start the preview server:**
   ```bash
   npm run preview
   ```
   This will start a local server at `http://localhost:4173`

3. **In a separate terminal, generate the PDF:**
   ```bash
   npm run generate:pdf
   ```

   Or manually:
   ```bash
   # Make sure preview is running, then:
   tsx scripts/generateResumePDF.ts
   ```

## Step-by-Step Testing

### Option 1: Using the Full Script (Recommended)
```bash
npm run generate:pdf
```

This script will:
1. Build the project
2. Start preview server in background
3. Wait for server to be ready
4. Generate PDF
5. Clean up (kill preview server)

### Option 2: Manual Testing

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start preview server in one terminal:**
   ```bash
   npm run preview
   ```
   Keep this running.

3. **In another terminal, generate PDF:**
   ```bash
   tsx scripts/generateResumePDF.ts
   ```

4. **Check the output:**
   - PDF will be generated in `dist/resume.pdf`
   - Also copied to `public/resume.pdf`

### Option 3: Test with Browser DevTools

1. Build and start preview:
   ```bash
   npm run build && npm run preview
   ```

2. Open `http://localhost:4173` in your browser

3. Open DevTools (F12) and check:
   - Resume sections are visible
   - Headings show ATS-friendly names (check via `data-ats-title` attribute)
   - No image carousels in project cards
   - Game container is hidden (for PDF)

4. Use browser's Print to PDF:
   - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows/Linux)
   - Select "Save as PDF"
   - This gives you a quick preview

## Verifying PDF Content

After generating the PDF, check:

1. **Headings are ATS-friendly:**
   - Should see "Work Experience" not "[JOB DUNGEONS]"
   - Should see "Technical Skills" not "[POWER UPS]"
   - Should see "Projects" not "[PROJECT LOGS]"
   - etc.

2. **No game elements:**
   - No snake game canvas
   - No game controls
   - No theme toggle

3. **No image carousels:**
   - Project cards should not have images
   - Only text content in projects

4. **Skills alignment:**
   - Long skill names should wrap properly
   - Percentage should stay aligned on the right

## Troubleshooting

### Error: "UnhandledPromiseRejection"
- Make sure preview server is running before generating PDF
- Check if port 4173 is available
- Try increasing wait time in `waitForPreview.ts`

### PDF is empty or missing content
- Check browser console for errors
- Ensure all CSS is loaded (check network tab)
- Try increasing wait time in PDF script (currently 1000ms)

### PDF has wrong headings
- Check that `ResumeSection` component has `data-ats-title` attribute
- Verify PDF script is replacing headings correctly
- Check browser DevTools to see actual DOM structure

### Port already in use
```bash
# Kill existing preview server
npm run kill:preview

# Or manually find and kill the process
lsof -ti:4173 | xargs kill
```

## Testing ATS Compatibility

To test if the PDF is ATS-friendly:

1. **Use online ATS parsers:**
   - Upload PDF to services like Jobscan, ResumeWorded, or similar
   - Check if sections are parsed correctly

2. **Check PDF metadata:**
   ```bash
   # On Mac/Linux
   file resume.pdf
   
   # Check with pdfinfo (if installed)
   pdfinfo public/resume.pdf
   ```

3. **Manual inspection:**
   - Open PDF in Adobe Reader
   - Use "Select Text" tool
   - Verify text is selectable (not images)
   - Check headings are proper text, not images

## Expected Output

After successful generation, you should see:
```
✅ Preview server is up
✅ PDF (light) generated: dist/resume.pdf, with height: [number]
✅ PDF copied to: public/resume.pdf
✅ PDF generation completed successfully
```

## Notes

- PDF generation uses Puppeteer to render the page
- The script waits for `networkidle0` to ensure all resources are loaded
- Additional 1 second wait is added for CSS animations to complete
- PDF is generated at 2x device scale factor for better quality

