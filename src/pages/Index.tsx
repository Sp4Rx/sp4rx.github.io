import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Download, Mail, X } from 'lucide-react';
import Resume from '@/components/resume/Resume';
import WorkEntry from '@/components/resume/WorkEntry';
import ProjectCard from '@/components/resume/ProjectCard';
import { resumeData } from '@/data/resume';
import { startParticles, type SceneState } from '@/lib/particles';
import { cardPose, clamp01 } from '@/lib/scene';
import { PATHS } from '@/constants/paths';

// The PDF script loads the page with ?pdf and prints only the resume.
const isPdf = new URLSearchParams(window.location.search).has('pdf');
// Visitors who ask for reduced motion get the same content as a plain page.
const animated = !isPdf && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Viewport heights of scrolling between one career card and the next.
const STEP = 0.8;

const { basics, work, projects } = resumeData;
const pad = (n: number) => String(n).padStart(2, '0');
const years = (job: (typeof work)[number]) => {
  const from = job.startDate.slice(0, 4);
  const to = job.endDate === 'Present' ? 'Now' : job.endDate.slice(0, 4);
  return from === to ? from : `${from} – ${to}`;
};

const Index = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const corridor = useRef<HTMLElement>(null);
  const contact = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!animated) return;
    let alive = true;
    let raf = 0;
    let shown = 0;
    let draw: ((state: SceneState, timeMs: number) => void) | null = null;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    if (canvas.current) {
      startParticles(canvas.current, '/portrait.png', ['SAY', 'HELLO']).then((fn) => {
        if (alive) draw = fn;
      });
    }

    const onPointer = (e: PointerEvent) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame);
      const vh = window.innerHeight;
      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;

      // Which card is in focus, as a fraction: 2.5 is halfway between the third and fourth.
      const scrolled = corridor.current ? -corridor.current.getBoundingClientRect().top : 0;
      const position = Math.min(work.length - 1, Math.max(0, scrolled / (vh * STEP)));
      cards.current.forEach((el, i) => {
        if (!el) return;
        const depth = i - position;
        const pose = cardPose(depth);
        const side = i % 2 ? 1 : -1;
        el.style.transform = `translate(-50%, -50%) translate3d(${side * pose.spread * 62}vw, ${pose.spread * -5}vh, ${pose.z}px)`;
        // Siblings are not depth-sorted by the browser here, so the nearest card is put on top by hand.
        el.style.zIndex = String(100 - Math.round(Math.abs(depth) * 10));
        el.style.opacity = String(pose.opacity);
        el.style.pointerEvents = pose.focused ? 'auto' : 'none';
      });
      if (Math.round(position) !== shown) {
        shown = Math.round(position);
        setActive(shown);
      }

      const contactTop = contact.current ? contact.current.getBoundingClientRect().top : vh;
      draw?.(
        {
          scatter: clamp01(window.scrollY / (vh * 0.7)),
          text: clamp01((vh * 0.8 - contactTop) / (vh * 0.8)),
          travel: window.scrollY / (vh * 7) + time * 0.00001,
          pointerX: pointer.x,
          pointerY: pointer.y,
        },
        time,
      );
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
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
  // Scrolls so that card i is the one in focus. Also keeps keyboard focus and the view in step.
  const goToCard = (i: number) => {
    if (!corridor.current) return;
    const top = corridor.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + i * STEP * window.innerHeight });
  };

  return (
    <>
      {animated && <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full" />}

      <header className="fixed inset-x-0 top-0 z-20 border-b border-border bg-background/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <a href="#top" className="font-mono text-sm font-bold uppercase tracking-widest">{basics.name}</a>
          <nav className="flex items-center gap-2">
            <a href="#career" className="link hidden px-2 font-mono text-xs uppercase tracking-wider sm:inline">Career</a>
            <a href="#projects" className="link hidden px-2 font-mono text-xs uppercase tracking-wider sm:inline">Projects</a>
            <a href="#contact" className="link hidden px-2 font-mono text-xs uppercase tracking-wider sm:inline">Contact</a>
            <a href={PATHS.PDF.BROWSER_PATH} download={pdfName} className="btn">
              <Download className="h-4 w-4" />
              Resume PDF
            </a>
          </nav>
        </div>
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-20 sm:px-6 sm:pb-16">
          <p className="label mb-3">// {basics.designation}</p>
          <h1 className="text-6xl font-extrabold leading-[0.9] tracking-tight sm:text-8xl">
            Suvajit
            <br />
            Sarkar
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Nine years and ten teams, building mobile apps, web apps, backends and AI features.
          </p>
          <a href="#career" className="btn btn-accent mt-6 self-start">
            <ArrowDown className="h-4 w-4" />
            Scroll through my career
          </a>
        </section>

        {animated ? (
          <section
            id="career"
            ref={corridor}
            aria-label="Career"
            style={{ height: `${((work.length - 1) * STEP + 1) * 100}svh` }}
          >
            <div className="corridor-view">
              {work.map((job, i) => (
                <article
                  key={job.company}
                  ref={(el) => (cards.current[i] = el)}
                  className="career-card"
                  onFocus={() => goToCard(i)}
                >
                  <div className="label flex justify-between gap-4">
                    <span>{pad(i + 1)} / {pad(work.length)}</span>
                    <span>{years(job)}</span>
                  </div>
                  <h2 className="mt-3 text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">{job.company}</h2>
                  <p className="mt-2 text-muted-foreground">{job.position}</p>
                  <p className="mt-5 border-l-2 border-accent pl-3 text-lg leading-snug">{job.headline}</p>
                  <div className="mt-5 flex flex-wrap gap-1">
                    {job.technologies.slice(0, 6).map((tech) => (
                      <span key={tech} className="chip">{tech}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button type="button" className="btn btn-accent" onClick={() => setOpen(i)}>What I did</button>
                    {job.website && (
                      <a href={job.website} target="_blank" rel="noopener noreferrer" className="btn">
                        <ArrowUpRight className="h-4 w-4" />
                        Visit
                      </a>
                    )}
                  </div>
                </article>
              ))}

              <nav aria-label="Jump to a role" className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-1.5 px-4">
                {work.map((job, i) => (
                  <button
                    key={job.company}
                    type="button"
                    aria-label={`${job.company}, ${years(job)}`}
                    aria-current={i === active}
                    onClick={() => goToCard(i)}
                    className="flex h-8 w-6 items-center sm:w-8"
                  >
                    <span className={`block h-1 w-full ${i === active ? 'bg-accent' : 'bg-foreground/30'}`} />
                  </button>
                ))}
              </nav>
            </div>
          </section>
        ) : (
          <section id="career" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <Resume />
          </section>
        )}

        <section id="projects" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <p className="label mb-2">// Side projects</p>
          <h2 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-6xl">Built on my own time</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard key={project.name} {...project} className={index === 0 ? 'md:col-span-2' : ''} />
            ))}
          </div>

          {animated && (
            <details className="mt-10 border border-border bg-background">
              <summary className="cursor-pointer p-5 font-mono text-xs font-bold uppercase tracking-wider">
                Read the full resume as plain text
              </summary>
              <div className="border-t border-border p-5">
                <Resume />
              </div>
            </details>
          )}
        </section>

        <section id="contact" ref={contact} className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-12 sm:px-6 sm:pb-16">
          <p className="label mb-3">// Contact</p>
          <h2 className={animated ? 'sr-only' : 'mb-6 text-6xl font-extrabold tracking-tight'}>Say hello</h2>
          <p className="mb-6 max-w-md text-lg text-muted-foreground">
            Open to freelance projects and full-time roles.
          </p>
          <a href={`mailto:${basics.email}`} className="btn btn-accent self-start text-sm">
            <Mail className="h-4 w-4" />
            {basics.email}
          </a>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {profiles.map((profile) => (
              <li key={profile.label}>
                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="link">{profile.label}</a>
              </li>
            ))}
          </ul>
          <p className="label mt-8">{basics.location.city}, {basics.location.region}, India</p>
        </section>
      </main>

      <dialog
        ref={dialog}
        className="job-dialog"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        {open !== null && (
          <>
            <WorkEntry {...work[open]} expanded />
            <form method="dialog" className="mt-5">
              <button className="btn">
                <X className="h-4 w-4" />
                Close
              </button>
            </form>
          </>
        )}
      </dialog>
    </>
  );
};

export default Index;
