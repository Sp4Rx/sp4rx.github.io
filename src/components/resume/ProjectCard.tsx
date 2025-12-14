
import React from 'react';
import { ExternalLinkIcon, GithubIcon } from 'lucide-react';
import { AppStoreIcon } from './AppStoreIcon';
import { PlayStoreIcon } from './PlayStoreIcon';

interface ProjectCardProps {
  name: string;
  description: string;
  highlights: string[];
  technologies: string[];
  url?: string;
  githubUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  images?: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  highlights,
  technologies,
  url,
  githubUrl,
  appStoreUrl,
  playStoreUrl
}) => {
  // Count available links for layout
  const hasWebLinks = url || githubUrl;
  const hasStoreLinks = appStoreUrl || playStoreUrl;
  
  return (
    <div className="bg-card/50 p-3 rounded-lg border border-border">
      <div className="flex flex-col gap-2 mb-2">
        <h3 className="font-semibold text-base">{name}</h3>
        
        {/* Web Links Section */}
        {hasWebLinks && (
          <div className="flex gap-1.5 flex-wrap">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-primary text-xs font-pixel transition-colors"
                title="Visit Demo"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                <span>Demo</span>
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-primary text-xs font-pixel transition-colors"
                title="View Source Code"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>Code</span>
              </a>
            )}
          </div>
        )}

        {/* App Store Links Section */}
        {hasStoreLinks && (
          <div className="flex gap-1.5 flex-wrap">
            {playStoreUrl && (
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded text-green-600 dark:text-green-400 text-xs font-pixel transition-colors"
                title="View on Google Play Store"
              >
                <PlayStoreIcon className="h-4 w-4" />
                <span>Play Store</span>
              </a>
            )}
            {appStoreUrl && (
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded text-blue-600 dark:text-blue-400 text-xs font-pixel transition-colors"
                title="View on App Store"
              >
                <AppStoreIcon className="h-4 w-4" />
                <span>App Store</span>
              </a>
            )}
          </div>
        )}
      </div>
      <p className="text-xs mb-2 leading-relaxed">{description}</p>

      <div className="mb-2">
        <div className="text-xs text-muted-foreground mb-1 font-medium">Highlights:</div>
        <ul className="list-disc pl-4 text-xs space-y-0.5">
          {highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex flex-wrap gap-1">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
