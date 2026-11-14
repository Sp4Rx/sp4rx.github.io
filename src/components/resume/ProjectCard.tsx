import React from 'react';
import { ArrowUpRight, GithubIcon } from 'lucide-react';
import { AppStoreIcon } from './AppStoreIcon';
import { PlayStoreIcon } from './PlayStoreIcon';
import { stack, type Layer } from '@/data/resume';

interface ProjectCardProps {
  name: string;
  description: string;
  highlights: string[];
  technologies: string[];
  layers?: Layer[];
  url?: string;
  githubUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  matched?: boolean; // covers what the visitor ticked in the hero
  dimmed?: boolean; // something is ticked and this is not a match
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  highlights,
  technologies,
  layers = [],
  url,
  githubUrl,
  appStoreUrl,
  playStoreUrl,
  matched = false,
  dimmed = false,
  className = '',
}) => {
  const links = [
    url && { href: url, label: 'Visit', icon: <ArrowUpRight className="h-4 w-4" /> },
    githubUrl && { href: githubUrl, label: 'Code', icon: <GithubIcon className="h-4 w-4" /> },
    playStoreUrl && { href: playStoreUrl, label: 'Play Store', icon: <PlayStoreIcon className="h-4 w-4" /> },
    appStoreUrl && { href: appStoreUrl, label: 'App Store', icon: <AppStoreIcon className="h-4 w-4" /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <article
      className={`flex flex-col border bg-card p-5 transition-opacity ${matched ? 'border-foreground' : 'border-border'} ${dimmed ? 'opacity-60' : ''} ${className}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
        {matched && <span className="tag-match">Matches your build</span>}
      </div>
      {layers.length > 0 && (
        <p className="label mb-3">
          {stack.filter((s) => layers.includes(s.id)).map((s) => s.label).join(' · ')}
        </p>
      )}
      <p className="mb-3 leading-relaxed">{description}</p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
        {highlights.map((highlight, index) => (
          <li key={index}>{highlight}</li>
        ))}
      </ul>
      <div className="mb-4 flex flex-wrap gap-1">
        {technologies.map((tech, index) => (
          <span key={index} className="chip">{tech}</span>
        ))}
      </div>
      {links.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2">
          {links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="btn">
              {link.icon}
              {link.label}
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

export default ProjectCard;
