// Schema.org JSON-LD builders. Honesty rule: only emit ratings/claims that are real
// (a Review rating must come from actual frontmatter, never invented).
import { SITE } from '../consts';

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    founder: personRef(),
  };
}

export function personRef() {
  return {
    '@type': 'Person',
    name: SITE.defaultAuthor,
    url: `${SITE.url}/about`,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: organizationLd(),
  };
}

export function breadcrumbsLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.href, SITE.url).toString(),
    })),
  };
}

interface ArticleLdInput {
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  image?: string;
}

export function articleLd(input: ArticleLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: new URL(input.url, SITE.url).toString(),
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
    author: { ...personRef(), name: input.author },
    publisher: organizationLd(),
    ...(input.image ? { image: new URL(input.image, SITE.url).toString() } : {}),
  };
}

interface ReviewLdInput extends ArticleLdInput {
  productName: string;
  brand?: string;
  rating: number;
}

export function reviewLd(input: ReviewLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: input.title,
    url: new URL(input.url, SITE.url).toString(),
    itemReviewed: {
      '@type': 'Product',
      name: input.productName,
      ...(input.brand ? { brand: { '@type': 'Brand', name: input.brand } } : {}),
    },
    reviewRating: { '@type': 'Rating', ratingValue: input.rating, bestRating: 5 },
    author: { ...personRef(), name: input.author },
    publisher: organizationLd(),
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
  };
}

interface ProductLdInput {
  name: string;
  brand?: string;
  image?: string;
  url: string;
  priceFromGBP?: number;
  priceCheckedAt?: string;
  /** Real aggregate rating only — never invent one (honesty rule). */
  aggregateRating?: { ratingValue: number; reviewCount: number };
}

export function productLd(input: ProductLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    url: new URL(input.url, SITE.url).toString(),
    ...(input.brand ? { brand: { '@type': 'Brand', name: input.brand } } : {}),
    ...(input.image ? { image: new URL(input.image, SITE.url).toString() } : {}),
    ...(input.priceFromGBP !== undefined
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GBP',
            price: input.priceFromGBP,
            availability: 'https://schema.org/InStock',
            url: new URL(input.url, SITE.url).toString(),
            ...(input.priceCheckedAt ? { priceValidUntil: input.priceCheckedAt } : {}),
          },
        }
      : {}),
    ...(input.aggregateRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: input.aggregateRating.ratingValue,
            reviewCount: input.aggregateRating.reviewCount,
            bestRating: 5,
          },
        }
      : {}),
  };
}

export function faqLd(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

interface HowToLdInput {
  name: string;
  steps: { name: string; text: string }[];
  /** ISO 8601 duration, e.g. "PT10M". */
  totalTime?: string;
}

export function howToLd(input: HowToLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    ...(input.totalTime ? { totalTime: input.totalTime } : {}),
    step: input.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function itemListLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: new URL(item.url, SITE.url).toString(),
    })),
  };
}
