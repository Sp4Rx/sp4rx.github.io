import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Download, Mail, X } from 'lucide-react';
import Resume from '@/components/resume/Resume';
import WorkEntry from '@/components/resume/WorkEntry';
import ProjectCard from '@/components/resume/ProjectCard';
import { resumeData } from '@/data/resume';
import { PATHS } from '@/constants/paths';

// The PDF script loads the page with ?pdf and prints only the resume.
const isPdf = new URLSearchParams(window.location.search).has('pdf');

const { basics, work, projects } = resumeData;
const pad = (n: number) => String(n).padStart(2, '0');
const years = (job: (typeof work)[number]) => {
  const from = job.startDate.slice(0, 4);
  const to = job.endDate === 'Present' ? 'Now' : job.endDate.slice(0, 4);
  return from === to ? from : `${from} – ${to}`;
};
const css = (vars: Record<string, string | number>) => vars as CSSProperties;
const MARQUEE = ['Flutter', 'React', 'Next.js', 'Node.js', 'TypeScript', 'React Native', 'AI features', 'Cloudflare'];

// A heading whose lines rise into place one after another.
const Lines = ({ lines, delay = 0 }: { lines: ReactNode[]; delay?: number }) => (
  <>
    {lines.map((line, n) => (
      <span key={n} className="line" style={css({ '--n': n, '--d': `${delay}ms` })}>
        <span>{line}</span>
      </span>
    ))}
  </>
);

