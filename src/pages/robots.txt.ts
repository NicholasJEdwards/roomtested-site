import type { APIRoute } from 'astro';

import { SITE } from '../consts';

// NOTE: /cards/ stays crawlable on purpose — social platform scrapers must be able
// to fetch the og:image PNGs or link previews break.
const body = `User-agent: *
Allow: /
Disallow: /go/
Disallow: /api/
Disallow: /style-guide

Sitemap: ${SITE.url}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain' } });
