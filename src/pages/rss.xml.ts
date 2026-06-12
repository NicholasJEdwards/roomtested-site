// The site feed doubles as the trigger for every per-platform n8n distribution
// workflow — each item carries its og card as an enclosure so workflows get an
// image without scraping the page.
import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { COLLECTIONS, SITE } from '../consts';

export const GET: APIRoute = async (context) => {
  const items: (RSSFeedItem & { pubDate: Date })[] = [];

  for (const collection of COLLECTIONS) {
    const entries = await getCollection(collection, ({ data }) => !data.draft);
    for (const entry of entries) {
      items.push({
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.publishedAt,
        link: `/${collection}/${entry.id}/`,
        categories: [collection, entry.data.category],
        author: entry.data.author,
        enclosure: {
          url: new URL(`/cards/${collection}/${entry.id}/og.png`, context.site).toString(),
          // Nominal size — feed readers only need a hint; n8n uses the URL.
          length: 150000,
          type: 'image/png',
        },
      });
    }
  }

  items.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items,
    customData: '<language>en-gb</language>',
  });
};
