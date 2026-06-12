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
