export interface PostLike {
  id: string;
  data: { title: string; pubDate: Date; draft: boolean; tags: string[] };
}

export interface TagGroup<T> {
  slug: string;
  label: string;
  posts: T[];
}

/** Drops drafts unless asked to keep them, then sorts newest first. */
export function publishedPosts<T extends PostLike>(posts: T[], includeDrafts: boolean): T[] {
  return posts
    .filter((post) => includeDrafts || !post.data.draft)
    .sort(
      (a, b) =>
        b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id),
    );
}

/** 'Site Reliability' becomes 'site-reliability'. Empty if nothing usable is left. */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TagLink {
  slug: string;
  label: string;
}

/** A post's tags for display: trimmed, without unusable tags or repeats such as 'k8s' and 'K8s'. */
export function uniqueTags(tags: string[]): TagLink[] {
  const seen = new Set<string>();
  const links: TagLink[] = [];
  for (const tag of tags) {
    const slug = tagSlug(tag);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    links.push({ slug, label: tag.trim() });
  }
  return links;
}

/** Groups posts by tag slug, so 'K8s' and 'k8s' share one page. Sorted by label. */
export function groupByTag<T extends PostLike>(posts: T[]): TagGroup<T>[] {
  const groups = new Map<string, TagGroup<T>>();
  for (const post of posts) {
    for (const { slug, label } of uniqueTags(post.data.tags)) {
      const group = groups.get(slug) ?? { slug, label, posts: [] };
      group.posts.push(post);
      groups.set(slug, group);
    }
  }
  return [...groups.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

/** 1 for the oldest post. `posts` must be sorted newest first. */
export function postNumber<T extends PostLike>(posts: T[], id: string): number {
  const index = posts.findIndex((post) => post.id === id);
  return index === -1 ? 0 : posts.length - index;
}

/** Neighbours of a post. `posts` must be sorted newest first. */
export function adjacentPosts<T extends PostLike>(
  posts: T[],
  id: string,
): { newer?: T; older?: T } {
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return {};
  return { newer: posts[index - 1], older: posts[index + 1] };
}