const Index = () => {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal each block the first time it scrolls into view.
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          seen.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    el.querySelectorAll('[data-reveal]').forEach((node) => seen.observe(node));
    if (still) return () => seen.disconnect();

    const bar = el.querySelector<HTMLElement>('[data-progress]');
    const band = el.querySelector<HTMLElement>('[data-band]');
    const tilt = el.querySelector<HTMLElement>('.coin-tilt');
    const jobs = [...el.querySelectorAll<HTMLElement>('.job')];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let lastY = window.scrollY;
    let skew = 0;
    let raf = 0;

    const onPointer = (e: PointerEvent) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

      // The band leans into the scroll, harder the faster you go.
      skew += (Math.max(-12, Math.min(12, (y - lastY) * 0.6)) - skew) * 0.12;
      lastY = y;
      if (band) band.style.transform = `skewX(${-skew}deg)`;

      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      if (tilt) {
        tilt.style.setProperty('--tilt-y', `${pointer.x * 16}deg`);
        tilt.style.setProperty('--tilt-x', `${pointer.y * -12}deg`);
      }

      // A card shrinks and dims as the next one slides over it.
      jobs.forEach((job, i) => {
        const next = jobs[i + 1];
        if (!next) return;
        const rect = job.getBoundingClientRect();
        const covered = Math.min(1, Math.max(0, (rect.bottom - next.getBoundingClientRect().top) / rect.height));
        job.style.transform = `scale(${1 - covered * 0.06})`;
        job.style.filter = `brightness(${1 - covered * 0.45})`;
        // A taller card would stick out below the shorter one on top of it, so tuck the extra away.
        const over = rect.bottom - next.getBoundingClientRect().bottom;
        job.style.clipPath = covered > 0 && over > -12 ? `inset(0 0 ${over + 24}px round 22px)` : '';
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      seen.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  useEffect(() => {
    if (open !== null) dialog.current?.showModal();
  }, [open]);

  if (isPdf) return <Resume isPdf />;

  const pdfName = `${basics.name.replace(/\s+/g, '_')}_Resume.pdf`;
  const profiles = [
    ...basics.profiles.map((p) => ({ label: p.network === 'x' ? 'X' : p.network, url: p.url })),
    { label: 'Stack Overflow', url: `https://stackoverflow.com/users/${basics.stackOverflowId}/${basics.stackOverflowUsername}` },
  ];

  return (
    <div ref={root} className="relative overflow-x-clip">
      <div className="grain" aria-hidden="true" />
      <div data-progress aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-1.5 origin-left scale-x-0 bg-accent" />

      <main>
        {/* ---------- Hero ---------- */}
        <section data-reveal className="relative flex min-h-[100svh] flex-col overflow-hidden">
          <header className="label flex items-center justify-between px-5 pt-6 sm:px-12">
            <span>suvajit.in</span>
            <span className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              Open to work
            </span>
          </header>

          <div className="mx-auto grid w-full max-w-7xl flex-1 content-center items-center gap-x-14 gap-y-6 px-5 py-8 sm:px-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative mx-auto mt-[6svh] w-[min(58vw,30svh)] lg:order-2 lg:mt-[8svh] lg:w-[min(34vw,56svh)]">
              <div className="coin-wrap">
                <div className="coin-tilt">
                  <button
                    type="button"
                    className="coin"
                    aria-pressed={flipped}
                    aria-label={flipped ? 'Flip back to the photo' : 'Flip the coin'}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <span className="face halftone -inset-[16%] rounded-full text-foreground/70" style={{ transform: 'translateZ(-50px)' }} />
                    <span className="face inset-0 rounded-full bg-accent" />
                    {/* The photo twice: once cut off by the circle, once with only its top third, so the hair pops out but the elbow does not. */}
                    <span className="face inset-0 overflow-hidden rounded-full" style={{ transform: 'translateZ(40px)' }}>
                      <img src="/suvajit.webp" alt="" className="portrait" draggable={false} />
                    </span>
                    <span className="face inset-0" style={{ transform: 'translateZ(40px)', clipPath: 'inset(-40% -40% 64% -40%)' }}>
                      <img src="/suvajit.webp" alt="Suvajit sipping from a cup and glancing sideways" className="portrait" draggable={false} />
                    </span>

                    <span className="coin-back">
                      <span className="face halftone -inset-[16%] rounded-full text-accent" style={{ transform: 'translateZ(-50px)' }} />
                      <span className="face inset-0 rounded-full bg-foreground" />
                      <span className="face inset-0 flex flex-col items-center justify-center text-background" style={{ transform: 'translateZ(40px)' }}>
                        <span className="display text-[min(13vw,6.5svh)] lg:text-[min(7.5vw,12svh)]">Hire me</span>
                        <span className="mt-2 font-hand text-xl leading-none sm:text-3xl">freelance or full-time</span>
                      </span>
                    </span>
                  </button>
                </div>
              </div>
              <p className="pop pointer-events-none absolute left-[84%] top-[2%] w-max rotate-[8deg] font-hand text-xl leading-none text-accent sm:text-3xl" style={css({ '--d': '1800ms', '--from': '20deg' })}>
                tap to flip
              </p>
            </div>

            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="pop -rotate-3 font-hand text-3xl leading-none text-accent sm:text-5xl" style={css({ '--d': '300ms', '--from': '-12deg' })}>
                hey, I'm Suvajit!
              </p>
              <h1 className="display mt-1 text-[min(25vw,14svh)] lg:text-[min(13.5vw,25svh)]">
                <Lines delay={150} lines={['I ship', <span className="mark" style={css({ '--d': '150ms' })}>apps.</span>]} />
              </h1>
              <p className="pop mt-5 max-w-md text-base leading-snug text-foreground/85 sm:text-xl" style={css({ '--d': '1100ms', '--from': '0deg' })}>
                Senior full-stack engineer. Nine years across ten teams, building mobile apps, web apps, backends and AI features.
              </p>
              <div className="pop mt-6 flex flex-wrap justify-center gap-3 lg:justify-start" style={css({ '--d': '1250ms', '--from': '0deg' })}>
                <a href="#career" className="btn">
                  <ArrowDown className="h-5 w-5" />
                  See my work
                </a>
                <a href={PATHS.PDF.BROWSER_PATH} download={pdfName} className="btn btn-ink">
                  <Download className="h-5 w-5" />
                  Resume PDF
                </a>
              </div>
            </div>
          </div>
        </section>

        <div aria-hidden="true" className="relative z-10 -mx-6 -rotate-1 overflow-hidden bg-accent py-2 font-display text-2xl font-black uppercase text-accent-foreground sm:py-3 sm:text-4xl">
          <div data-band>
            <div className="marquee-track">
              {[0, 1].map((half) => (
                <span key={half} className="flex">
                  {[...MARQUEE, ...MARQUEE].map((word, i) => (
                    <span key={i} className="pr-6">{word} ✶</span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Career ---------- */}
        <section id="career" className="mx-auto max-w-3xl px-5 pb-24 pt-20 sm:px-8 sm:pt-32">
          <div data-reveal>
            <h2 className="display text-[clamp(3.6rem,15vw,8.5rem)]">
              <Lines lines={['Ten teams.', <>Nine <span className="mark">years.</span></>]} />
            </h2>
            <p className="pop mt-4 -rotate-2 font-hand text-2xl leading-none text-accent sm:text-4xl" style={css({ '--d': '500ms' })}>
              keep scrolling, they pile up ↓
            </p>
          </div>

          <div className="mt-12">
            {work.map((job, i) => (
              <article
                key={job.company}
                className="job paper mb-16 last:mb-0"
                style={css({ '--i': i, '--r': `${i % 2 ? 0.8 : -0.8}deg` })}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="label pt-1">{pad(i + 1)} / {pad(work.length)}</span>
                  <span className="display text-4xl sm:text-5xl">{years(job)}</span>
                </div>
                <h3 className="display mt-3 text-[clamp(2.4rem,9vw,4.5rem)]">{job.company.split(' (')[0]}</h3>
                <p className="mt-2 font-bold">{job.position}</p>
                <p className="mt-4 text-lg leading-snug sm:text-xl">
                  <span className="highlight">{job.headline}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {job.technologies.slice(0, 6).map((tech) => (
                    <span key={tech} className="chip">{tech}</span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3 pb-2">
                  <button type="button" className="btn btn-ink text-xl" onClick={() => setOpen(i)}>What I did</button>
                  {job.website && (
                    <a href={job.website} target="_blank" rel="noopener noreferrer" className="btn text-xl">
                      <ArrowUpRight className="h-5 w-5" />
                      Visit
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <details className="mt-16 rounded-[22px] border border-border">
            <summary className="label cursor-pointer p-5">Read the full resume as plain text</summary>
            <div className="border-t border-border p-5">
              <Resume />
            </div>
          </details>
        </section>

        {/* ---------- Projects ---------- */}
        <section id="projects" className="mx-auto max-w-6xl px-5 py-24 sm:px-12">
          <div data-reveal>
            <h2 className="display text-[clamp(3.6rem,15vw,8.5rem)]">
              <Lines lines={['Side', <span className="mark">quests.</span>]} />
            </h2>
            <p className="pop mt-4 -rotate-2 font-hand text-2xl leading-none text-accent sm:text-4xl" style={css({ '--d': '500ms' })}>
              built on my own time
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {projects.map((project, i) => (
              <div key={project.name} data-reveal className={`pop ${i === 0 ? 'md:col-span-2' : ''}`}>
                <div className="sticker paper h-full" style={css({ '--r': `${i % 2 ? 1 : -1}deg` })}>
                  <ProjectCard {...project} className="h-full border-0" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Contact ---------- */}
        <section id="contact" data-reveal className="bg-accent px-5 py-24 text-center text-accent-foreground sm:py-36">
          <h2 className="display text-[min(27vw,30svh)]">
            <Lines lines={['Say', 'hello.']} />
          </h2>
          <p className="pop mt-6 font-hand text-3xl leading-none sm:text-4xl" style={css({ '--d': '500ms' })}>
            freelance project or full-time role, one tap:
          </p>
          <div className="pop mt-8 flex flex-wrap justify-center gap-4" style={css({ '--d': '650ms', '--from': '0deg', '--btn-shadow': 'hsl(80 13% 6% / 0.35)' })}>
            <a href={`mailto:${basics.email}`} className="btn bg-accent-foreground text-accent">
              <Mail className="h-5 w-5" />
              {basics.email}
            </a>
            {profiles.map((profile) => (
              <a key={profile.label} href={profile.url} target="_blank" rel="noopener noreferrer" className="btn bg-foreground">
                {profile.label}
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="label flex flex-wrap items-center justify-between gap-3 px-5 py-6 text-muted-foreground sm:px-12">
        <span>{basics.name} · India</span>
        <a href={PATHS.PDF.BROWSER_PATH} download={pdfName} className="link">Download resume PDF</a>
      </footer>

      <dialog
        ref={dialog}
        className="job-dialog paper"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        {open !== null && (
          <>
            <WorkEntry {...work[open]} expanded />
            <form method="dialog" className="mt-5 pb-2">
              <button className="btn btn-ink text-xl">
                <X className="h-5 w-5" />
                Close
              </button>
            </form>
          </>
        )}
      </dialog>
    </div>
  );
};

export default Index;
