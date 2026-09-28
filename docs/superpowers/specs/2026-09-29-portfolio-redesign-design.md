# Portfolio redesign and blog: design

Date: 2026-09-29
Status: approved
Branch: `redesign`

## Goal

Replace the 2019 devportfolio template at `mensaah.me` with a distinctive
robotic-themed site, and add a blog that is written in Markdown and published
by pushing to `master`.

Audience: recruiters and fellow engineers. Success means the site looks unlike
a template, reads well on phone and desktop in light and dark mode, keeps all
existing content, and makes publishing a post a one-file change.

## Visual direction: "Service Manual"

The site reads as the technical manual for a machine, unit MM-01. The owner is
presented as a monitored system.

Approved mockup: `.superpowers/brainstorm/79798-1790638746/content/service-manual-v2.html`
(local only, not committed).

### Colour tokens

Defined as CSS custom properties on `:root`, switched by `data-theme` on `<html>`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#ece8df` | `#14130f` | Page background |
| `--panel` | `#f6f3ec` | `#1c1a15` | Panels, code blocks, figures |
| `--grid` | `#ddd8cc` | `#211f19` | 20px background grid lines |
| `--ink` | `#161616` | `#ece8df` | Text, heavy rules |
| `--muted` | `#5d584c` | `#9a9484` | Labels, secondary text |
| `--rule` | `#b9b3a5` | `#3a372e` | Hairline rules |
| `--accent` | `#e64500` | `#ff6a2b` | Hazard orange: numbers, links, Say hi |
| `--ok` | `#0a7d4f` | `#4fe3a1` | Status banner, "live" marker |

Text and background pairs must meet WCAG AA contrast. Adjust a token if a
check fails; do not drop the check.

### Type

| Role | Face | Notes |
|---|---|---|
| Display: name, headings, section numbers, panel values | Chakra Petch 600/700 | Name and section headings uppercase |
| Labels, nav, metadata, code | IBM Plex Mono 400/500 | Labels uppercase with letter spacing |
| Body prose, blog posts | IBM Plex Sans 400/600 | 16px minimum, line height about 1.65 |

Fonts are self-hosted through `@fontsource` packages. No Google Fonts request.

### Recurring elements

- 20px grid paper background on every page.
- Heavy 2px ink rule under the top bar and under section headings.
- Numbered sections: `01 / ABOUT`, `02 / DEPLOYS`, and so on.
- Numbered rows for lists (posts, projects) with an orange index.
- Robot schematic figure with orange callout lines and a `FIG. n` caption.

## Pages

| Route | Contents |
|---|---|
| `/` | Hero, About, Deploys, Education, Projects, Skills, Hobbies, Say hi |
| `/blog/` | All published posts, newest first, with tags and reading time |
| `/blog/<slug>/` | One post |
| `/blog/tags/<tag>/` | Posts carrying one tag |
| `/rss.xml` | RSS feed of published posts |
| `/404` | Themed "unit lost" page with a link home |
| `/sitemap-index.xml`, `/robots.txt` | Generated |

### Shared chrome

- **Top bar.** Left: status banner, "All systems operational", with a green dot.
  Right: About, Deploys, Projects, Blog, a filled orange **Say hi** button, and
  the theme toggle. On the home page the first three are in-page anchors; on
  other pages they link to `/#about` and so on. Below 720px the links collapse
  into a menu button; Say hi and the toggle stay visible.
- **Footer.** Copyright with the current year, social links (GitHub, Stack
  Overflow, LinkedIn, Twitter), RSS link, and a hint for the command palette.
- "Contact" does not appear anywhere. The label is "Say hi" in the nav, the
  section heading and the footer.

### Home sections

1. **Hero.** Name in Chakra Petch with the surname in orange. Title "Site
   Reliability Engineer" and a one-line summary. Robot schematic on the right.
   Resume download link. Below it, a four-cell telemetry panel:
   - Uptime: live counter since career start (see Behaviour).
   - Active deployment: `Zapier / SRE`.
   - Runtime: `Go, Python`.
   - Orchestration: `K8s, Terraform`.
   Under the panel, one row linking to the latest post. The row is omitted
   when there are no published posts.
