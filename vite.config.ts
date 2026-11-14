import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resumeData, generateJsonLd } from "./src/data/resume.ts";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";

const title = `${resumeData.basics.name} | ${resumeData.basics.designation}`;

export default defineConfig(() => {
  const jsonLd = JSON.stringify(generateJsonLd(resumeData), null, 2);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title,
            description: resumeData.meta.description,
            author: resumeData.meta.author,
            ogTitle: title,
            ogDescription: resumeData.meta.description,
            ogType: resumeData.meta.og.type,
            ogImage: resumeData.meta.og.image,
            ogImageAlt: resumeData.meta.og.imageAlt,
            ogUrl: resumeData.meta.og.url,
            twitterCard: resumeData.meta.twitter.card,
            twitterSite: resumeData.meta.twitter.site,
            twitterTitle: title,
            twitterDescription: resumeData.meta.description,
            twitterImage: resumeData.meta.twitter.image,
            keywords: resumeData.meta.keywords,
            themeColor: resumeData.meta.themeColor,
            jsonLd,
          }
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }

});