import { describe, expect, it } from 'vitest';
import {
  adjacentPosts,
  groupByTag,
  postNumber,
  publishedPosts,
  tagSlug,
  uniqueTags,
  type PostLike,
} from '../src/lib/posts';

function post(id: string, date: string, extra: Partial<PostLike['data']> = {}): PostLike {
  return {
    id,
    data: { title: id, pubDate: new Date(date), draft: false, tags: [], ...extra },
  };
}

describe('publishedPosts', () => {
  const all = [
    post('old', '2026-01-01'),
    post('draft', '2026-03-01', { draft: true }),
    post('new', '2026-02-01'),
  ];

  it('drops drafts and sorts newest first', () => {
    expect(publishedPosts(all, false).map((p) => p.id)).toEqual(['new', 'old']);
  });

  it('keeps drafts when asked', () => {
    expect(publishedPosts(all, true).map((p) => p.id)).toEqual(['draft', 'new', 'old']);
  });

  it('orders posts with the same date by id, so builds are stable', () => {
    const same = [post('b', '2026-01-01'), post('a', '2026-01-01')];
    expect(publishedPosts(same, false).map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('returns an empty list when there are no posts', () => {
    expect(publishedPosts([], false)).toEqual([]);
  });

  it('does not reorder the list it was given', () => {
    const input = [post('old', '2026-01-01'), post('new', '2026-02-01')];
    publishedPosts(input, false);
    expect(input.map((p) => p.id)).toEqual(['old', 'new']);
  });
});

describe('tagSlug', () => {
  it('lowercases and replaces spaces and symbols', () => {
    expect(tagSlug('Site Reliability')).toBe('site-reliability');
    expect(tagSlug('  CI/CD ')).toBe('ci-cd');
    expect(tagSlug('C++')).toBe('c');
  });

  it('is empty when nothing usable is left', () => {
    expect(tagSlug('???')).toBe('');
  });
});

describe('uniqueTags', () => {
  it('keeps the first spelling of a repeated tag and drops unusable ones', () => {
    expect(uniqueTags(['K8s', ' k8s', '???', 'Site Reliability'])).toEqual([
      { slug: 'k8s', label: 'K8s' },
      { slug: 'site-reliability', label: 'Site Reliability' },
    ]);
  });

  it('is empty for a post without tags', () => {
    expect(uniqueTags([])).toEqual([]);
  });
});

describe('groupByTag', () => {
  it('merges tags that differ only by case or spacing', () => {
    const groups = groupByTag([
      post('a', '2026-01-02', { tags: ['K8s'] }),
      post('b', '2026-01-01', { tags: ['k8s ', 'Go'] }),
    ]);
    expect(groups.map((g) => [g.slug, g.label, g.posts.map((p) => p.id)])).toEqual([
      ['go', 'Go', ['b']],
      ['k8s', 'K8s', ['a', 'b']],
    ]);
  });

  it('lists a post once when it repeats a tag', () => {
    const groups = groupByTag([post('a', '2026-01-01', { tags: ['go', 'Go'] })]);
    expect(groups[0]?.posts).toHaveLength(1);
  });

  it('skips tags with no usable characters', () => {
    expect(groupByTag([post('a', '2026-01-01', { tags: ['???'] })])).toEqual([]);
  });
});

describe('postNumber and adjacentPosts', () => {
  const sorted = [post('c', '2026-03-01'), post('b', '2026-02-01'), post('a', '2026-01-01')];

  it('numbers the oldest post 1', () => {
    expect(postNumber(sorted, 'a')).toBe(1);
    expect(postNumber(sorted, 'c')).toBe(3);
    expect(postNumber(sorted, 'missing')).toBe(0);
  });

  it('finds the newer and older neighbours', () => {
    expect(adjacentPosts(sorted, 'b').newer?.id).toBe('c');
    expect(adjacentPosts(sorted, 'b').older?.id).toBe('a');
    expect(adjacentPosts(sorted, 'c').newer).toBeUndefined();
    expect(adjacentPosts(sorted, 'a').older).toBeUndefined();
  });
});
