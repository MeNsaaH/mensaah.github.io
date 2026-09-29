# mensaah.me

Personal site and blog of Manasseh Mmadu. Built with [Astro](https://astro.build)
and deployed to GitHub Pages.

## Local development

Requires Node 22.12 or newer.

```bash
npm install
npm run dev       # http://localhost:4321, drafts visible
npm test          # unit tests
npm run test:e2e  # browser tests at phone width, against fixture posts
npm run check     # type check
npm run build     # production build into dist/
npm run preview   # serve the production build
```

## Writing a blog post

Add one Markdown file to `src/content/blog/`. The file name is the URL.

```markdown
---
title: "Postmortem: the day DNS took the cluster down"
description: "One sentence shown in lists, RSS and link previews."
pubDate: 2026-09-21
tags: [postmortem, kubernetes]
draft: false
---

Post body in Markdown.
```

`title`, `description` and `pubDate` are required. A post with `draft: true`
shows in `npm run dev` and is left out of the published site. Pushing to
`master` publishes.

In Claude Code, the `add-blog-post` skill does this for you.

## Updating content

Content is data, not markup. Edit these files:

| What | File |
|---|---|
| Name, title, summary, about, links | `src/data/site.ts` |
| Portrait in the About section | `src/assets/portrait.jpg` (square, at least 560px) |
| Roles | `src/data/experience.ts` |
| Education | `src/data/education.ts` |
| Projects | `src/data/projects.ts` |
| Skills and hobbies | `src/data/skills.ts` |

The current role is the entry in `experience.ts` without an `end`. There can
only be one; a test enforces it. In Claude Code, the `add-role` skill adds a
role and updates everything that depends on it.

The browser tests need Chromium once: `npx playwright install chromium`.
They build the site from the posts in `e2e/fixtures/blog`, which include a
title with a long unbroken name, and fail if any page scrolls sideways.

`tests/content.test.ts` keeps the page brief (for example, at most six
one-line bullets per role) and fails if a phone number, email address or
postcode is added to the content.

## Deployment

`.github/workflows/deploy.yml` tests and builds every push to `master` and
every pull request, and deploys pushes to `master`. The repository's Pages
source must be set to "GitHub Actions" (Settings, Pages). With that source,
GitHub takes the custom domain from the same settings page, not from
`public/CNAME`; the file is kept so the domain is recorded in the repository.

Pushing a newer commit cancels the test and build jobs of the older run, so
no runner time is spent on a commit that is already out of date. A deployment
that has started is never cancelled; the newer one waits for it to finish.

## Design

The design spec is in `docs/superpowers/specs/`. Colours are tokens in
`src/styles/tokens.css`; `tests/contrast.test.ts` fails if a pair drops below
WCAG AA.
