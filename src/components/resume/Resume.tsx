
import React, { useState } from 'react';
import ResumeSection from './ResumeSection';
import SkillBar from './SkillBar';
import WorkEntry from './WorkEntry';
import ProjectCard from './ProjectCard';
import { resumeData } from '@/data/resume';
import { useTheme } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { generateResumePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

interface ResumeProps {
  gameState: 'AUTO' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  score: number;
}

const Resume: React.FC<ResumeProps> = ({ gameState, score }) => {
  const { theme, toggleTheme } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const { basics, skills, work, projects, education, languages, interests } = resumeData;

  const handleDownloadResume = async () => {
    try {
      setIsGenerating(true);
      toast.info("Generating PDF...");
      await generateResumePDF(resumeData);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isResumeVisible = gameState === 'AUTO' || gameState === 'PAUSED';

  if (!isResumeVisible) return null;

  return (
    <div className="resume-content overflow-y-auto scrollbar-none max-h-[90vh] shadow-none">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-pixel mb-2">{basics.name}</h1>
          <p className="text-lg text-muted-foreground">{basics.label}</p>
        </div>
        <div className="flex items-center space-x-2">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <p className="text-sm">{basics.summary}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Email: </span>
            <a href={`mailto:${basics.email}`} className="text-primary hover:underline">
              {basics.email}
            </a>
          </p>
          <p>
            <span className="font-semibold">Phone: </span>
            {basics.phone}
          </p>
          <p>
            <span className="font-semibold">Location: </span>
            {basics.location.city}, {basics.location.region}
          </p>
          <div className="flex gap-3 mt-3">
            {basics.profiles.map((profile, index) => (
              <a
                key={index}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.network}
              </a>
            ))}
          </div>
        </div>
      </div>

      <ResumeSection title="Skills">
        {skills.map((skillGroup, groupIndex) => (
          <div key={groupIndex} className="mb-6 last:mb-0">
            <h3 className="text-lg font-semibold mb-3">{skillGroup.group}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {skillGroup.items.map((skill, index) => (
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

      <ResumeSection title="Experience">
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

      <ResumeSection title="Projects">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              name={project.name}
              description={project.description}
              url={project.url}
              highlights={project.highlights}
              technologies={project.technologies}
              githubUrl={project.githubUrl}
            />
          ))}
        </div>
      </ResumeSection>

      <ResumeSection title="Stack Overflow">
        <div className="flex justify-center my-2">
          <a href="https://stackoverflow.com/users/123456/username" target="_blank" rel="noopener noreferrer">
            <img
              src="https://stackoverflow.com/users/flair/123456.png"
              width="208"
              height="58"
              alt="Stack Overflow profile for Username"
              title="Stack Overflow profile for Username"
              className="border border-border rounded"
            />
          </a>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Visit my Stack Overflow profile to see my contributions
        </p>
      </ResumeSection>

      <ResumeSection title="Education">
        {education.map((edu, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h3 className="font-semibold">{edu.institution}</h3>
              <div className="text-sm font-mono">
                {new Date(edu.startDate).getFullYear()} – {new Date(edu.endDate).getFullYear()}
              </div>
            </div>
            <p className="text-md">
              {edu.studyType} in {edu.area} (GPA: {edu.gpa})
            </p>
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Relevant Courses:</p>
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
          </div>
        ))}
      </ResumeSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeSection title="Languages">
          {languages.map((lang, index) => (
            <div key={index} className="flex justify-between mb-2 last:mb-0">
              <span>{lang.language}</span>
              <span className="text-muted-foreground">{lang.fluency}</span>
            </div>
          ))}
        </ResumeSection>

        <ResumeSection title="Interests">
          {interests.map((interest, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <h4 className="font-medium">{interest.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {interest.keywords.map((keyword, keywordIndex) => (
                  <span
                    key={keywordIndex}
                    className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </ResumeSection>
      </div>
    </div>
  );
};

export default Resume;
