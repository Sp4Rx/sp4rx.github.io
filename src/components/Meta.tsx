import { useEffect } from 'react';
import { resumeData, generateJsonLd } from '@/data/resume';

export default function Meta() {
    useEffect(() => {
        // Set document title
        document.title = `${resumeData.basics.name} | ${resumeData.basics.designation}`;

        // Create or update meta tags (supports both 'name' and 'property' attributes)
        const updateMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
            let element = document.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement;
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, key);
                document.head.appendChild(element);
            }
            element.content = content;
        };

        // Create or update link relation tags (like canonical)
        const updateLinkTag = (rel: string, href: string) => {
            let element = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement;
            if (!element) {
                element = document.createElement('link');
                element.rel = rel;
                document.head.appendChild(element);
            }
            element.href = href;
        };

        // Basic Meta
        updateMetaTag('name', 'description', resumeData.meta.description);
        updateMetaTag('name', 'author', resumeData.meta.author);
        updateMetaTag('name', 'keywords', resumeData.meta.keywords);
        updateMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0');
        updateMetaTag('name', 'theme-color', resumeData.meta.themeColor);
        updateMetaTag('name', 'robots', 'index, follow');

        // Canonical URL
        updateLinkTag('canonical', resumeData.meta.og.url);

        // Open Graph / Facebook
        updateMetaTag('property', 'og:title', `${resumeData.basics.name} | ${resumeData.basics.designation}`);
        updateMetaTag('property', 'og:description', resumeData.meta.description);
        updateMetaTag('property', 'og:type', resumeData.meta.og.type);
        updateMetaTag('property', 'og:image', resumeData.meta.og.image);
        updateMetaTag('property', 'og:url', resumeData.meta.og.url);
        updateMetaTag('property', 'og:site_name', resumeData.basics.name);

        // Twitter
        updateMetaTag('name', 'twitter:card', resumeData.meta.twitter.card);
        updateMetaTag('name', 'twitter:site', resumeData.meta.twitter.site);
        updateMetaTag('name', 'twitter:title', `${resumeData.basics.name} | ${resumeData.basics.designation}`);
        updateMetaTag('name', 'twitter:description', resumeData.meta.description);
        updateMetaTag('name', 'twitter:image', resumeData.meta.twitter.image);

        // Structured JSON-LD Schema
        let jsonLdScript = document.getElementById('json-ld-schema') as HTMLScriptElement;
        if (!jsonLdScript) {
            jsonLdScript = document.createElement('script');
            jsonLdScript.id = 'json-ld-schema';
            jsonLdScript.type = 'application/ld+json';
            document.head.appendChild(jsonLdScript);
        }

        jsonLdScript.textContent = JSON.stringify(generateJsonLd(resumeData), null, 2);

        // Cleanup function
        return () => {
            // Optionally remove meta tags when component unmounts
        };
    }, []);

    return null;
}