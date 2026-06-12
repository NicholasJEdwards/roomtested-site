// Build-time relationship index over reviews + guides + comparisons. Used by
// RelatedArticles (article → related), the product pages (product → articles that
// mention it) and the category hubs (category → all its articles). Everything here
// runs at build time via getCollection — no runtime cost.
import { getCollection, type CollectionEntry } from 'astro:content';

import { COLLECTIONS, type CollectionName } from '../consts';

export type ArticleKind = 'review' | 'guide' | 'comparison';

/** Lightweight, serialisable article reference — what the UI components consume. */
export interface ArticleRef {
  title: string;
  href: string;
  description: string;
  category: string;
  kind: ArticleKind;
  publishedAt: Date;
  /** Reviews only. */
  rating?: number;
  /** Reviews only. */
  brand?: string;
  /** Per-collection og card (also the card-grid fallback image). */
  image: string;
}

type AnyEntry =
  | CollectionEntry<'reviews'>
  | CollectionEntry<'guides'>
  | CollectionEntry<'comparisons'>;

const KIND_BY_COLLECTION: Record<CollectionName, ArticleKind> = {
  reviews: 'review',
  guides: 'guide',
  comparisons: 'comparison',
};

const PLURAL_BY_KIND: Record<ArticleKind, CollectionName> = {
  review: 'reviews',
  guide: 'guides',
  comparison: 'comparisons',
};

function collectionOf(entry: AnyEntry): CollectionName {
  return entry.collection as CollectionName;
}

function toRef(entry: AnyEntry): ArticleRef {
  const collection = collectionOf(entry);
  const kind = KIND_BY_COLLECTION[collection];
  const data = entry.data;
  return {
    title: data.title,
    href: `/${collection}/${entry.id}`,
    description: data.description,
    category: data.category,
    kind,
    publishedAt: data.publishedAt,
    rating: 'rating' in data ? data.rating : undefined,
    brand: 'brand' in data ? data.brand : undefined,
    image: `/cards/${collection}/${entry.id}/og.png`,
  };
}

const isLive = (e: { data: { draft: boolean } }) => !e.data.draft || import.meta.env.DEV;

/** All non-draft (in DEV: all) entries across the three collections. */
async function allEntries(): Promise<AnyEntry[]> {
  const groups = await Promise.all(
    COLLECTIONS.map((c) => getCollection(c, isLive)),
  );
  return groups.flat() as AnyEntry[];
}

/**
 * Related articles for `entry`: same-category first, then articles that share any
 * tag, excluding the entry itself. Stable, date-desc within each band.
 */
export async function getRelatedArticles(entry: AnyEntry, limit = 6): Promise<ArticleRef[]> {
  const all = await allEntries();
  const selfKey = `${collectionOf(entry)}/${entry.id}`;
  const selfTags = new Set((entry.data.tags ?? []).map((t) => t.toLowerCase()));

  const others = all.filter((e) => `${collectionOf(e)}/${e.id}` !== selfKey);
  const byDateDesc = (a: AnyEntry, b: AnyEntry) =>
    b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();

  const sameCategory = others
    .filter((e) => e.data.category === entry.data.category)
    .sort(byDateDesc);

  const sameCategoryKeys = new Set(sameCategory.map((e) => `${collectionOf(e)}/${e.id}`));
  const sharedTags = others
    .filter((e) => !sameCategoryKeys.has(`${collectionOf(e)}/${e.id}`))
    .filter((e) => (e.data.tags ?? []).some((t) => selfTags.has(t.toLowerCase())))
    .sort(byDateDesc);

  return [...sameCategory, ...sharedTags].slice(0, limit).map(toRef);
}

/**
 * Articles that reference `productId` in their frontmatter — review `productId`,
 * comparison `productIds`/`winnerProductId`. A frontmatter scan is enough for now.
 */
export async function getArticlesForProduct(productId: string): Promise<ArticleRef[]> {
  const all = await allEntries();
  const matches = all.filter((e) => {
    const data = e.data as Record<string, unknown>;
    if (data.productId === productId) return true;
    if (data.winnerProductId === productId) return true;
    const ids = data.productIds;
    if (Array.isArray(ids) && ids.includes(productId)) return true;
    return false;
  });
  matches.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
  return matches.map(toRef);
}

/** All live articles in a category, across collections, newest first. */
export async function getCategoryArticles(categorySlug: string): Promise<ArticleRef[]> {
  const all = await allEntries();
  return all
    .filter((e) => e.data.category === categorySlug)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .map(toRef);
}

export { PLURAL_BY_KIND };
