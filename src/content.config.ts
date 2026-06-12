import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

const categoryEnum = z.enum([
  'security',
  'lighting',
  'climate-energy',
  'cleaning-robotics',
  'networking',
  'hubs-protocols',
  'desk-setup',
  'peripherals',
  'monitors',
  'audio',
  '3d-printing',
]);

const commonFields = (image: SchemaContext['image']) => ({
  title: z.string(),
  description: z.string(),
  category: categoryEnum,
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.string().default('Nicholas Edwards'),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  heroPhoto: image().optional(),
  draft: z.boolean().default(false),
  // SEO / template layer (all optional — existing posts still validate). `template`
  // picks a layout variant in src/layouts/templates/; faq/keySpecs drive FAQ + spec
  // table components and their JSON-LD.
  template: z.string().optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  keySpecs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/reviews' }),
  schema: ({ image }) => z.object({
    ...commonFields(image),
    brand: z.string(),
    productId: z.string(),
    lastTested: z.coerce.date(),
    rating: z.number().min(0).max(5),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: ({ image }) => z.object({
    ...commonFields(image),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    estimatedMinutes: z.number().optional(),
    // Optional HowTo steps — feeds StepList + howToLd on guide-howto template.
    steps: z.array(z.object({ name: z.string(), text: z.string() })).optional(),
  }),
});

const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/comparisons' }),
  schema: ({ image }) => z.object({
    ...commonFields(image),
    productIds: z.array(z.string()).min(2),
    winnerProductId: z.string().optional(),
    lastTested: z.coerce.date(),
  }),
});

export const collections = { reviews, guides, comparisons };
