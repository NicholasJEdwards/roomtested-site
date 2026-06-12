// Server-side product redirect: every store link on the site points here, so the
// plain URL → affiliate URL swap (post AliExpress Portals approval) is a change to
// products.json only — content never needs touching.
import type { APIRoute } from 'astro';

import { getProduct, resolveTarget, type Store } from '../../lib/products';

export const prerender = false;

const STORES: Store[] = ['aliexpress', 'ebay'];

export const GET: APIRoute = ({ params, url, redirect }) => {
  const product = params.id ? getProduct(params.id) : undefined;
  if (!product) return new Response('Unknown product', { status: 404 });

  const requested = url.searchParams.get('to') as Store | null;
  const store: Store = requested && STORES.includes(requested) ? requested : 'aliexpress';

  const target = resolveTarget(product, store) ?? resolveTarget(product, 'aliexpress');
  if (!target) return new Response('No link for this product', { status: 404 });

  return redirect(target, 302);
};
