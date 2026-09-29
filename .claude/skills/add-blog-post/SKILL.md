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

Ask for anything missing. `title` and `description` are required, and the
description is published, so ask the owner for it rather than writing one
for them. If they ask you to draft it, build it only from their own words
and tell them to confirm it.

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

   Tags that differ only by case, spacing or accents share one page, and
   the first spelling wins, so match the existing spelling. `C++`, `C#` and
   `c` are three different tags. A tag with no letters or numbers, such as
   `???`, fails the build.

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
| `pubDate` | yes | Today, as `YYYY-MM-DD`, unless the owner gives a date. A blank or differently written date fails the build |
| `updatedDate` | no | Set when revising a published post |
| `tags` | no | Defaults to none |
| `draft` | no | Defaults to `false` |

Body rules:

- Start headings at `##`. The title is the page's `h1`.
- Give code blocks a language, for example ` ```bash `.
- Write from what the owner gave you. Do not publish invented experiences,
  numbers or opinions under their name.
- If they gave only an outline, write one `##` heading per point and leave
  the space under each heading empty. Do not add placeholder text, "TODO"
  notes or HTML comments: all three are published exactly as written. Keep
  the post as a draft until the owner has written the sections.

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
npm run test:e2e
```

A missing or mistyped field fails the build and names the file and field.
`npm run test:e2e` checks the layout at phone width using fixture posts, not
the new post, so also do the manual check at the end of this step.

Then check where the post appears. For a published post, all of these:

```bash
ls dist/blog/<slug>/index.html
grep -c "<slug>" dist/blog/index.html dist/rss.xml dist/sitemap-0.xml dist/index.html
ls dist/blog/tags/
grep -ci "todo\|<!--" src/content/blog/<slug>.md
```

Expected:

- The post page exists.
- Every count from the second command is at least `1`. `dist/index.html`
  covers both the "Latest post" row (when this is the newest post) and the
  command palette, whose list of posts is embedded in every page.
- `dist/blog/tags/` has one folder per tag in use, including this post's.
- The last command prints `0`: the post has no placeholder text or
  comments. A higher count is fine only if the post shows them on purpose
  inside a code block.

If there is an older or newer post, open the new post's page and confirm the
"Older" or "Newer" link at the bottom points to it.

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
| Writing the description for the owner without asking | Ask for it |
| "TODO" or `<!-- -->` under empty headings | Leave the space empty and keep the post a draft |
