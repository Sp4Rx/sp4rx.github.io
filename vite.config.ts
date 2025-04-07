import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resumeData } from "./src/data/resume.ts";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";

export default defineConfig(({ mode }) => ({
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
          title: `${resumeData.basics.name} | ${resumeData.basics.designation} | Resume`,
          description: resumeData.basics.summary,
          author: resumeData.meta.author,
          ogTitle: `${resumeData.basics.name} | ${resumeData.basics.designation} | Resume`,
          ogDescription: resumeData.basics.summary,
          ogType: resumeData.meta.og.type,
          ogImage: resumeData.meta.og.image,
          ogUrl: resumeData.meta.og.url,
          twitterCard: resumeData.meta.twitter.card,
          twitterSite: resumeData.meta.twitter.site,
          twitterImage: resumeData.meta.twitter.image,
          keywords: resumeData.meta.keywords,
          themeColor: resumeData.meta.themeColor,
        }
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
