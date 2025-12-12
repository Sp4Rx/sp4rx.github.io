
import React from 'react';
import { cn } from '@/lib/utils';

interface ResumeSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ title, children, className }) => {
  // Map section titles to 8-bit game themed titles (only for display, not for PDF)
  const getRetroTitle = (title: string) => {
    const titleMap: Record<string, string> = {
      'Experience': '[JOB DUNGEONS]',
      'Skills': '[POWER UPS]',
      'Projects': '[PROJECT LOGS]',
      'Education': '[EDU QUEST]',
      'Languages': '[SPELL BOOK]',
      'Interests': '[SIDE QUESTS]'
    };

    return titleMap[title] || title;
  };

  // ATS-friendly heading mapping - these will be used in PDF
  const getATSTitle = (title: string) => {
    const atsTitleMap: Record<string, string> = {
      'Experience': 'Work Experience',
      'Skills': 'Technical Skills',
      'Projects': 'Projects',
      'Education': 'Education',
      'Languages': 'Languages',
      'Interests': 'Interests'
    };

    return atsTitleMap[title] || title;
  };

  return (
    <div className={cn('mb-8 pixel-section', className)}>
      {/* Heading with both retro and ATS-friendly versions */}
      <h2 
        className="pixel-heading resume-heading" 
        data-ats-title={getATSTitle(title)} 
        data-original-title={title}
        data-retro-title={getRetroTitle(title)}
      >
        <span className="retro-title">{getRetroTitle(title)}</span>
        <span className="ats-title">{getATSTitle(title)}</span>
      </h2>
      <div>{children}</div>
    </div>
  );
};

export default ResumeSection;
