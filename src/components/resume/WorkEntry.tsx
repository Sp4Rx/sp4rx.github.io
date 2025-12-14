import React from 'react';

interface WorkEntryProps {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
  website?: string;
  technologies?: string[];
}

const WorkEntry: React.FC<WorkEntryProps> = ({
  company,
  position,
  startDate,
  endDate,
  summary,
  highlights,
  website,
  technologies = []
}) => {
  // Format the dates
  const formatDate = (dateString: string) => {
    if (dateString === 'Present') return dateString;

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="mb-4 last:mb-0 border-b border-border pb-3 last:border-0 last:pb-0">
      {/* Header: Company, Position, and Date on same line */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1.5">
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="font-semibold text-base">
              {position}
            </h3>
            <span className="text-primary">@</span>
            <div className="font-semibold text-base -ml-1">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {company}
                </a>
              ) : (
                <span className="text-foreground">{company}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {formatDate(startDate)} – {formatDate(endDate)}
        </div>
      </div>

      {/* Summary */}
      <p className="mb-1.5 text-xs leading-relaxed text-muted-foreground">{summary}</p>

      {/* Highlights */}
      {highlights.length > 0 && (
        <ul className="list-disc pl-4 mb-1.5 text-xs space-y-0.5">
          {highlights.map((highlight, index) => (
            <li key={index} className="leading-relaxed">{highlight}</li>
          ))}
        </ul>
      )}

      {/* Technologies - Inline with highlights */}
      {technologies.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground font-medium">Tech:</span>
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkEntry;
