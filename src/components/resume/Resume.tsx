import React from 'react';
import ResumeSection from './ResumeSection';
import WorkEntry from './WorkEntry';
import ProjectCard from './ProjectCard';
import { resumeData } from '@/data/resume';

interface ResumeProps {
  isPdf?: boolean; // the PDF adds a contact header and the projects, and expands every role
}

const Resume: React.FC<ResumeProps> = ({ isPdf = false }) => {
  const { basics, skills, work, projects, education, languages, interests, tools } = resumeData;

  const contacts = [
    { label: 'Email', text: basics.email, href: `mailto:${basics.email}` },
    basics.showPhoneNumberInPDF && { label: 'Phone', text: basics.phone, href: `tel:${basics.phone.replace(/\s+/g, '')}` },
    basics.showWebsiteUrlInPDF && { label: 'Website', text: basics.url, href: basics.url },
    ...basics.profiles.map((p) => ({ label: p.network === 'x' ? 'X' : p.network, text: p.username, href: p.url })),
    {
      label: 'Stack Overflow',
      text: basics.stackOverflowUsername,
      href: `https://stackoverflow.com/users/${basics.stackOverflowId}/${basics.stackOverflowUsername}`,
    },
  ].filter(Boolean) as { label: string; text: string; href: string }[];

  return (
    <div className={`resume-content ${isPdf ? 'is-pdf' : ''}`}>
      {isPdf && (
        <header className="pdf-masthead">
          <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{basics.name}</h1>
          <p className="mb-3 text-lg text-muted-foreground">{basics.designation}</p>
          <p className="text-sm leading-relaxed">
            {basics.location.city}, {basics.location.region}
            {contacts.map((c) => (
              <React.Fragment key={c.label}>
                {' | '}
                {c.label}: <a href={c.href} className="underline">{c.text}</a>
              </React.Fragment>
            ))}
          </p>
          </div>
          <div className="pdf-art" aria-hidden="true">
            <svg viewBox="0 0 32 32" className="h-16 w-16">
              <path d="M16 15 5 20.5 16 26l11-5.5z" fill="#fff" stroke="#0C0D0A" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M16 10.5 5 16l11 5.5L27 16z" fill="#fff" stroke="#0C0D0A" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M16 6 5 11.5 16 17l11-5.5z" fill="#D4FF3A" stroke="#0C0D0A" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </div>
        </header>
      )}

      <div className="mb-10">
        <p className="max-w-3xl leading-relaxed">{basics.summary}</p>
        {isPdf && basics.coreSkills && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Core Skills: </span>
            {basics.coreSkills}
          </p>
        )}
      </div>

      <ResumeSection title="Experience">
        {work.map((job, index) => (
          <WorkEntry key={index} {...job} expanded={isPdf} />
        ))}
      </ResumeSection>

      <ResumeSection title="Skills">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {skills.map((group) => (
            <div key={group.group}>
              <dt className="mb-1 text-sm font-semibold">{group.group}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">
                {[...group.items].sort((a, b) => b.level - a.level).map((skill) => skill.name).join(', ')}
              </dd>
            </div>
          ))}
        </dl>
      </ResumeSection>

      {/* On the site the projects have their own section above the resume. */}
      {isPdf && (
        <ResumeSection title="Projects">
          <div className="grid grid-cols-2 gap-3">
            {projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </ResumeSection>
      )}

      <ResumeSection title="Tools">
        <p className="text-sm leading-relaxed text-muted-foreground">{tools.join(', ')}</p>
      </ResumeSection>

      <ResumeSection title="Education">
        {education.map((edu) => (
          <div key={edu.institution} className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
            <p>
              <span className="font-semibold">{edu.institution}</span>
              <span className="block text-sm text-muted-foreground">
                {edu.studyType && `${edu.studyType} in `}{edu.area}
              </span>
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {new Date(edu.startDate).getFullYear()} – {new Date(edu.endDate).getFullYear()}
            </p>
          </div>
        ))}
      </ResumeSection>

      <div className="grid gap-x-8 sm:grid-cols-2">
        <ResumeSection title="Languages">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {languages.map((lang) => `${lang.language} (${lang.fluency})`).join(', ')}
          </p>
        </ResumeSection>

        <ResumeSection title="Interests">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {interests.map((interest, index) => (
              <React.Fragment key={interest.name}>
                {index > 0 && ', '}
                {interest.links?.[0] ? (
                  <a href={interest.links[0].url} target="_blank" rel="noopener noreferrer" className="link">
                    {interest.name}
                  </a>
                ) : (
                  interest.name
                )}
              </React.Fragment>
            ))}
          </p>
        </ResumeSection>
      </div>
    </div>
  );
};

export default Resume;
