import { useEffect } from 'react';
import { resumeData } from '@/data/resume';

export default function Meta() {
    useEffect(() => {
        // Set document title
        document.title = `${resumeData.basics.name} | ${resumeData.basics.designation}`;

        // Create or update meta tags
        const updateMetaTag = (name: string, content: string) => {
            let element = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
            if (!element) {
                element = document.createElement('meta');
                element.name = name;
                document.head.appendChild(element);
            }
            element.content = content;
        };

        // Basic Meta
        updateMetaTag('description', resumeData.basics.summary);
        updateMetaTag('author', resumeData.meta.author);
        updateMetaTag('keywords', resumeData.meta.keywords);
        updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        updateMetaTag('theme-color', resumeData.meta.themeColor);

        // Open Graph / Facebook
        updateMetaTag('og:title', `${resumeData.basics.name} | ${resumeData.basics.designation}`);
        updateMetaTag('og:description', resumeData.basics.summary);
        updateMetaTag('og:type', resumeData.meta.og.type);
        updateMetaTag('og:image', resumeData.meta.og.image);
        updateMetaTag('og:url', resumeData.meta.og.url);
        updateMetaTag('og:site_name', `${resumeData.basics.name} | Resume`);

        // Twitter
        updateMetaTag('twitter:card', resumeData.meta.twitter.card);
        updateMetaTag('twitter:site', resumeData.meta.twitter.site);
        updateMetaTag('twitter:title', `${resumeData.basics.name} | ${resumeData.basics.designation}`);
        updateMetaTag('twitter:description', resumeData.basics.summary);
        updateMetaTag('twitter:image', resumeData.meta.twitter.image);

        // Cleanup function
        return () => {
            // Optionally remove meta tags when component unmounts
        };
    }, []);

    return null;
}