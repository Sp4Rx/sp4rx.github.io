
import React from 'react';

interface SkillBarProps {
  name: string;
  level: number;
  keywords?: string[];
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level, keywords }) => {
  return (
    <div className="mb-3 flex flex-col h-full">
      <div className="flex flex-col w-full h-full">
        {/* Skill name */}
        <div className="flex justify-between items-start gap-2 min-h-[1.25rem]">
          <span className="text-xs font-medium break-words flex-1 min-w-0 leading-tight">{name}</span>
        </div>
        {/* Progress bar - fixed height */}
        <div className="retro-progress h-1.5 mt-1 mb-1 flex-shrink-0">
          <div
            className="retro-progress-fill bg-primary/70 h-1.5 rounded-sm"
            style={{ width: `${level}%` }}
          />
        </div>
        {/* Keywords - show all */}
        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 flex-shrink-0 skill-keywords">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="text-[10px] bg-secondary/70 px-1 py-0.5 rounded-sm text-secondary-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillBar;
