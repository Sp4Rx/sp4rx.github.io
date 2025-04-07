
import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { ExternalLinkIcon, GithubIcon, ImageIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface ProjectCardProps {
  name: string;
  description: string;
  highlights: string[];
  technologies: string[];
  url?: string;
  githubUrl?: string;
  images?: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  highlights,
  technologies,
  url,
  githubUrl,
  images = []
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to register as swipe
  const minSwipeDistance = 50;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Touch event handlers for swipe detection
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      handleNextImage();
    } else if (isRightSwipe && images.length > 1) {
      handlePrevImage();
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };
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
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-pixel"
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
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-pixel"
              title="View Source Code"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Code</span>
            </a>
          )}
        </div>
      </div>
      <p className="text-sm mb-2">{description}</p>

      {images && images.length > 0 && (
        <div
          ref={carouselRef}
          className="mb-3 border border-border rounded overflow-hidden relative select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="carousel-container transition-transform duration-300 ease-in-out">
            <img
              src={images[currentImageIndex]}
              alt={`Screenshot of ${name}`}
              className="w-full h-auto object-cover aspect-video"
              draggable="false"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-4 w-4 text-white" />
              </button>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
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
