// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import matter from 'gray-matter';
import mdx from '@astrojs/mdx';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://roomtested.com';

// Build a URL → lastmod map from article frontmatter so the sitemap can carry a real
// lastmod (updatedAt || publishedAt). Reading the .mdx directly (gray-matter is already
// a dep for the card build) avoids needing the content API at config time.
const COLLECTIONS = ['reviews', 'guides', 'comparisons'];
const articleLastmod = new Map();
for (const collection of COLLECTIONS) {
  const dir = path.join(process.cwd(), 'src/content', collection);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => /\.(md|mdx)$/.test(f));
  } catch {
    continue; // collection dir absent
  }
  for (const file of files) {
    const { data } = matter(readFileSync(path.join(dir, file), 'utf8'));
    if (data.draft) continue;
    const slug = file.replace(/\.(md|mdx)$/, '');
    const lastmod = data.updatedAt ?? data.publishedAt;
    const url = new URL(`/${collection}/${slug}/`, SITE_URL).toString();
    articleLastmod.set(url, lastmod ? new Date(lastmod).toISOString() : undefined);
  }
}

// Sitemap uses this to build canonical URLs — must match the live host.
export default defineConfig({
  site: SITE_URL,
  adapter: cloudflare({
    // Images are optimised at build time (sharp); no runtime Cloudflare Images
    // binding needed for a static-first site.
    imageService: 'compile',
  }),
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/style-guide'),
      serialize(item) {
        const url = item.url;
        // Articles: real lastmod + weekly refresh, elevated priority.
        if (articleLastmod.has(url)) {
          const lastmod = articleLastmod.get(url);
          return {
            ...item,
            ...(lastmod ? { lastmod } : {}),
            changefreq: ChangeFreqEnum.WEEKLY,
            priority: 0.8,
          };
        }
        // Home page: top priority, checked daily.
        if (url === `${SITE_URL}/` || url === SITE_URL) {
          return { ...item, changefreq: ChangeFreqEnum.DAILY, priority: 1.0 };
        }
        // Category hubs + product pages: refreshed weekly.
        if (url.includes('/c/') || url.includes('/products/')) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.6 };
        }
        // Everything else (about, listing pages, legal): monthly, default priority.
        return { ...item, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.5 };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
