
import React from 'react';
import { cn } from '@/lib/utils';

interface ResumeSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ title, children, className }) => {
  return (
    <div className={cn('mb-8', className)}>
      <h2 className="pixel-heading">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default ResumeSection;
