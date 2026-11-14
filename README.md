# suvajit.in

Portfolio and resume of Suvajit Sarkar. The hero asks "What do you need built?" and a 3D stack of five layers (mobile, web, AI, backend, cloud) lights up for whatever the visitor ticks, then points to the projects and roles that cover it.

## Run it

Needs Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the dev server on port 8080
- `npm run build` - build for production
- `npm run check` - self-check for the picker logic and the layer tags in the resume data
- `npm run generate:pdf` - build the site and print the ATS-friendly resume to `resume.pdf`
- `npm run lint` - run ESLint

Pushing to `main` builds the site, generates the PDF and deploys to GitHub Pages.

## Where things live

- `src/data/resume.ts` - all content. Every project and role lists the stack `layers` it touched
- `src/components/site/Hero.tsx` - the picker and the 3D stack (plain CSS transforms, no 3D library)
- `src/components/resume/` - the resume, shared by the site and the PDF
- `src/lib/match.ts` - which projects match the ticked layers, and the prefilled email link
- `src/styles/index.css` - colour tokens for light and dark, and the stack styles
- `scripts/generateResumePDF.ts` - loads the site with `?pdf` and prints it with Playwright

## Stack

Vite, React, TypeScript, Tailwind CSS.
