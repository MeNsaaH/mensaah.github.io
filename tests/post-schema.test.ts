import { describe, expect, it } from 'vitest';
import { postSchema } from '../src/lib/post-schema';

const valid = {
  title: 'A post',
  description: 'One sentence.',
  pubDate: new Date('2026-09-29'),
};

const messages = (input: unknown) => {
  const result = postSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('postSchema', () => {
  it('accepts a post with only the required fields and fills the defaults', () => {
    const result = postSchema.parse(valid);
    expect(result.tags).toEqual([]);
    expect(result.draft).toBe(false);
  });

  it('accepts a date written as text, as YAML may give it', () => {
    expect(postSchema.parse({ ...valid, pubDate: '2026-09-29' }).pubDate).toEqual(
      new Date('2026-09-29'),
    );
  });

  it('rejects a blank publish date instead of dating the post 1970', () => {
    expect(messages({ ...valid, pubDate: null })).toHaveLength(1);
    expect(messages({ ...valid, pubDate: '' })).toHaveLength(1);
  });

  it('rejects a publish date that is not a date', () => {
    expect(messages({ ...valid, pubDate: '14 Octember' })).toHaveLength(1);
  });

  it('rejects a missing title or description', () => {
    expect(messages({ ...valid, title: undefined })).toHaveLength(1);
    expect(messages({ ...valid, description: undefined })).toHaveLength(1);
  });

  it('rejects a tag that cannot be used in a web address, and names it', () => {
    const found = messages({ ...valid, tags: ['go', '???'] });
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('tags.1');
    expect(found[0]).toContain('"???"');
  });
});
