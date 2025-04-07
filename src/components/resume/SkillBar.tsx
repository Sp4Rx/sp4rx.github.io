
import React from 'react';

interface SkillBarProps {
  name: string;
  level: number;
  keywords?: string[];
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level, keywords }) => {
  // Determine color based on skill level using professional colors
  const getColor = () => {
    if (level >= 90) return 'bg-violet-500';
    if (level >= 80) return 'bg-indigo-500';
    if (level >= 70) return 'bg-blue-500';
    if (level >= 60) return 'bg-sky-500';
    if (level >= 50) return 'bg-cyan-500';
    return 'bg-amber-500';
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs font-mono">{level}%</span>
      </div>
      <div className="retro-progress">
        <div
          className={`retro-progress-fill ${getColor()}`}
          style={{ width: `${level}%` }}
        />
      </div>
      {keywords && keywords.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillBar;
