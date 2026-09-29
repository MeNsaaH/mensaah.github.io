import { getCollection, type CollectionEntry } from 'astro:content';
import { publishedPosts } from './posts';

export type Post = CollectionEntry<'blog'>;

/** Posts for this build, newest first. Drafts appear in `npm run dev` only. */
export async function loadPosts(): Promise<Post[]> {
  const all = await getCollection('blog');
  return publishedPosts(all, !import.meta.env.PROD);
}

export function postHref(post: Pick<Post, 'id'>): string {
  return `/blog/${post.id}/`;
}

export function tagHref(slug: string): string {
  return `/blog/tags/${slug}/`;
}
