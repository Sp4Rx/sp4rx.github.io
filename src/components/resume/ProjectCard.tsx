
import React from 'react';
import { ExternalLinkIcon, GithubIcon, ImageIcon } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  description: string;
  highlights: string[];
  technologies: string[];
  url?: string;
  githubUrl?: string;
  imageUrl?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  highlights,
  technologies,
  url,
  githubUrl,
  imageUrl
}) => {
  return (
    <div className="bg-card/50 p-4 rounded-lg border border-border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{name}</h3>
        <div className="flex gap-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs"
              title="Visit Demo"
            >
              <ExternalLinkIcon className="h-4 w-4" />
              <span>Demo</span>
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs"
              title="View Source Code"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Code</span>
            </a>
          )}
        </div>
      </div>
      <p className="text-sm mb-2">{description}</p>

      {imageUrl && (
        <div className="mb-3 border border-border rounded overflow-hidden">
          <img
            src={imageUrl}
            alt={`Screenshot of ${name}`}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-1 font-medium">Highlights:</div>
        <ul className="list-disc pl-4 text-xs space-y-1">
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
