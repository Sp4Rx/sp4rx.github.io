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
  matched?: boolean; // covers what the visitor ticked in the hero
  expanded?: boolean; // the PDF shows every highlight
}

const formatDate = (dateString: string) =>
  dateString === 'Present'
    ? dateString
    : new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

const WorkEntry: React.FC<WorkEntryProps> = ({
  company,
  position,
  startDate,
  endDate,
  summary,
  highlights,
  website,
  technologies = [],
  matched = false,
  expanded = false,
}) => {
  const items = highlights.map((highlight, index) => <li key={index}>{highlight}</li>);
  return (
  <div className="work-entry" data-match={matched}>
    <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <h3 className="text-base font-semibold">
        {position} @{' '}
        {website ? (
          <a href={website} target="_blank" rel="noopener noreferrer" className="link">
            {company}
          </a>
        ) : (
          company
        )}
        {matched && <span className="tag-match ml-2 align-middle">Matches your build</span>}
      </h3>
      <div className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {formatDate(startDate)} – {formatDate(endDate)}
      </div>
    </div>

    <p className="mb-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>

    {highlights.length > 0 &&
      (expanded ? (
        <ul className="mb-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">{items}</ul>
      ) : (
        <details className="mb-2">
          <summary>What I did</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">{items}</ul>
        </details>
      ))}

    {technologies.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {technologies.map((tech, index) => (
          <span key={index} className="chip">{tech}</span>
        ))}
      </div>
    )}
  </div>
  );
};

export default WorkEntry;
