import { z } from 'astro/zod';
import { tagSlug } from './posts';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * A date from front matter. YAML gives a Date for `2026-09-29` and text for
 * a quoted value. Only ISO text is read as a date: a blank value would
 * otherwise become 1 January 1970, and JavaScript reads loose text such as
 * '14 Octember' as a real date.
 */
const date = z.preprocess(
  (value) => (typeof value === 'string' && ISO_DATE.test(value.trim()) ? new Date(value.trim()) : value),
  z.date({ error: 'Expected a date such as 2026-09-29' }),
);

const tag = z.string().refine((value) => tagSlug(value) !== '', {
  error: (issue) =>
    `The tag ${JSON.stringify(issue.input)} has no letters or numbers, so it cannot be used in a web address`,
});

/** Front matter of a blog post. A post that does not match fails the build. */
export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: date,
  updatedDate: date.optional(),
  tags: z.array(tag).default([]),
  draft: z.boolean().default(false),
});