2. **About.** Existing bio text.
3. **Deploys.** Experience as a release log, newest first. Each role is one
   entry with a version, a status, dates, company, role and its bullets.

   | Version | Status | Company | Role | Dates |
   |---|---|---|---|---|
   | v3.0 | Active | Zapier | Site Reliability Engineer | July 2022 to present |
   | v2.0 | Retired | Deimos | DevOps Engineer | April 2020 to July 2022 |
   | v1.0 | Retired | eHealth4Everyone | Backend Developer (Remote) | June 2018 to July 2019 |

   Zapier has no bullets in the current site, so it shows role and dates only.
4. **Education.** Existing FUT Minna entry.
5. **Projects.** The six existing projects as numbered entries with image,
   description and links. Reka currently shows Gophie's image; it gets a
   schematic placeholder tile instead, until a real image is supplied.
6. **Skills.** A spec table with four rows: Languages, Frameworks and
   libraries, Tools, Cloud platforms. No percentage bars.
7. **Hobbies.** Existing list, as a compact row of labels.
8. **Say hi.** The existing Formspree form (`https://formspree.io/mrgedawv`),
   same fields, restyled.

### Content fixes carried out during the move

- Duplicate `id="skills"` removed; every id is unique.
- Typos: "eHeath4Everyone" to "eHealth4Everyone", "maintaning" to
  "maintaining", "Travis)" to "Travis", "unsed" to "unused".
- Unclosed and empty `<li>` elements removed.
- Copyright year is generated, not hard-coded.
- Hero title changes from "Backend/DevOps Engineer" to "Site Reliability
  Engineer".

## Blog

### Authoring

One Markdown file per post in `src/content/blog/`. The file name is the slug.

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

| Field | Type | Required | Default |
|---|---|---|---|
| `title` | string | yes | |
| `description` | string | yes | |
| `pubDate` | date | yes | |
| `updatedDate` | date | no | |
| `tags` | string list | no | `[]` |
| `draft` | boolean | no | `false` |

The schema is enforced by an Astro content collection, so a post with a missing
or mistyped field fails the build with a clear message instead of publishing
broken.

Drafts are visible in `npm run dev` and excluded from the production build,
the RSS feed, tag pages and the sitemap.

### Presentation

- List rows: index number, title, tags, reading time, date.
- Post page: metadata line (`FIELD NOTE nn / date / n min read`), title,
  body in IBM Plex Sans at a measure of about 70 characters, tags, and
  previous/next links.
- Code blocks use Astro's built-in Shiki highlighting with a light and a dark
  theme that follow the site theme. Blocks have an orange left rule.
- Reading time is word count divided by 200, rounded up, minimum 1 minute.
- Each post has Open Graph and Twitter meta tags using its title and
  description.

### Starter content

One short published post announcing the blog, so the list and feed are not
empty at launch. It is placeholder copy for the owner to edit or delete.

## Behaviour

All scripts are small vanilla TypeScript modules. There is no UI framework.
The site is fully readable with JavaScript disabled.

### Theme

- Default follows `prefers-color-scheme`.
- The toggle sets `data-theme` on `<html>` and stores the choice in
  `localStorage` under `theme`.
- A tiny inline script in `<head>` applies the stored choice before first
  paint, so there is no flash of the wrong theme.
- Without JavaScript the theme follows the system setting through a CSS media
  query, and the toggle is hidden.

### Uptime counter

- Career start is `2018-06-01`, stored in site data.
- Displayed as `8y 3m 27d` with a ticking `HH:MM:SS` beside it.
- The build renders the value as of build time; the script updates it once a
  second. Without JavaScript the build-time value stays.

### Robot

- Inline SVG. The pupils follow the pointer within a small radius.
- With `prefers-reduced-motion: reduce`, or on touch-only devices, the pupils
  stay centred.

### Command palette

- Opens with `/` or `Ctrl+K` / `Cmd+K`, and from the footer hint. `/` is
  ignored while focus is in a form field.
