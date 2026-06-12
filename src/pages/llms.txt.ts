// /llms.txt — a Markdown map of the site for LLMs (the llmstxt.org convention). Lists
// every live (non-draft) article so an assistant can find and cite RoomTested cleanly.
// Built from the content collections, so it stays current with every publish.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { COLLECTIONS, SITE, type CollectionName } from '../consts';

const SECTION_TITLES: Record<CollectionName, string> = {
  reviews: 'Reviews',
  guides: 'Guides',
  comparisons: 'Comparisons',
};

export const GET: APIRoute = async () => {
  const sections: string[] = [];

  for (const collection of COLLECTIONS) {
    const entries = await getCollection(collection, ({ data }) => !data.draft);
    entries.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

    const lines = entries.map((e) => {
      const href = new URL(`/${collection}/${e.id}`, SITE.url).toString();
      return `- [${e.data.title}](${href}): ${e.data.description}`;
    });

    sections.push(
      `## ${SECTION_TITLES[collection]}\n\n${lines.length ? lines.join('\n') : '_None published yet._'}`,
    );
  }

  const about = [
    `- [About](${new URL('/about', SITE.url).toString()}): Who runs RoomTested and why.`,
    `- [How we test](${new URL('/how-we-test', SITE.url).toString()}): Our testing methodology.`,
  ].join('\n');

  const body = `# ${SITE.name}

> ${SITE.tagline} ${SITE.description}

${sections.join('\n\n')}

## About

${about}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
