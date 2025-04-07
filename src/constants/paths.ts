// Define shared paths used across the application
export const PATHS = {
    PDF: {
        OUTPUT_DIR: 'public/pdfs',
        FILE_NAME: 'resume.pdf',
        // The path used in the browser
        BROWSER_PATH: '/pdfs/resume.pdf',
    },
} as const;