- Built on `<dialog>`, so focus is trapped and `Esc` closes it.
- Typing filters a list of destinations; `Enter` runs the highlighted one.

| Command | Result |
|---|---|
| `help` | Lists the commands |
| `whoami` | Prints name, title and active deployment |
| `ls projects` | Lists projects; selecting one opens it |
| `ls posts` | Lists posts; selecting one opens it |
| `cat blog/latest` | Opens the newest post |
| `goto <section>` | Scrolls or navigates to a home section |
| `theme light`, `theme dark` | Switches theme |
| `say hi` | Goes to the Say hi form |
| `resume` | Opens the resume PDF |

The list of posts and projects is embedded at build time as JSON.

## Architecture

Astro 7, static output. Packages: `astro`, `@astrojs/rss`, `@astrojs/sitemap`,
three `@fontsource` packages, and `vitest` for unit tests.

```
src/
  content.config.ts        blog collection schema
  content/blog/*.md        posts
  data/
    site.ts                name, title, career start, resume URL, socials
    experience.ts          roles for the deploy log
    education.ts
    projects.ts
    skills.ts              skills and hobbies
  lib/
    reading-time.ts        pure function, unit tested
    uptime.ts              pure duration maths and formatting, unit tested
    posts.ts               load, filter drafts, sort, group by tag
  scripts/
    theme.ts
    uptime-ticker.ts
    robot-eyes.ts
    command-palette.ts
  styles/
    tokens.css             colour and type tokens for both themes
    base.css               reset, grid paper, typography
  components/              one file per unit below
  layouts/
    BaseLayout.astro       head, meta, top bar, footer, palette
    PostLayout.astro       post page
  pages/
    index.astro
    404.astro
    rss.xml.ts
    blog/index.astro
    blog/[slug].astro
    blog/tags/[tag].astro
  assets/projects/         project images, optimised by Astro
public/
  CNAME                    mensaah.me
  favicon.ico
  robots.txt
.github/workflows/deploy.yml
.claude/skills/
  add-role/SKILL.md
  add-blog-post/SKILL.md
```

### Components

| Component | Purpose | Depends on |
|---|---|---|
| `TopBar` | Status banner, nav, Say hi, theme toggle | `site.ts` |
| `Hero` | Name, title, summary, resume link | `site.ts`, `Robot`, `Telemetry` |
| `Robot` | Schematic SVG with callouts | none |
| `Telemetry` | Four-cell panel including uptime | `site.ts`, `lib/uptime.ts` |
| `SectionHeading` | Numbered heading with rule | none |
| `DeployLog` | Experience entries | `experience.ts` |
| `Education` | Education entries | `education.ts` |
| `ProjectList` | Project entries | `projects.ts` |
| `SpecTable` | Skills table | `skills.ts` |
| `SayHi` | Contact form | `site.ts` |
| `PostRow` | One row in a post list | `lib/posts.ts` |
| `CommandPalette` | Dialog markup and embedded index | `projects.ts`, `lib/posts.ts` |
| `Footer` | Copyright, socials, RSS | `site.ts` |

Content lives in `src/data` and `src/content`, never inside components, so
updating a role or a project is a data edit.

### Single source of truth

Each fact is stored once and everything else derives from it, so the
maintenance skills below have few places to touch.

| Fact | Stored in | Derived consumers |
|---|---|---|
| Current role and company | The entry in `experience.ts` with no end date | Telemetry "Active deployment", palette `whoami`, deploy log status |
| Hero title and summary | `site.ts` | Hero, page meta description, palette `whoami` |
| Runtime and orchestration cells | `site.ts` | Telemetry |
| Posts | Files in `src/content/blog/` | Blog list, tag pages, RSS, sitemap, home latest-post row, palette index, previous/next links |

A role's status is not stored: an entry without an end date is Active, any
other is Retired. `experience.ts` must contain at most one entry without an
end date, and a unit test enforces that.

### Removed

