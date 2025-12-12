
import React, { useState, useRef, useEffect } from 'react';

interface SkillBarProps {
  name: string;
  level: number;
  keywords?: string[];
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level, keywords }) => {
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  
  // #region agent log
  useEffect(() => {
    if (nameRef.current && containerRef.current && percentageRef.current) {
      const nameEl = nameRef.current;
      const containerEl = containerRef.current;
      const percentageEl = percentageRef.current;
      
      const nameRect = nameEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const percentageRect = percentageEl.getBoundingClientRect();
      
      const nameHeight = nameEl.offsetHeight;
      const nameScrollHeight = nameEl.scrollHeight;
      const containerHeight = containerEl.offsetHeight;
      const nameComputedStyle = window.getComputedStyle(nameEl);
      const containerComputedStyle = window.getComputedStyle(containerEl);
      const lineHeight = parseFloat(nameComputedStyle.lineHeight || '0');
      const isWrapping = nameScrollHeight > lineHeight;
      
      // Calculate vertical alignment
      const nameTopOffset = nameRect.top - containerRect.top;
      const percentageTopOffset = percentageRect.top - containerRect.top;
      const verticalAlignment = percentageTopOffset - nameTopOffset;
      
      fetch('http://127.0.0.1:7243/ingest/02d022e7-057f-4550-8694-1c48517898ac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'SkillBar.tsx:useEffect',
          message: 'SkillBar layout measurements',
          data: {
            skillName: name,
            nameHeight,
            nameScrollHeight,
            containerHeight,
            isWrapping,
            lineHeight,
            nameTopOffset,
            percentageTopOffset,
            verticalAlignment,
            alignItems: containerComputedStyle.alignItems,
            minHeight: containerComputedStyle.minHeight,
            display: containerComputedStyle.display
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'A,C'
        })
      }).catch(() => {});
    }
  }, [name]);
  // #endregion

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
    <div className="mb-3 flex flex-col h-full">
      <div className="flex flex-col w-full h-full">
        {/* Skill name and percentage row - align to top for proper wrapping alignment */}
        <div ref={containerRef} className="flex justify-between items-start gap-2 min-h-[1.25rem]">
          <span ref={nameRef} className="text-xs font-medium break-words flex-1 min-w-0 leading-tight">{name}</span>
          <span ref={percentageRef} className="text-xs text-muted-foreground font-pixel flex-shrink-0 whitespace-nowrap pt-0.5">{level}%</span>
        </div>
        {/* Progress bar - fixed height */}
        <div className="retro-progress h-1.5 mt-1 mb-1 flex-shrink-0">
          <div
            className={`retro-progress-fill ${getColor()} h-1.5 rounded-sm`}
            style={{ width: `${level}%` }}
          />
        </div>
        {/* Keywords - can expand */}
        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 flex-shrink-0">
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
