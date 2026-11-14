# suvajit.in

Portfolio and resume of Suvajit Sarkar. The page opens on a portrait drawn in about 32,000 lime particles. Scrolling scatters them into a tunnel and flies through one card per job, then the particles regroup into "SAY HELLO" at the contact section.

## Run it

Needs Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the dev server on port 8080
- `npm run build` - build for production
- `npm run check` - self-check for the career cards and their scroll maths
- `npm run generate:pdf` - build the site and print the ATS-friendly resume to `resume.pdf`
- `npm run lint` - run ESLint

Pushing to `main` builds the site, generates the PDF and deploys to GitHub Pages.

## Where things live

- `src/data/resume.ts` - all content. Each job has a one-line `headline` shown on its card
- `src/pages/Index.tsx` - the page, the scroll loop and the career corridor
- `src/lib/particles.ts` - the particle scene, written directly in WebGL (one draw call, no 3D library)
- `src/lib/scene.ts` - where each career card sits for a given scroll position
- `src/components/resume/` - the resume, shared by the site and the PDF
- `src/styles/index.css` - colour tokens (dark site, light PDF) and component styles
- `public/portrait.png` - the portrait as a small greyscale map with the background removed. To change the photo, replace this with a 240px-wide greyscale PNG whose background is transparent
- `scripts/generateResumePDF.ts` - loads the site with `?pdf` and prints it with Playwright

Visitors who ask their device for reduced motion get the same content as a plain page with no animation.

## Stack

Vite, React, TypeScript, Tailwind CSS.
