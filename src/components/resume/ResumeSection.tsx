import React from 'react';

// ATS parsers look for these exact headings, so the short titles map to them.
const atsTitles: Record<string, string> = {
  Experience: 'Work Experience',
  Skills: 'Technical Skills',
  Projects: 'Personal Projects',
  Tools: 'Development Tools',
};

const ResumeSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-10 last:mb-0">
    <h2 className="resume-heading">{atsTitles[title] || title}</h2>
    <div>{children}</div>
  </div>
);

export default ResumeSection;
