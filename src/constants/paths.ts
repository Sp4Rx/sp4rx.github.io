// Define shared paths used across the application
export const PATHS = {
    PDF: {
        OUTPUT_DIR: 'public',
        FILE_NAME: 'resume.pdf',
        // The path used in the browser
        BROWSER_PATH: '/resume.pdf',
    },
} as const;