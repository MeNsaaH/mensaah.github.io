---
name: add-blog-post
description: Use when the owner of this portfolio wants to write, draft, start or publish a blog post or field note on the site. Creates the Markdown file with valid front matter and confirms the post appears everywhere it should.
---

# Add a blog post

A post is one Markdown file in `src/content/blog/`. The blog list, tag pages,
RSS feed, sitemap, the home page "Latest post" row, the command palette and
the previous/next links are all generated from those files. Creating the file
is the only edit needed.

## 1. Collect the facts

| Fact | Notes |
|---|---|
| Title | Sentence case |
| Description | One sentence. Shown in lists, RSS and link previews |
| Tags | Zero or more |
| Draft? | Drafts show in `npm run dev` only |
| Content | The owner's notes, outline or full text |

## 2. Choose the slug and tags

1. The slug is the file name: the title in lowercase kebab case, without
   punctuation, six words at most. "Why I rewrote Reka in Go" becomes
   `why-i-rewrote-reka-in-go`.
2. Check `src/content/blog/` to confirm the slug is unused. The slug is the
   URL, so never rename a published post.
3. List the tags already in use and reuse one where it fits:

   ```bash
   grep -h "^tags:" src/content/blog/*.md | sort | uniq -c
   ```

   Tags that differ only by case or spacing share one page, and the first
   spelling wins, so match the existing spelling.

## 3. Create the file

`src/content/blog/<slug>.md`:

```markdown
---
title: "Why I rewrote Reka in Go"
description: "What changed, what got faster, and what I would do differently."
pubDate: 2026-10-14
tags: [go, reka]
draft: true
---

Opening paragraph.

## First section
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Quote it if it contains a colon |
| `description` | yes | |
| `pubDate` | yes | Today, as `YYYY-MM-DD`, unless the owner gives a date |
| `updatedDate` | no | Set when revising a published post |
| `tags` | no | Defaults to none |
| `draft` | no | Defaults to `false` |

Body rules:

- Start headings at `##`. The title is the page's `h1`.
- Give code blocks a language, for example ` ```bash `.
- Write from what the owner gave you. If they gave an outline, leave a
  section skeleton with their points. Do not publish invented experiences,
  numbers or opinions under their name.

## 4. Images

Put images in `src/assets/blog/<slug>/` and reference them with a relative
path, so Astro optimises them:

```markdown
![Grafana panel showing the DNS error rate](../../assets/blog/<slug>/error-rate.png)
```

Every image needs alt text that says what it shows.

## 5. Verify

```bash
npm test
npm run check
npm run build
```

A missing or mistyped field fails the build and names the file and field.

Then check where the post appears. For a published post, all of these:

```bash
ls dist/blog/<slug>/index.html
grep -c "<slug>" dist/blog/index.html dist/rss.xml dist/index.html
ls dist/blog/tags/
```

For a draft, none of them: `grep -rl "<slug>" dist` prints nothing.

Run `npm run dev` and open `http://localhost:4321/blog/<slug>/` to read it
in both themes and at phone width. Wide code and tables must scroll inside
their own block, not the page.

## 6. Report

Give the file path, the preview URL and whether it is a draft. To publish a
draft later, set `draft: false` and update `pubDate`. Do not commit or push
unless the owner asks.

## Common mistakes

| Mistake | Fix |
|---|---|
| Editing `blog/index.astro` or `rss.xml.ts` to add the post | They are generated. Only add the file |
| `pubDate: "14 Oct 2026"` | Use `2026-10-14` |
| Unquoted title containing a colon | Wrap the title in double quotes |
| New tag `kubernetes` when `k8s` exists | Reuse the existing tag |
| An `h1` (`#`) in the body | Start at `##` |
| Images in `public/` | Use `src/assets/blog/<slug>/` |
