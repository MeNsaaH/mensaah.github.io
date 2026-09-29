import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { loadPosts, postHref } from '../lib/blog';

export async function GET(context: APIContext) {
  const posts = await loadPosts();

  return rss({
    title: `${site.blogTitle} | ${site.name}`,
    description: site.blogDescription,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: postHref(post),
    })),
  });
}
