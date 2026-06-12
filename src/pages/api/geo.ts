// Geo hint for the client-side approximate price overlay. GBP stays canonical in
// the HTML; this endpoint only reports the visitor's country (from Cloudflare's
// edge request metadata) plus an approximate FX rate from a static table.
import type { APIRoute } from 'astro';

import fx from '../../data/fx.json';

export const prerender = false;

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  CA: 'CAD',
  AU: 'AUD',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
};

export const GET: APIRoute = ({ request }) => {
  // Astro 6 / adapter v13: Cloudflare request metadata lives on request.cf.
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  const country = cf?.country ?? 'GB';
  const currency = CURRENCY_BY_COUNTRY[country] ?? 'USD';
  const rate = (fx.rates as Record<string, number>)[currency] ?? null;

  return new Response(
    JSON.stringify({
      country,
      currency,
      rate,
      base: fx.base,
      approx: true,
      updated: fx.updated,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
};
