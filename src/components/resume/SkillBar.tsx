
import React, { useState } from 'react';

interface SkillBarProps {
  name: string;
  level: number;
  keywords?: string[];
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level, keywords }) => {
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  // Determine color based on skill level using professional colors
  const getColor = () => {
    if (level >= 90) return 'bg-violet-500';
    if (level >= 80) return 'bg-indigo-500';
    if (level >= 70) return 'bg-blue-500';
    if (level >= 60) return 'bg-sky-500';
    if (level >= 50) return 'bg-cyan-500';
    return 'bg-amber-500';
  };

  const toggleKeywords = () => {
    setShowAllKeywords(!showAllKeywords);
  };

  return (
    <div className="mb-3 flex flex-col">
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium break-words w-[70%]">{name}</span>
          <span className="text-xs text-muted-foreground font-pixel">{level}%</span>
        </div>
        <div className="retro-progress h-1.5 mt-1 mb-1">
          <div
            className={`retro-progress-fill ${getColor()} h-1.5 rounded-sm`}
            style={{ width: `${level}%` }}
          />
        </div>
        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {(showAllKeywords ? keywords : keywords.slice(0, 3)).map((keyword, index) => (
              <span
                key={index}
                className="text-[10px] bg-secondary/70 px-1 py-0.5 rounded-sm text-secondary-foreground"
              >
                {keyword}
              </span>
            ))}
            {!showAllKeywords && keywords.length > 3 && (
              <span
                className="text-[10px] text-primary hover:underline cursor-pointer"
                onClick={toggleKeywords}
              >
                +{keywords.length - 3} more
              </span>
            )}
            {showAllKeywords && (
              <span
                className="text-[10px] text-primary hover:underline cursor-pointer"
                onClick={toggleKeywords}
              >
                Show less
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillBar;
