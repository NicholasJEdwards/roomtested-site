// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Sitemap uses this to build canonical URLs — must match the live host.
export default defineConfig({
  site: 'https://roomtested.com',
  adapter: cloudflare({
    // Images are optimised at build time (sharp); no runtime Cloudflare Images
    // binding needed for a static-first site.
    imageService: 'compile',
  }),
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/style-guide') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