`index.html`, `css/`, `js/`, `scss/`, `libs/`, `gulpfile.js`, the old
`package.json` and `package-lock.json`, `images/lead-bg.jpg` and
`images/project.jpg`. Project images move to `src/assets/projects/`.
`README.md` is rewritten to cover local development and how to write a post.
`LICENSE.md` stays.

## Maintenance skills

Two Claude Code project skills are committed in the repository, so either can
be run in a later session by name or by describing the task.

| Skill | File |
|---|---|
| `add-role` | `.claude/skills/add-role/SKILL.md` |
| `add-blog-post` | `.claude/skills/add-blog-post/SKILL.md` |

Both skills are written after the site is built, so they describe the real
files. Both end by running the unit tests and a production build, and by
reporting what changed. Neither commits or pushes unless asked.

### `add-role`

Adds a new job to the site and updates everything that depends on it.

1. Collect: company, role title, start date, whether it is the current role,
   end date if not, and bullets. Ask for anything missing; do not invent
   bullets.
2. Add the entry to `experience.ts` in date order with the next version
   number (the role after v3.0 is v4.0).
3. If the new role is current, set the end date on the previously current
   role, which makes it Retired.
4. Ask whether the hero title or summary in `site.ts` should change, and
   whether the Runtime and Orchestration cells still reflect the stack.
5. Ask whether the role introduces tools to add to `skills.ts`.
6. Remind the owner to update the resume document if the link target is
   stale.
7. Run tests and build, then list every file changed.

### `add-blog-post`

Creates a post and confirms every place it should appear.

1. Collect: title, one-sentence description, tags, and whether it starts as
   a draft. Derive the slug from the title in lowercase kebab case and
   confirm it is unused.
2. Create `src/content/blog/<slug>.md` with complete front matter and
   today's date. Reuse existing tags where one fits, to avoid near-duplicates
   such as `k8s` and `kubernetes`.
3. Write the body from the owner's notes or outline when given; otherwise
   leave a section skeleton. Do not publish invented content under the
   owner's name.
4. Put images in `src/assets/blog/<slug>/` and reference them with relative
   paths.
5. Run tests and build. Confirm the post appears in the blog list, its tag
   pages, the RSS feed and the home latest-post row, or in none of them if
   it is a draft.
6. Report the local preview URL and the file path.

## Deployment

- `.github/workflows/deploy.yml` builds with Astro and deploys with the
  official GitHub Pages actions on every push to `master`.
- `site` is `https://mensaah.me`. `public/CNAME` keeps the custom domain.
- All work happens on the `redesign` branch. The live site does not change
  until the branch is merged.
- **Manual step for the owner, before merging:** in the repository's
  Settings, Pages, set Source to "GitHub Actions". Until that is done the
  workflow cannot publish.

## Error handling

| Case | Behaviour |
|---|---|
| Post with invalid front matter | Build fails, naming the file and field |
| No published posts | Blog page shows "No field notes filed yet"; home omits the latest-post row; RSS is valid and empty |
| Unknown palette command | Palette shows "Unknown command. Try help." |
| `localStorage` unavailable | Theme falls back to the system setting; no error thrown |
| Unknown URL | 404 page |
| Formspree failure | Handled by Formspree's own response page, as today |

## Testing

- **Unit (vitest):** `reading-time.ts`, `uptime.ts`, the draft filtering
  and sorting in `posts.ts`, and the rule that `experience.ts` has at most one
  current role. Written test-first.
- **Skills:** each skill is exercised once on a scratch branch (a sample role,
  a sample post), the result is checked in the browser, and the scratch
  changes are discarded.
- **Build:** `astro check` and `astro build` pass with no errors.
- **Browser, against the built site:** every route in light and dark mode at
  1280px and 375px; theme toggle persists across reload; palette opens, filters
  and navigates by keyboard; uptime ticks; nav anchors land on the right
  section; RSS validates; no console errors; no horizontal scroll at 375px.
- **Accessibility:** contrast AA for all token pairs, visible focus states, a
  skip link, and reduced-motion respected.

## Out of scope for this pass

Live GitHub statistics, a `/now` or `/uses` page, easter eggs, comments,
analytics, site search, and generated per-post social images.
