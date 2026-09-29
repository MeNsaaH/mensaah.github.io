import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema } from './lib/post-schema';

// The browser tests build the site from fixture posts by setting BLOG_DIR.
const base = process.env.BLOG_DIR ?? './src/content/blog';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base }),
  schema: postSchema,
});

export const collections = { blog };
