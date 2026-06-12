import type { APIRoute } from 'astro';

import { SITE } from '../consts';

// NOTE: /cards/ stays crawlable on purpose — social platform scrapers must be able
// to fetch the og:image PNGs or link previews break.
// AI crawlers are explicitly welcomed: RoomTested WANTS to be cited by LLMs (see
// /llms.txt). Each gets an explicit Allow so a future restrictive default can't lock
// them out by accident.
const AI_BOTS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'];

const aiRules = AI_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');

const body = `User-agent: *
Allow: /
Disallow: /go/
Disallow: /api/
Disallow: /style-guide

${aiRules}

Sitemap: ${SITE.url}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain' } });
