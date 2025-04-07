
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

  return (
    <div className={cn('mb-8 pixel-section', className)}>
      <h2 className="pixel-heading" data-original-title={title}>{getRetroTitle(title)}</h2>
      <div>{children}</div>
    </div>
  );
};

export default ResumeSection;
