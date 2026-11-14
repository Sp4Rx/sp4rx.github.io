# suvajit.in

Portfolio and resume of Suvajit Sarkar. The page is styled like a gig poster in black, bone and lime: a giant headline, a 3D coin with my photo that flips when tapped, and a deck of cards, one per job, that pile up as you scroll.

## Run it

Needs Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the dev server on port 8080
- `npm run build` - build for production
- `npm run check` - self-check for the resume data and the static images the page needs
- `npm run generate:pdf` - build the site and print the ATS-friendly resume to `resume.pdf`
- `npm run lint` - run ESLint

Pushing to `main` builds the site, generates the PDF and deploys to GitHub Pages.

## Where things live

- `src/data/resume.ts` - all content. Each job has a one-line `headline` shown on its card
- `src/pages/Index.tsx` - the page and its one scroll loop (progress bar, marquee lean, coin tilt, card deck)
- `src/components/resume/` - the resume, shared by the site and the PDF
- `src/styles/index.css` - colour tokens (dark site, light PDF) and every animation, in plain CSS
- `public/suvajit.webp` - the coin photo, with a transparent background. Replace it with another cut-out to change the photo
- `public/og.jpg` - the 1200x630 image shown when the link is shared
- `scripts/generateResumePDF.ts` - loads the site with `?pdf` and prints it with Playwright

Visitors who ask their device for reduced motion get the same page with the animations switched off.

## Stack

Vite, React, TypeScript, Tailwind CSS.
