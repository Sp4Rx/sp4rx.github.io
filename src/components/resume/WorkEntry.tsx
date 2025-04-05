
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
    <div className="mb-6 last:mb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
        <h3 className="font-semibold text-lg">{position}</h3>
        <div className="text-sm font-mono">
          {formatDate(startDate)} – {formatDate(endDate)}
        </div>
      </div>
      <div className="text-md font-medium mb-2">
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
      <p className="mb-2 text-sm">{summary}</p>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {highlights.map((highlight, index) => (
          <li key={index}>{highlight}</li>
        ))}
      </ul>
      
      {technologies.length > 0 && (
        <div className="mt-3">
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
  );
};

export default WorkEntry;
