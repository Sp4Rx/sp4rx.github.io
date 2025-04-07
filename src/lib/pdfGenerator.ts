
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type ResumeData = typeof import('@/data/resume').resumeData;

export const generateResumePDF = async (data: ResumeData): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF with 8-bit pixel theme colors
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Set 8-bit pixel theme colors
      const colors = {
        background: '#f7f7fa', // light background
        primary: '#6c5ce7',   // purple primary
        secondary: '#e6e6e9',  // light gray secondary
        text: '#191919',      // dark text
        accent: '#6c5ce7',    // accent color
        border: '#000000',     // border color
        snakeHead: '#a487ff', // snake head color
        snakeBody: '#b59dff', // snake body color
        snakeTail: '#d4c9ff', // snake tail color
        skillBarBg: '#e6e6e9', // skill bar background
        skillBarFill: '#6c5ce7' // skill bar fill
      };

      // Function to add page with consistent styling
      const addStyledPage = (isFirstPage = false) => {
        if (!isFirstPage) {
          doc.addPage();
        }

        // Add background color
        doc.setFillColor(colors.background);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Add header bar
        doc.setFillColor(colors.primary);
        doc.rect(0, 0, pageWidth, 15, 'F');

        // Add footer with retro styling
        doc.setFillColor(colors.primary);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setTextColor(colors.background);
        doc.setFontSize(8);
        doc.setFont('courier', 'normal');
        doc.text('Generated with Pixel Resume Game', pageWidth / 2 - 30, pageHeight - 7);

        // Add decorative pixel border
        doc.setDrawColor(colors.border);
        doc.setLineWidth(1);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');

        // Add 8-bit pixel snake border on each page
        drawPixelSnake(doc, pageWidth, pageHeight);
      };

      // Function to draw 8-bit pixel snake around the page
      const drawPixelSnake = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
        const segmentSize = 5;
        const snakeSegments = [];

        // Create snake segments along the top (going right)
        for (let x = 20; x < pageWidth - 25; x += segmentSize) {
          snakeSegments.push({ x, y: 20 });
        }

        // Create snake segments along the right side (going down)
        for (let y = 20; y < pageHeight - 25; y += segmentSize) {
          snakeSegments.push({ x: pageWidth - 25, y });
        }

        // Create snake segments along the bottom (going left)
        for (let x = pageWidth - 25; x > 20; x -= segmentSize) {
          snakeSegments.push({ x, y: pageHeight - 25 });
        }

        // Create snake segments along the left side (going up)
        for (let y = pageHeight - 25; y > 20; y -= segmentSize) {
          snakeSegments.push({ x: 20, y });
        }

        // Draw the snake segments with gradient coloring
        snakeSegments.forEach((segment, index) => {
          // Calculate color based on position in snake
          let color;
          const position = index / snakeSegments.length;

          if (position < 0.1) {
            color = colors.snakeHead; // Head of snake
          } else if (position < 0.3) {
            color = colors.snakeBody; // Body of snake
          } else {
            color = colors.snakeTail; // Tail of snake
          }

          doc.setFillColor(color);
          doc.rect(segment.x, segment.y, segmentSize, segmentSize, 'F');
          doc.setDrawColor(colors.border);
          doc.setLineWidth(0.2);
          doc.rect(segment.x, segment.y, segmentSize, segmentSize, 'S');
        });
      };

      // Initialize first page with styling
      addStyledPage(true);

      // Set title with pixel-like styling
      doc.setTextColor(colors.text);
      doc.setFontSize(24);
      doc.setFont('courier', 'bold'); // Use monospace font for pixel-like appearance
      doc.text(data.basics.name.toUpperCase(), 20, 25);

      // Set role and contact information
      doc.setFontSize(12);
      doc.setFont('courier', 'normal');
      doc.text(data.basics.label, 20, 32);

      // Contact details
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      doc.text(`Email: ${data.basics.email}`, pageWidth - 90, 25);
      doc.text(`Phone: ${data.basics.phone}`, pageWidth - 90, 30); // Always show phone in PDF
      doc.text(`Location: ${data.basics.location.city}, ${data.basics.location.region}`, pageWidth - 90, 35);

      // Summary section with colored background
      doc.setFillColor(colors.secondary);
      doc.rect(20, 45, pageWidth - 40, 20, 'F');

      doc.setTextColor(colors.primary);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('SUMMARY', 25, 52);
      doc.setTextColor(colors.text);
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');

      // Handle long text wrapping
      const splitSummary = doc.splitTextToSize(data.basics.summary, pageWidth - 50);
      doc.text(splitSummary, 25, 60);

      let yPosition = 60 + splitSummary.length * 5;

      // Skills section with retro styling
      yPosition += 10;
      doc.setFillColor(colors.secondary);
      doc.rect(20, yPosition - 7, pageWidth - 40, 15, 'F');
      doc.setTextColor(colors.primary);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('SKILLS', 25, yPosition);
      yPosition += 10;
      doc.setTextColor(colors.text);
      doc.setFont('courier', 'normal');

      // Handle grouped skills format
      data.skills.forEach((skillGroup) => {
        doc.setFontSize(11);
        doc.setFont('courier', 'bold');
        doc.text(skillGroup.group, 25, yPosition);
        yPosition += 5;
        doc.setFont('courier', 'normal');

        // Create two columns for skills
        let leftColumn = true;
        const startY = yPosition;
        let maxRightY = yPosition;

        skillGroup.items.forEach((skill) => {
          const xPos = leftColumn ? 30 : pageWidth / 2 + 5;

          // Draw skill name and level
          doc.setFontSize(10);
          doc.text(`${skill.name} (${skill.level}%)`, xPos, yPosition);
          yPosition += 5;

          // Draw skill bar
          const barWidth = 60;
          const filledWidth = (skill.level / 100) * barWidth;

          // Draw background bar
          doc.setDrawColor(colors.border);
          doc.setFillColor(colors.skillBarBg);
          doc.rect(xPos, yPosition - 3, barWidth, 4, 'F');
          doc.setLineWidth(0.2);
          doc.rect(xPos, yPosition - 3, barWidth, 4, 'S');

          // Draw filled portion based on skill level
          doc.setFillColor(colors.skillBarFill);
          if (filledWidth > 0) {
            doc.rect(xPos, yPosition - 3, filledWidth, 4, 'F');
          }

          // Add keywords if they exist
          if (skill.keywords && skill.keywords.length > 0) {
            yPosition += 6;
            doc.setFontSize(8);
            doc.setFont('courier', 'italic');

            let keywordX = xPos + 5;
            skill.keywords.forEach((keyword) => {
              const textWidth = doc.getTextWidth(keyword) + 4;

              // Check if we need to move to next line
              if (keywordX + textWidth > (leftColumn ? pageWidth / 2 - 10 : pageWidth - 30)) {
                yPosition += 5;
                keywordX = xPos + 5;
              }

              // Draw keyword badge with pixel-like appearance
              doc.setFillColor(colors.secondary);
              doc.rect(keywordX, yPosition - 3, textWidth, 5, 'F');
              doc.setDrawColor(colors.border);
              doc.setLineWidth(0.2);
              doc.rect(keywordX, yPosition - 3, textWidth, 5, 'S');
              doc.setTextColor(colors.text);
              doc.text(keyword, keywordX + 2, yPosition);

              keywordX += textWidth + 5;
            });

            doc.setFont('courier', 'normal');
          }

          yPosition += 8;

          if (leftColumn) {
            leftColumn = false;
          } else {
            leftColumn = true;
            maxRightY = Math.max(maxRightY, yPosition);
            yPosition = startY;
          }
        });

        // Ensure we move to the maximum Y position after processing a skill group
        yPosition = maxRightY + 5;
      });

      // Work experience section with retro styling
      yPosition += 10;
      doc.setFillColor(colors.secondary);
      doc.rect(20, yPosition - 7, pageWidth - 40, 15, 'F');
      doc.setTextColor(colors.primary);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('EXPERIENCE', 25, yPosition);
      yPosition += 10;
      doc.setTextColor(colors.text);

      // Check if we need a new page
      if (yPosition > 220) {
        addStyledPage();
        yPosition = 30;
      }

      data.work.forEach((job) => {
        // Format dates
        const startDate = new Date(job.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const endDate = job.endDate === 'Present' ? 'Present' : new Date(job.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        // Check if we need a new page
        if (yPosition > 220) {
          addStyledPage();
          yPosition = 30;
        }

        // Add job title with retro styling
        doc.setFillColor(colors.primary);
        doc.setTextColor(colors.background);
        doc.setFontSize(10);
        doc.setFont('courier', 'bold');

        // Draw a background for the job title
        doc.rect(25, yPosition - 4, pageWidth - 110, 6, 'F');
        doc.text(`${job.position}`, 27, yPosition);

        // Add date on the right
        doc.setTextColor(colors.text);
        doc.setFont('courier', 'normal');
        doc.text(`${startDate} - ${endDate}`, pageWidth - 65, yPosition);
        yPosition += 7;

        // Company name with slight emphasis
        doc.setFont('courier', 'bold');
        doc.text(`${job.company}`, 25, yPosition);
        doc.setFont('courier', 'normal');
        yPosition += 5;

        // Job summary
        const splitSummary = doc.splitTextToSize(job.summary, pageWidth - 50);
        doc.text(splitSummary, 25, yPosition);
        yPosition += splitSummary.length * 5;

        // Highlights with pixel-style bullets
        doc.setFontSize(9);
        job.highlights.forEach((highlight) => {
          const splitHighlight = doc.splitTextToSize(`■ ${highlight}`, pageWidth - 55);
          doc.text(splitHighlight, 30, yPosition);
          yPosition += splitHighlight.length * 5;
        });

        // Technologies with retro badge styling
        if (job.technologies && job.technologies.length > 0) {
          doc.setFontSize(8);
          doc.text('Technologies:', 25, yPosition);

          let techX = 65;
          job.technologies.forEach((tech) => {
            const textWidth = doc.getTextWidth(tech) + 4;

            // Check if we need to move to next line
            if (techX + textWidth > pageWidth - 30) {
              yPosition += 7;
              techX = 65;
            }

            // Draw tech badge with pixel-like appearance
            doc.setFillColor(colors.secondary);
            doc.rect(techX, yPosition - 3, textWidth, 5, 'F');
            doc.setDrawColor(colors.border);
            doc.setLineWidth(0.2);
            doc.rect(techX, yPosition - 3, textWidth, 5, 'S');
            doc.setTextColor(colors.text);
            doc.text(tech, techX + 2, yPosition);

            techX += textWidth + 5;
          });

          yPosition += 10;
        } else {
          yPosition += 8;
        }
      });

      // Projects section with retro styling
      // Check if we need a new page
      if (yPosition > 220) {
        addStyledPage();
        yPosition = 30;
      }

      doc.setFillColor(colors.secondary);
      doc.rect(20, yPosition - 7, pageWidth - 40, 15, 'F');
      doc.setTextColor(colors.primary);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('PROJECTS', 25, yPosition);
      yPosition += 10;
      doc.setTextColor(colors.text);

      data.projects.forEach((project) => {
        // Check if we need a new page
        if (yPosition > 220) {
          addStyledPage();
          yPosition = 30;
        }

        // Project name with retro styling
        doc.setFillColor(colors.primary);
        doc.setTextColor(colors.background);
        doc.setFontSize(10);
        doc.setFont('courier', 'bold');

        // Draw a background for the project name
        doc.rect(25, yPosition - 4, pageWidth / 2 - 30, 6, 'F');
        doc.text(`${project.name}`, 27, yPosition);
        doc.setTextColor(colors.text);
        doc.setFont('courier', 'normal');
        yPosition += 7;

        // Project description with better formatting
        const splitDescription = doc.splitTextToSize(project.description, pageWidth - 50);
        doc.text(splitDescription, 25, yPosition);
        yPosition += splitDescription.length * 5 + 2;

        // Project highlights with pixel-style bullets
        doc.setFontSize(9);
        project.highlights.forEach((highlight) => {
          const splitHighlight = doc.splitTextToSize(`■ ${highlight}`, pageWidth - 55);
          doc.text(splitHighlight, 30, yPosition);
          yPosition += splitHighlight.length * 5;
        });

        // Technologies with retro badge styling
        doc.setFontSize(8);
        doc.text('Technologies:', 25, yPosition);
        yPosition += 5;

        let techX = 30;
        project.technologies.forEach((tech) => {
          const textWidth = doc.getTextWidth(tech) + 4;

          // Check if we need to move to next line
          if (techX + textWidth > pageWidth - 30) {
            yPosition += 7;
            techX = 30;
          }

          // Draw tech badge with pixel-like appearance
          doc.setFillColor(colors.secondary);
          doc.rect(techX, yPosition - 3, textWidth, 5, 'F');
          doc.setDrawColor(colors.border);
          doc.setLineWidth(0.2);
          doc.rect(techX, yPosition - 3, textWidth, 5, 'S');
          doc.setTextColor(colors.text);
          doc.text(tech, techX + 2, yPosition);

          techX += textWidth + 5;
        });

        yPosition += 10;
      });

      // Education section with retro styling
      // Check if we need a new page
      if (yPosition > 220) {
        addStyledPage();
        yPosition = 30;
      }

      doc.setFillColor(colors.secondary);
      doc.rect(20, yPosition - 7, pageWidth - 40, 15, 'F');
      doc.setTextColor(colors.primary);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('EDUCATION', 25, yPosition);
      yPosition += 10;
      doc.setTextColor(colors.text);

      data.education.forEach((edu) => {
        // Check if we need a new page
        if (yPosition > 220) {
          addStyledPage();
          yPosition = 30;
        }

        const startYear = new Date(edu.startDate).getFullYear();
        const endYear = new Date(edu.endDate).getFullYear();

        // Institution name with retro styling
        doc.setFontSize(10);
        doc.setFont('courier', 'bold');
        doc.text(`${edu.institution}`, 25, yPosition);
        doc.setFont('courier', 'normal');
        doc.text(`${startYear} - ${endYear}`, pageWidth - 50, yPosition);
        yPosition += 5;

        // Degree details
        doc.text(`${edu.studyType} in ${edu.area} (GPA: ${edu.gpa})`, 25, yPosition);
        yPosition += 7;

        // Courses with retro badge styling
        doc.setFontSize(8);
        doc.text('Courses:', 25, yPosition);
        yPosition += 5;

        let courseX = 30;
        const startCourseY = yPosition;

        edu.courses.forEach((course) => {
          const textWidth = doc.getTextWidth(course) + 4;

          // Check if we need to move to next line
          if (courseX + textWidth > pageWidth - 30) {
            yPosition += 7;
            courseX = 30;
          }

          // Draw course badge with pixel-like appearance
          doc.setFillColor(colors.secondary);
          doc.rect(courseX, yPosition - 3, textWidth, 5, 'F');
          doc.setDrawColor(colors.border);
          doc.setLineWidth(0.2);
          doc.rect(courseX, yPosition - 3, textWidth, 5, 'S');
          doc.setTextColor(colors.text);
          doc.text(course, courseX + 2, yPosition);

          courseX += textWidth + 5;
        });

        yPosition += 10;
      });

      // Final sections (Languages and Interests)
      // Check if we need a new page
      if (yPosition > 220) {
        addStyledPage();
        yPosition = 30;
      }

      // Create a two-column layout for Languages and Interests
      const columnWidth = (pageWidth - 60) / 2;

      // Languages section (left column)
      doc.setFillColor(colors.secondary);
      doc.rect(20, yPosition - 7, columnWidth, 15, 'F');
      doc.setTextColor(colors.primary);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('LANGUAGES', 25, yPosition);
      yPosition += 10;
      doc.setTextColor(colors.text);
      doc.setFont('courier', 'normal');

      const languagesStartY = yPosition;

      data.languages.forEach((lang) => {
        doc.setFontSize(10);
        doc.setFont('courier', 'bold');
        doc.text(`${lang.language}:`, 25, yPosition);
        doc.setFont('courier', 'normal');
        doc.text(lang.fluency, 65, yPosition);
        yPosition += 7;
      });

      // Interests section (right column)
      const interestsX = 30 + columnWidth;
      let interestsY = languagesStartY;

      doc.setFillColor(colors.secondary);
      doc.rect(interestsX - 5, interestsY - 17, columnWidth, 15, 'F');
      doc.setTextColor(colors.primary);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('INTERESTS', interestsX, interestsY - 10);
      doc.setTextColor(colors.text);
      doc.setFont('courier', 'normal');

      data.interests.forEach((interest) => {
        doc.setFontSize(10);
        doc.setFont('courier', 'bold');
        doc.text(`${interest.name}:`, interestsX, interestsY);
        interestsY += 5;
        doc.setFont('courier', 'normal');

        let keywordX = interestsX + 5;
        interest.keywords.forEach((keyword) => {
          const textWidth = doc.getTextWidth(keyword) + 4;

          // Check if we need to move to next line
          if (keywordX + textWidth > pageWidth - 30) {
            interestsY += 7;
            keywordX = interestsX + 5;
          }

          // Draw keyword badge with pixel-like appearance
          doc.setFillColor(colors.secondary);
          doc.rect(keywordX, interestsY - 3, textWidth, 5, 'F');
          doc.setDrawColor(colors.border);
          doc.setLineWidth(0.2);
          doc.rect(keywordX, interestsY - 3, textWidth, 5, 'S');
          doc.setTextColor(colors.text);
          doc.text(keyword, keywordX + 2, interestsY);

          keywordX += textWidth + 5;
        });

        interestsY += 10;
      });

      // Save the PDF
      doc.save(`${data.basics.name.replace(/\s+/g, '_')}_Resume.pdf`);
      resolve();
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};
