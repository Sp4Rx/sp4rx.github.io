import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resumeData } from "./src/data/resume.ts";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";
import fs from "fs";
import https from "https";

const downloadFile = async (url: string, dest: string) => {
  const file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        const redirectUrl = new URL(response.headers.location || '', url);
        request.destroy();
        return downloadFile(redirectUrl.toString(), dest).then(resolve).catch(reject);
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
};

const ensurePublicDirExists = () => {
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
  }
};

export default defineConfig(async ({ mode }) => {
  // Download images during build
  if (mode === 'production') {
    ensurePublicDirExists();

    const ogImagePath = 'public/images/og-image.png';
    const twitterImagePath = 'public/images/twitter-image.png';

    try {
      await downloadFile(resumeData.meta.og.image, ogImagePath);
      await downloadFile(resumeData.meta.twitter.image, twitterImagePath);

      // Update resumeData with full domain paths for production
      const domain = resumeData.meta.og.url;
      resumeData.meta.og.image = `${domain}/images/og-image.png`;
      resumeData.meta.twitter.image = `${domain}/images/twitter-image.png`;
    } catch (err) {
      console.error('Failed to download images:', err);
    }
  }

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
            title: `${resumeData.basics.name} | ${resumeData.basics.designation} | Resume`,
            description: resumeData.meta.description,
            author: resumeData.meta.author,
            ogTitle: `${resumeData.basics.name} | ${resumeData.basics.designation} | Resume`,
            ogDescription: resumeData.meta.description,
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
  }

});