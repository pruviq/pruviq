import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    category: z.enum(['market', 'quant', 'strategy', 'weekly', 'education']),
    tags: z.array(z.string()).optional(),
  }),
});

const strategies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/strategies' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['live', 'testing', 'killed', 'shelved']),
    category: z.enum(['mean-reversion', 'momentum', 'breakout', 'volatility', 'hybrid']),
    direction: z.enum(['long', 'short', 'both']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    winRate: z.number().optional(),
    profitFactor: z.number().optional(),
    maxDrawdown: z.number().optional(),
    totalPnl: z.string().optional(),
    timeframe: z.string(),
    dataPoints: z.number().optional(),
    coins: z.number().optional(),
    dateAdded: z.string(),
    dateKilled: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, strategies };
