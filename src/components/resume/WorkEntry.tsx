
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
    <div className="mb-8 last:mb-0 border-b border-border pb-6 last:border-0 last:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Company and Date - Left Column */}
        <div className="md:col-span-4">
          <div className="text-xl font-semibold mb-1">
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
              company
            )}
          </div>
          <div className="text-sm font-mono text-muted-foreground">
            {formatDate(startDate)} – {formatDate(endDate)}
          </div>
        </div>

        {/* Position and Details - Right Column */}
        <div className="md:col-span-8">
          <h3 className="font-semibold text-lg mb-2">{position}</h3>
          <p className="mb-3 text-sm">{summary}</p>

          {highlights.length > 0 && (
            <div className="mb-3">
              <ul className="list-disc pl-5 text-sm space-y-1">
                {highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {technologies.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Technologies:</p>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkEntry;
