
import React, { useState } from 'react';
import ResumeSection from './ResumeSection';
import SkillBar from './SkillBar';
import WorkEntry from './WorkEntry';
import ProjectCard from './ProjectCard';
import { resumeData } from '@/data/resume';
import { useTheme } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PATHS } from '@/constants/paths';

interface ResumeProps {
  gameState: 'AUTO' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  score: number;
}

const Resume: React.FC<ResumeProps> = ({ gameState, score }) => {
  const { theme, toggleTheme } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const { basics, skills, work, projects, education, languages, interests, tools } = resumeData;

  const handleDownloadResume = () => {
    try {
      setIsGenerating(true);
      // Fetch the pre-generated PDF from public directory
      const link = document.createElement('a');
      link.href = PATHS.PDF.BROWSER_PATH;
      link.download = `${basics.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isResumeVisible = gameState === 'AUTO' || gameState === 'PAUSED';

  if (!isResumeVisible) return null;

  return (
    <div className="resume-content overflow-y-auto scrollbar-none max-h-[90vh] shadow-none">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-pixel mb-1">{basics.name}</h1>
          <p className="text-base text-muted-foreground">{basics.designation}</p>
        </div>
        <div id='download-resume' className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadResume}
            disabled={isGenerating}
            className="pixel-button flex items-center gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            <span>Resume</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <p className="text-xs leading-relaxed">{basics.summary}</p>
        </div>
        <div className="space-y-1.5 text-xs">
          <p>
            <span className="font-semibold">Email: </span>
            <a href={`mailto:${basics.email}`} className="text-primary hover:underline">
              {basics.email}
            </a>
          </p>
          {basics.showPhoneNumber && (
            <p>
              <span className="font-semibold">Phone: </span>
              <a href={`tel:${basics.phone.replace(/\s+/g, '')}`} className="text-primary hover:underline">
                {basics.phone}
              </a>
            </p>
          )}
          <p>
            <span className="font-semibold">Location: </span>
            {basics.location.city}, {basics.location.region}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {basics.profiles.map((profile, index) => (
              <a
                key={index}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src={`https://img.shields.io/badge/${profile.network}-${profile.username}-6c5ce7?style=flat-square&logo=${profile.network.toLowerCase()}&logoColor=white&labelColor=555555`}
                  alt={`${profile.network} - ${profile.username}`}
                  className="h-5 pixel-badge"
                />
              </a>
            ))}
          </div>

          {/* Stack Overflow Flare */}
          <div className="mt-2">
            <a href={`https://stackoverflow.com/users/${basics.stackOverflowId}/${basics.stackOverflowUsername}`} target="_blank" rel="noopener noreferrer">
              <img
                src={`https://stackoverflow.com/users/flair/${basics.stackOverflowId}.png`}
                width="208"
                height="58"
                alt={`Stack Overflow profile for ${basics.stackOverflowUsername}`}
                title={`Stack Overflow profile for ${basics.stackOverflowUsername}`}
                className="border border-border rounded"
              />
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Visit my Stack Overflow profile to see my contributions
            </p>
          </div>
        </div>
      </div>

      <ResumeSection title="Experience" className="pixel-section">
        {work.map((job, index) => (
          <WorkEntry
            key={index}
            company={job.company}
            position={job.position}
            startDate={job.startDate}
            endDate={job.endDate}
            summary={job.summary}
            highlights={job.highlights}
            website={job.website}
            technologies={job.technologies || []}
          />
        ))}
      </ResumeSection>

      <ResumeSection title="Skills" className="pixel-section">
        {skills.map((skillGroup, groupIndex) => (
          <div key={groupIndex} className="mb-3 last:mb-0">
            <h3 className="text-xs font-semibold mb-1.5 px-1 bg-secondary/30 rounded-sm inline-block retro-label">{skillGroup.group}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-1.5 items-start">
              {[...skillGroup.items]
                .sort((a, b) => b.level - a.level) // Sort by level in descending order
                .map((skill, index) => (
                  <SkillBar
                    key={index}
                    name={skill.name}
                    level={skill.level}
                    keywords={skill.keywords}
                  />
                ))}
            </div>
          </div>
        ))}
      </ResumeSection>

      <ResumeSection title="Projects" className="pixel-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              name={project.name}
              description={project.description}
              url={project.url}
              highlights={project.highlights}
              technologies={project.technologies}
              githubUrl={project.githubUrl}
              appStoreUrl={project.appStoreUrl}
              playStoreUrl={project.playStoreUrl}
            />
          ))}
        </div>
      </ResumeSection>

      <ResumeSection title="Tools" className="pixel-section">
        <div className="flex flex-wrap gap-1.5">
          {tools.map((tool, index) => (
            <div key={index} className="bg-secondary/50 px-2.5 py-1.5 rounded-md">
              <span className="text-xs font-medium">{tool}</span>
            </div>
          ))}
        </div>
      </ResumeSection>

      <ResumeSection title="Education" className="pixel-section">
        {education.map((edu, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h3 className="font-semibold">{edu.institution}</h3>
              {edu.startDate && edu.endDate && (
                <div className="text-sm font-mono">
                  {new Date(edu.startDate).getFullYear()} – {new Date(edu.endDate).getFullYear()}
                </div>
              )}
            </div>
            <p className="text-sm">
              {edu.studyType && `${edu.studyType} in `}{edu.area}
              {edu.gpa && ` (GPA: ${edu.gpa})`}
            </p>
            {edu.courses && edu.courses.length > 0 && (
              <div className="mt-1.5">
                <p className="text-xs font-medium mb-1">Relevant Courses:</p>
                <div className="flex flex-wrap gap-1">
                  {edu.courses.map((course, courseIndex) => (
                    <span
                      key={courseIndex}
                      className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </ResumeSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResumeSection title="Languages" className="pixel-section">
          <div className="flex flex-wrap gap-1.5">
            {languages.map((lang, index) => (
              <div key={index} className="bg-secondary/50 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                <span className="text-xs font-medium">{lang.language}</span>
                <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">{lang.fluency}</span>
              </div>
            ))}
          </div>
        </ResumeSection>

        <ResumeSection title="Interests" className="pixel-section">
          {interests.map((interest, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <h4 className="font-medium">{interest.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1 mb-1">
                {interest.keywords.map((keyword, keywordIndex) => (
                  <span
                    key={keywordIndex}
                    className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              {interest.links && interest.links.length > 0 && (
                <div className="mt-1">
                  {interest.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLinkIcon className="h-3 w-3" />
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </ResumeSection>
      </div>
    </div>
  );
};

export default Resume;
