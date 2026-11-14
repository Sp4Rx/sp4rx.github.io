import { useState } from 'react';
import { Download, Mail, Moon, Sun } from 'lucide-react';
import Hero from '@/components/site/Hero';
import Resume from '@/components/resume/Resume';
import ProjectCard from '@/components/resume/ProjectCard';
import { resumeData, type Layer } from '@/data/resume';
import { matches, mailto } from '@/lib/match';
import { PATHS } from '@/constants/paths';

// The PDF script loads the page with ?pdf and prints only the resume.
const isPdf = new URLSearchParams(window.location.search).has('pdf');

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Private mode can block storage; the toggle still works for this visit.
    }
    setDark(next);
  };
  return (
    <button type="button" onClick={toggle} className="btn px-3" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

const Index = () => {
  const [picked, setPicked] = useState<Layer[]>([]);
  const toggle = (layer: Layer) =>
    setPicked((now) => (now.includes(layer) ? now.filter((l) => l !== layer) : [...now, layer]));

  if (isPdf) return <Resume isPdf />;

  const { basics, projects } = resumeData;
  const pdfName = `${basics.name.replace(/\s+/g, '_')}_Resume.pdf`;
  // Matches float to the top; the sort is stable, so Pitaara leads whenever it ties.
  const sorted = [...projects].sort((a, b) => Number(matches(b, picked)) - Number(matches(a, picked)));
  const profiles = [
    ...basics.profiles.map((p) => ({ label: p.network === 'x' ? 'X' : p.network, url: p.url })),
    { label: 'Stack Overflow', url: `https://stackoverflow.com/users/${basics.stackOverflowId}/${basics.stackOverflowUsername}` },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <a href="#top" className="text-lg font-extrabold tracking-tight">{basics.name}</a>
          <nav className="flex items-center gap-2">
            <a href="#work" className="link hidden px-2 text-sm sm:inline">Work</a>
            <a href="#resume" className="link hidden px-2 text-sm sm:inline">Resume</a>
            <a href="#contact" className="link hidden px-2 text-sm sm:inline">Contact</a>
            <a href={PATHS.PDF.BROWSER_PATH} download={pdfName} className="btn">
              <Download className="h-4 w-4" />
              PDF
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="top">
        <Hero picked={picked} toggle={toggle} />

        <section id="work" className="border-t border-foreground">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="label mb-2">Work</p>
            <h2 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-5xl">Things I've built</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sorted.map((project, index) => (
                <ProjectCard
                  key={project.name}
                  {...project}
                  matched={matches(project, picked)}
                  dimmed={picked.length > 0 && !matches(project, picked)}
                  className={index === 0 ? 'md:col-span-2' : ''}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="resume" className="border-t border-foreground">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="label mb-2">Resume</p>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Where I've worked</h2>
              <a href={PATHS.PDF.BROWSER_PATH} download={pdfName} className="btn">
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </div>
            <Resume picked={picked} />
          </div>
        </section>

        <section id="contact" className="border-t border-foreground">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="label mb-2">Contact</p>
            <h2 className="mb-6 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">Got something to build?</h2>
            <a href={mailto(basics.email, picked)} className="btn btn-accent text-base">
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
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
