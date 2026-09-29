# Portfolio Redesign and Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2019 template at `mensaah.me` with the "Service Manual" robotic design, add a Markdown blog, and add two maintenance skills.

**Architecture:** A static Astro 7 site. Content lives in typed data files (`src/data`) and a Markdown content collection (`src/content/blog`); components only render it. Logic that can be wrong (dates, uptime, post sorting, palette commands, theme storage) lives in pure functions in `src/lib` with unit tests, and small browser scripts in `src/scripts` call those functions.

**Tech Stack:** Astro 7.3, TypeScript, vitest 5, `@astrojs/rss`, `@astrojs/sitemap`, `@fontsource` fonts, GitHub Actions and GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-29-portfolio-redesign-design.md`

**Provenance of the code in this plan:** every file below was built and run in a scratch project outside the repository before this plan was written: 78 unit tests pass, `astro check` reports 0 errors, the production build succeeds, and the pages were checked in a browser in both themes at 1280px and 375px. If a step's output differs from what is stated, stop and investigate rather than adjusting the expectation.

## Global Constraints

- Work on the `redesign` branch only. Do not push, merge or touch `master`. The live site must not change.
- Node `>=22.12.0`. Astro `^7.3.5`. vitest `^5.0.2`.
- No UI framework (no React, Vue, Svelte). Browser scripts are vanilla TypeScript.
- No request to Google Fonts or any other font CDN. Fonts come from `@fontsource` packages.
- The word "Contact" must not appear in the nav, a heading or the footer. The label is "Say hi".
- Display face: Chakra Petch. Labels and code: IBM Plex Mono. Body: IBM Plex Sans.
- Every colour comes from a token in `src/styles/tokens.css`. The one exception is the white project image tile, which is commented where it is used.
- `site` is `https://mensaah.me`. `public/CNAME` contains `mensaah.me`.
- The site must be readable with JavaScript disabled.
- Content is copied from the existing site with typo fixes only. Do not invent roles, bullets, projects or posts.
- End every commit message with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

Inputs the spec implies but does not spell out, most likely first. Each is pinned by a test or a check in the task named.

1. **A visitor's clock is wrong, or the start date is invalid.** Uptime must show `0y 0m 0d`, never a negative number or `NaN`. Pinned in Task 2 (`tests/uptime.test.ts`).
2. **Tags that differ only by case, spacing or symbols** (`K8s`, `k8s `, `Site Reliability`, `???`). They must share one tag page with a valid URL, and a post must not list the same tag twice. Pinned in Task 6 (`tests/posts.test.ts`).
3. **Browser storage is blocked** (private mode, strict settings). The theme toggle must still switch the theme for the current page and must not throw. Pinned in Task 4 (`tests/theme-storage.test.ts` and a browser check).
4. **Typing `/` in the Say hi message box.** It must type a slash, not open the palette. Pinned in Task 7 (`tests/palette.test.ts` and a browser check).
5. **A post with a very long title, a wide code block or a wide table on a phone.** The block scrolls; the page must not scroll sideways. Pinned in Task 6 (browser check with a throwaway stress post).

## File Structure

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Site URL, sitemap, dual-theme code highlighting |
| `src/content.config.ts` | Blog collection schema |
| `src/content/blog/*.md` | Posts |
| `src/data/site.ts` | Identity, links, hero copy, section list |
| `src/data/experience.ts` | Roles, plus `currentRole`, `roleStatus`, `activeDeployment` |
| `src/data/education.ts`, `projects.ts`, `skills.ts` | Remaining content |
| `src/lib/*.ts` | Pure, unit-tested logic. Only `blog.ts` imports from Astro |
| `src/scripts/*.ts` | Browser behaviour; `main.ts` starts each feature |
| `src/styles/tokens.css`, `base.css`, `prose.css` | Tokens, global styles, post body styles |
| `src/components/*.astro` | One visual unit each, styles scoped |
| `src/layouts/BaseLayout.astro`, `PostLayout.astro` | Page shell, post shell |
| `src/pages/**` | Routes |
| `tests/*.test.ts` | One test file per `lib` module, plus data and contrast checks |
| `.claude/skills/*/SKILL.md` | Maintenance skills |
| `.github/workflows/deploy.yml` | Test, build, deploy |

How to run a browser check, used by several tasks:

```bash
npm run build
npx astro preview --port 4399 --host 127.0.0.1   # Astro 7 starts this detached and returns
# ... open http://127.0.0.1:4399/ and run the checks ...
npx astro preview stop
```

Use the Playwright browser tools if they are available, otherwise a normal browser and its console. Save any screenshots under `.playwright-mcp/` (git-ignored) and delete them afterwards.

---

### Task 1: Replace the template with an Astro scaffold

**Files:**
- Delete: `index.html`, `css/`, `js/`, `scss/`, `libs/`, `gulpfile.js`, `package.json`, `package-lock.json`, `images/lead-bg.jpg`, `images/project.jpg`
- Move: `images/*.png` to `src/assets/projects/`; `favicon.ico` and `CNAME` to `public/`
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `public/robots.txt`, `src/pages/index.astro`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: npm scripts `dev`, `build`, `preview`, `check`, `test`; project images at `src/assets/projects/{datakojo,dhistance,gophie,search,signalum}.png`.

- [ ] **Step 1: Confirm the starting point**

Run: `git branch --show-current && git status --short`
Expected: `redesign`, and no changes listed.

- [ ] **Step 2: Remove the old template and move the files that are kept**

```bash
git rm -r -q index.html css js scss libs gulpfile.js package.json package-lock.json images/lead-bg.jpg images/project.jpg
mkdir -p src/assets/projects public
git mv images/datakojo.png images/dhistance.png images/gophie.png images/search.png images/signalum.png src/assets/projects/
git mv favicon.ico CNAME public/
```

Run: `ls images 2>/dev/null; ls src/assets/projects public`
Expected: `images` is gone or empty; five PNG files; `CNAME` and `favicon.ico`.

- [ ] **Step 3: Write `package.json`**

Write it without dependencies. Step 6 adds them, so the lockfile records exact versions.

```json
{
  "name": "mensaah.me",
  "type": "module",
  "version": "2.0.0",
  "private": true,
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Write the config files**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://mensaah.me',
  integrations: [sitemap()],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false } },
});
```

`defaultColor: false` makes the highlighter emit both themes as CSS variables; `prose.css` (Task 6) picks one.

`tsconfig.json`:

```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }
```

`.gitignore` (replace the whole file):

```text
node_modules/
dist/
.astro/
.superpowers/
.playwright-mcp/
.DS_Store
```

`public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://mensaah.me/sitemap-index.xml
```

- [ ] **Step 5: Write a temporary home page**

`src/pages/index.astro`. Task 4 replaces it.

```astro
---
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Manasseh Mmadu</title>
  </head>
  <body>
    <h1>Manasseh Mmadu</h1>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

```bash
npm install astro@^7.3.5 @astrojs/rss@^4.0.19 @astrojs/sitemap@^3.7.4 @fontsource/chakra-petch @fontsource/ibm-plex-mono @fontsource/ibm-plex-sans
npm install -D @astrojs/check typescript vitest@^5.0.2
```

Expected: both finish without errors and `package-lock.json` exists.

- [ ] **Step 7: Build**

Run: `npm run build && cat dist/CNAME && ls dist`
Expected: the build ends with `Complete!`; `mensaah.me` is printed; `dist` holds `CNAME`, `favicon.ico`, `index.html`, `robots.txt`, `sitemap-index.xml`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: replace devportfolio template with Astro scaffold" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Date, uptime and reading-time functions

**Files:**
- Create: `src/lib/dates.ts`, `src/lib/uptime.ts`, `src/lib/reading-time.ts`
- Test: `tests/dates.test.ts`, `tests/uptime.test.ts`, `tests/reading-time.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `formatMonth(yearMonth: string): string` turns `'2022-07'` into `'July 2022'`; throws `Expected YYYY-MM` otherwise.
  - `formatDay(date: Date): string` turns a date into `'21 Sep 2026'` (UTC).
  - `interface Duration { years; months; days; hours; minutes; seconds }` (all `number`).
  - `durationBetween(start: Date, end: Date): Duration` returns all zeros if `end <= start` or either date is invalid.
  - `formatDuration(d: Duration): string` gives `'8y 3m 27d'`.
  - `formatClock(d: Duration): string` gives `'04:12:09'`.
  - `readingTime(text: string | undefined): number` gives minutes, minimum 1.

- [ ] **Step 1: Write the failing tests**

`tests/dates.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatDay, formatMonth } from '../src/lib/dates';

describe('formatMonth', () => {
  it('formats a year and month', () => {
    expect(formatMonth('2022-07')).toBe('July 2022');
    expect(formatMonth('2018-12')).toBe('December 2018');
  });

  it('rejects anything that is not YYYY-MM', () => {
    expect(() => formatMonth('July 2022')).toThrow('Expected YYYY-MM');
    expect(() => formatMonth('2022-13')).toThrow('Expected YYYY-MM');
  });
});

describe('formatDay', () => {
  it('formats in UTC', () => {
    expect(formatDay(new Date('2026-09-21T00:00:00Z'))).toBe('21 Sep 2026');
  });
});
```

`tests/uptime.test.ts`. The last two `durationBetween` tests pin Review Focus item 1.

```ts
import { describe, expect, it } from 'vitest';
import { durationBetween, formatClock, formatDuration } from '../src/lib/uptime';

const utc = (iso: string) => new Date(iso);

describe('durationBetween', () => {
  it('counts years, months, days and the clock from career start', () => {
    const d = durationBetween(utc('2018-06-01T00:00:00Z'), utc('2026-09-28T04:12:09Z'));
    expect(d).toEqual({ years: 8, months: 3, days: 27, hours: 4, minutes: 12, seconds: 9 });
  });

  it('does not count a month that has not completed yet', () => {
    const d = durationBetween(utc('2018-06-15T00:00:00Z'), utc('2018-07-14T23:59:59Z'));
    expect(d.months).toBe(0);
    expect(d.days).toBe(29);
  });

  it('clamps to the end of a shorter month', () => {
    const d = durationBetween(utc('2025-01-31T00:00:00Z'), utc('2025-02-28T00:00:00Z'));
    expect(formatDuration(d)).toBe('0y 1m 0d');
  });

  it('handles a leap-day start', () => {
    const d = durationBetween(utc('2020-02-29T00:00:00Z'), utc('2021-02-28T00:00:00Z'));
    expect(formatDuration(d)).toBe('1y 0m 0d');
  });

  it('returns zero when the clock is before the start', () => {
    const d = durationBetween(utc('2018-06-01T00:00:00Z'), utc('2017-01-01T00:00:00Z'));
    expect(formatDuration(d)).toBe('0y 0m 0d');
    expect(formatClock(d)).toBe('00:00:00');
  });

  it('returns zero for an invalid date instead of NaN', () => {
    const d = durationBetween(new Date('not a date'), utc('2026-01-01T00:00:00Z'));
    expect(formatDuration(d)).toBe('0y 0m 0d');
  });
});

describe('formatClock', () => {
  it('pads each part to two digits', () => {
    expect(formatClock({ years: 0, months: 0, days: 0, hours: 4, minutes: 5, seconds: 9 })).toBe('04:05:09');
  });
});
```

`tests/reading-time.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readingTime } from '../src/lib/reading-time';

const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ');

describe('readingTime', () => {
  it('is 1 minute for an empty or missing body', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime(undefined)).toBe(1);
    expect(readingTime('   \n  ')).toBe(1);
  });

  it('is 1 minute at exactly 200 words', () => {
    expect(readingTime(words(200))).toBe(1);
  });

  it('rounds up past a whole minute', () => {
    expect(readingTime(words(201))).toBe(2);
    expect(readingTime(words(1000))).toBe(5);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npm test`
Expected: FAIL. All three files fail to import, for example `Failed to resolve import "../src/lib/uptime"`.

- [ ] **Step 3: Write the implementations**

`src/lib/dates.ts`:

```ts
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** '2022-07' becomes 'July 2022'. */
export function formatMonth(yearMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || !month) throw new Error(`Expected YYYY-MM, got "${yearMonth}"`);
  return `${month} ${match[1]}`;
}

/** A Date becomes '21 Sep 2026', in UTC so build machines agree. */
export function formatDay(date: Date): string {
  const month = MONTHS[date.getUTCMonth()]!.slice(0, 3);
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}
```

`src/lib/uptime.ts`:

```ts
export interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ZERO: Duration = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

/** Adds calendar months in UTC, clamping to the last day of the target month. */
function addMonths(date: Date, count: number): Date {
  const target = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + count,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function durationBetween(start: Date, end: Date): Duration {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { ...ZERO };
  if (end.getTime() <= start.getTime()) return { ...ZERO };

  let totalMonths =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());
  if (addMonths(start, totalMonths).getTime() > end.getTime()) totalMonths -= 1;

  const anchor = addMonths(start, totalMonths);
  let rest = Math.floor((end.getTime() - anchor.getTime()) / 1000);
  const days = Math.floor(rest / 86400);
  rest -= days * 86400;
  const hours = Math.floor(rest / 3600);
  rest -= hours * 3600;
  const minutes = Math.floor(rest / 60);
  const seconds = rest - minutes * 60;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function formatDuration(d: Duration): string {
  return `${d.years}y ${d.months}m ${d.days}d`;
}

export function formatClock(d: Duration): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`;
}
```

`src/lib/reading-time.ts`:

```ts
const WORDS_PER_MINUTE = 200;

/** Minutes to read `text`, rounded up, never less than 1. */
export function readingTime(text: string | undefined): number {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test`
Expected: PASS. `Test Files  3 passed (3)`, `Tests  13 passed (13)`.

- [ ] **Step 5: Commit**

```bash
git add src/lib tests
git commit -m "feat: add date, uptime and reading-time functions" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Site content as data

**Files:**
- Create: `src/data/site.ts`, `src/data/experience.ts`, `src/data/education.ts`, `src/data/projects.ts`, `src/data/skills.ts`
- Test: `tests/experience.test.ts`

**Interfaces:**
- Consumes: `formatMonth` from Task 2; project images from Task 1.
- Produces:
  - `site` (object, `as const`) with `name`, `firstName`, `lastName`, `unit`, `title`, `summary`, `description`, `url`, `careerStart`, `runtime`, `orchestration`, `resumeUrl`, `formAction`, `about`, `blogTitle`, `blogDescription`, `socials: { label, href }[]`.
  - `sections: { id, label, nav }[]`, `type SectionId`, `sectionNumber(id: SectionId): string` giving `'01'` to `'07'`.
  - `interface Role { version; company; title; shortTitle; start; end?; bullets: string[] }`, `roles: Role[]` (newest first).
  - `roleStatus(role: Role): 'Active' | 'Retired'`, `currentRole(list?: Role[]): Role | undefined`, `activeDeployment(list?: Role[]): string` giving `'Zapier / SRE'` or `'Standby'`.
  - `education: Education[]`, `projects: Project[]`, `moreProjects`, `skills: SkillGroup[]`, `hobbies: string[]`.

Content is copied from the old `index.html` (see it with `git show master:index.html`). The only changes are typo fixes, consistent product capitalisation (DHIS2, GitLab, Wi-Fi), and the education paragraph that had a missing verb.

- [ ] **Step 1: Write the failing test**

`tests/experience.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  activeDeployment,
  currentRole,
  roles,
  roleStatus,
  type Role,
} from '../src/data/experience';
import { formatMonth } from '../src/lib/dates';

const role = (extra: Partial<Role>): Role => ({
  version: 'v1.0',
  company: 'Acme',
  title: 'Engineer',
  shortTitle: 'Eng',
  start: '2020-01',
  bullets: [],
  ...extra,
});

describe('roles data', () => {
  it('has at most one current role', () => {
    expect(roles.filter((r) => r.end === undefined).length).toBeLessThanOrEqual(1);
  });

  it('is sorted newest first', () => {
    const starts = roles.map((r) => r.start);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it('uses each version once', () => {
    const versions = roles.map((r) => r.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it('uses YYYY-MM dates, with no role ending before it starts', () => {
    for (const r of roles) {
      expect(() => formatMonth(r.start)).not.toThrow();
      if (r.end !== undefined) {
        expect(() => formatMonth(r.end!)).not.toThrow();
        expect(r.end >= r.start).toBe(true);
      }
    }
  });
});

describe('roleStatus', () => {
  it('is Active without an end date and Retired with one', () => {
    expect(roleStatus(role({}))).toBe('Active');
    expect(roleStatus(role({ end: '2021-01' }))).toBe('Retired');
  });
});

describe('currentRole and activeDeployment', () => {
  it('describes the role with no end date', () => {
    const list = [role({ company: 'Zapier', shortTitle: 'SRE' }), role({ end: '2019-01' })];
    expect(currentRole(list)?.company).toBe('Zapier');
    expect(activeDeployment(list)).toBe('Zapier / SRE');
  });

  it('reports Standby when every role has ended', () => {
    expect(currentRole([role({ end: '2019-01' })])).toBeUndefined();
    expect(activeDeployment([role({ end: '2019-01' })])).toBe('Standby');
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `npm test -- tests/experience.test.ts`
Expected: FAIL with `Failed to resolve import "../src/data/experience"`.

- [ ] **Step 3: Write the data files**

`src/data/experience.ts`:

```ts
export interface Role {
  /** Release label shown in the deploy log, for example 'v3.0'. */
  version: string;
  company: string;
  title: string;
  /** Short form for the telemetry panel, for example 'SRE'. */
  shortTitle: string;
  /** YYYY-MM */
  start: string;
  /** YYYY-MM. Leave out for the current role. */
  end?: string;
  bullets: string[];
}

/** Newest first. At most one role may have no `end`. */
export const roles: Role[] = [
  {
    version: 'v3.0',
    company: 'Zapier',
    title: 'Site Reliability Engineer',
    shortTitle: 'SRE',
    start: '2022-07',
    bullets: [],
  },
  {
    version: 'v2.0',
    company: 'Deimos',
    title: 'DevOps Engineer',
    shortTitle: 'DevOps',
    start: '2020-04',
    end: '2022-07',
    bullets: [
      'Creating and maintaining infrastructure on AWS, GCP and Azure.',
      'Using Terraform to automate infrastructure creation.',
      'Setting up and maintaining Kubernetes clusters on cloud providers, and clusters deployed using Kops and kubeadm.',
      'Monitoring Kubernetes clusters using Elastic Stack and Prometheus.',
      'Deploying applications on Kubernetes (ExternalDNS, Elastic Stack, Prometheus and others) using Helm, Kustomize or Argo CD.',
      'Setting up pipelines (Azure, GitLab) to run jobs.',
    ],
  },
  {
    version: 'v1.0',
    company: 'eHealth4Everyone',
    title: 'Backend Developer (Remote)',
    shortTitle: 'Backend',
    start: '2018-06',
    end: '2019-07',
    bullets: [
      'Maintenance and improvement of existing Django applications. Maintenance tasks ensured all applications have proper tests and also optimization of Django database queries. Creating background tasks using Celery for long running processes which revolved around executing Ansible scripts for infrastructure setups and generating exports from data files (CSV, JSON, XML) using Python.',
      'Implementation of mock-ups using Django templates and ensuring template re-usability. Upgrading projects from Django 1.11/Python 2 to Django 2.0/Python 3.',
      'Orchestrated CI pipeline using GitLab CI to run implemented tests and build projects before deployment.',
      'Creation and maintenance of existing Django applications. Used Celery task queues with Django to run long running processes and Bootstrap to design templates.',
      'Creation of SaaS application to autodeploy DHIS2 servers using Ansible to automate infrastructure setup, Docker (Compose) for container orchestration, Celery for executing Ansible scripts, RabbitMQ as message queue for communication between Django and Celery server, caching using Memcached. Tasks also involved design of application mockups using Bootstrap.',
      'Maintenance of PyQt5 projects which used requests to pull data from API endpoints.',
    ],
  },
];

export type RoleStatus = 'Active' | 'Retired';

export function roleStatus(role: Role): RoleStatus {
  return role.end === undefined ? 'Active' : 'Retired';
}

export function currentRole(list: Role[] = roles): Role | undefined {
  return list.find((role) => role.end === undefined);
}

/** 'Zapier / SRE', or 'Standby' between roles. */
export function activeDeployment(list: Role[] = roles): string {
  const role = currentRole(list);
  return role ? `${role.company} / ${role.shortTitle}` : 'Standby';
}
```

`src/data/site.ts`:

```ts
export const site = {
  name: 'Manasseh Mmadu',
  firstName: 'Manasseh',
  lastName: 'Mmadu',
  unit: 'MM-01',
  title: 'Site Reliability Engineer',
  summary: 'Built for backend systems, infrastructure and open source.',
  description:
    'Manasseh Mmadu is a Site Reliability Engineer working on backend systems, infrastructure and open source.',
  url: 'https://mensaah.me',
  /** The uptime counter starts here: the first listed role. */
  careerStart: '2018-06-01T00:00:00Z',
  runtime: 'Go, Python',
  orchestration: 'K8s, Terraform',
  resumeUrl:
    'https://docs.google.com/document/d/1m91RFBEX4rAiwB0F62iSgktYYPrA6Y1wNjrOEr9xJ5M/export?format=pdf',
  formAction: 'https://formspree.io/mrgedawv',
  about:
    'I am a dedicated and experienced Computer Engineer specializing in Backend Development and DevOps with a strong passion for open-source projects. With a deep understanding of infrastructure management and a drive for continuous improvement, I strive to optimize systems and automate processes for enhanced efficiency. My diverse skill set, combined with a commitment to staying updated on industry trends, allows me to deliver robust and scalable solutions.',
  blogTitle: 'Field notes',
  blogDescription:
    'Field notes on reliability, infrastructure and open source by Manasseh Mmadu.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/mensaah' },
    { label: 'Stack Overflow', href: 'https://stackoverflow.com/users/7167357/mensaah-m' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/manasseh-mmadu' },
    { label: 'Twitter', href: 'https://twitter.com/iamMensaah' },
  ],
} as const;

/** Home page sections in order. The section number is the position in this list. */
export const sections = [
  { id: 'about', label: 'About', nav: true },
  { id: 'deploys', label: 'Deploys', nav: true },
  { id: 'education', label: 'Education', nav: false },
  { id: 'projects', label: 'Projects', nav: true },
  { id: 'skills', label: 'Skills', nav: false },
  { id: 'hobbies', label: 'Hobbies', nav: false },
  { id: 'say-hi', label: 'Say hi', nav: false },
] as const;

export type SectionId = (typeof sections)[number]['id'];

/** '01' for the first section, '07' for the seventh. */
export function sectionNumber(id: SectionId): string {
  const index = sections.findIndex((section) => section.id === id);
  return String(index + 1).padStart(2, '0');
}
```

`src/data/education.ts`:

```ts
export interface EducationNote {
  text: string;
  /** Rendered after the text. */
  link?: { label: string; href: string };
}

export interface Education {
  institution: string;
  degree: string;
  /** YYYY-MM */
  start: string;
  /** YYYY-MM */
  end: string;
  notes: EducationNote[];
}

export const education: Education[] = [
  {
    institution: 'Federal University of Technology, Minna',
    degree: 'Bachelor of Engineering in Computer Engineering',
    start: '2014-01',
    end: '2019-11',
    notes: [
      {
        text: 'Had some of the best classmates around, where we learnt concepts of computer architecture, data structures and much more. Even worked on Arduino IoT devices, Raspberry Pi and assembly language as well.',
      },
      {
        text: 'I was involved in a lot of projects: part of a school research group where we focused on the advancement of SDNs and WSNs.',
      },
      { text: 'Graduated with First Class Honors.' },
      {
        text: 'I was also part of the founders of a developer community to mentor upcoming developers:',
        link: { label: 'FUT Developers Circle', href: 'https://futminna-dev-circle.github.io' },
      },
    ],
  },
];
```

`src/data/projects.ts`. Reka has no `image`: the old site showed Gophie's screenshot for it.

```ts
import type { ImageMetadata } from 'astro';
import datakojo from '../assets/projects/datakojo.png';
import dhistance from '../assets/projects/dhistance.png';
import gophie from '../assets/projects/gophie.png';
import search from '../assets/projects/search.png';
import signalum from '../assets/projects/signalum.png';

export interface Project {
  name: string;
  description: string;
  /** Leave out to show the schematic placeholder tile. */
  image?: ImageMetadata;
  /** The first link is the main one, used by the command palette. */
  links: [{ label: string; href: string }, ...{ label: string; href: string }[]];
}

export const projects: Project[] = [
  {
    name: 'Reka',
    description:
      'A cloud resource management tool to destroy, stop, resume, or clean up unused resources.',
    links: [{ label: 'View project', href: 'https://github.com/mensaah/reka' }],
  },
  {
    name: 'Dhistance',
    description:
      'A SaaS application for automating the deployment process of DHIS2 instances on servers. Tasks done involved creating a flexible architecture and database model and implementing them. The application was implemented using Django (Python), where deployment tasks were executed using Ansible, Docker and Celery in the background. I implemented templates using Bootstrap.',
    image: dhistance,
    links: [{ label: 'View project', href: 'https://dhistance.com' }],
  },
  {
    name: 'Datakojo',
    description:
      'Datakojo is a platform for conducting online surveys built using Django and Celery for background tasks.',
    image: datakojo,
    links: [{ label: 'View project', href: 'https://datakojo.com' }],
  },
  {
    name: 'Signalum',
    description:
      'A Linux package to detect and analyze existing connections from Wi-Fi and Bluetooth, created using Python. It also comes with a GUI application.',
    image: signalum,
    links: [
      { label: 'View project', href: 'https://github.com/bisoncorps/signalum' },
      { label: 'View desktop application', href: 'https://github.com/bisoncorps/signalum-desktop' },
    ],
  },
  {
    name: 'Search Engine Parser',
    description:
      'Package to query popular search engines and scrape for result titles, links and descriptions. Aims to scrape the widest range of search engines.',
    image: search,
    links: [{ label: 'View project', href: 'https://github.com/bisoncorps/search-engine-parser' }],
  },
  {
    name: 'Gophie',
    description:
      'Gophie is a tool to help you search, stream and download movies from movie sites without going through all the stress of by-passing ads.',
    image: gophie,
    links: [{ label: 'View project', href: 'https://github.com/go-phie' }],
  },
];

export const moreProjects = [
  { label: 'GitHub', href: 'https://github.com/mensaah' },
  { label: 'open source organization', href: 'https://github.com/bisoncorps' },
] as const;
```

`src/data/skills.ts`:

```ts
export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['JavaScript/Node.js', 'Python', 'Go'] },
  {
    label: 'Frameworks and libraries',
    items: ['Django', 'React', 'Gatsby', 'React Native', 'Gin'],
  },
  {
    label: 'Tools',
    items: [
      'Git',
      'Kubernetes',
      'Terraform',
      'Ansible',
      'GitLab CI',
      'GitHub Actions',
      'TeamCity',
      'Azure DevOps',
      'Travis',
    ],
  },
  { label: 'Cloud platforms', items: ['GCP', 'AWS', 'Azure'] },
];

export const hobbies: string[] = [
  'Paintballing',
  'Attending meetups',
  'Movies',
  'Reading',
  'Gaming (FIFA, PES, adventures, shooting)',
  'Open source contribution',
];
```

- [ ] **Step 4: Run the tests and the type check**

Run: `npm test && npm run check`
Expected: PASS, `Tests  20 passed (20)`; then `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add src/data tests
git commit -m "feat: move site content into typed data files" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Design tokens, theme and page shell

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/lib/theme-storage.ts`, `src/scripts/theme.ts`, `src/scripts/menu.ts`, `src/scripts/main.ts`, `src/components/TopBar.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro` (replace)
- Test: `tests/helpers/contrast.ts`, `tests/contrast.test.ts`, `tests/theme-storage.test.ts`

**Interfaces:**
- Consumes: `site`, `sections` from Task 3.
- Produces:
  - CSS tokens `--paper --panel --grid --ink --muted --rule --accent --accent-text --accent-strong --on-accent --ok --ok-bg --ok-line --font-display --font-mono --font-body --wrap --gutter --measure`.
  - Global classes `.wrap .section .label .button .button-ghost .bullets .visually-hidden .skip-link`.
  - `type Theme = 'light' | 'dark'`, `readStoredTheme(getStorage): Theme | null`, `writeStoredTheme(getStorage, theme): boolean`.
  - `currentTheme(): Theme`, `setTheme(theme: Theme): void`, `initThemeToggle(): void`, `initMenu(): void`.
  - `BaseLayout` props: `title?: string`, `description?: string`, `type?: 'website' | 'article'`, `noindex?: boolean`. Renders a default slot inside `<main id="main">`.
  - The `<html>` element has class `js` when scripts run, and `data-theme` when a theme is stored or chosen.
  - Hooks other tasks rely on: `[data-theme-toggle]`, `[data-menu-toggle]`, `[data-menu]`, `[data-palette-open]` (a hidden button in the footer that Task 7 reveals).

- [ ] **Step 1: Write the failing tests**

`tests/helpers/contrast.ts`:

```ts
function channel(value: number): number {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`Expected a 6-digit hex colour, got "${hex}"`);
  const n = parseInt(match[1]!, 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/** WCAG contrast ratio between two hex colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** Reads the `--name: #hex;` declarations inside the first block that follows `selector`. */
export function readTokens(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const tokens: Record<string, string> = {};
  for (const match of css.slice(open + 1, close).matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    tokens[match[1]!] = match[2]!;
  }
  return tokens;
}
```

`tests/contrast.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, readTokens } from './helpers/contrast';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

const themes = {
  light: readTokens(css, ':root {'),
  dark: readTokens(css, ":root[data-theme='dark']"),
};

/** [foreground, background, minimum ratio]. 4.5 is AA for text, 3 for large text. */
const pairs: [string, string, number][] = [
  ['ink', 'paper', 4.5],
  ['ink', 'panel', 4.5],
  ['muted', 'paper', 4.5],
  ['muted', 'panel', 4.5],
  ['accent-text', 'paper', 4.5],
  ['accent-text', 'panel', 4.5],
  ['on-accent', 'accent-strong', 4.5],
  ['ok', 'ok-bg', 4.5],
  ['ok', 'panel', 4.5],
  ['accent', 'paper', 3],
  ['accent', 'panel', 3],
];

describe.each(Object.entries(themes))('%s theme contrast', (_name, tokens) => {
  it.each(pairs)('%s on %s is at least %d:1', (fg, bg, minimum) => {
    expect(tokens[fg], `missing --${fg}`).toBeDefined();
    expect(tokens[bg], `missing --${bg}`).toBeDefined();
    expect(contrastRatio(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(minimum);
  });
});

describe('dark tokens', () => {
  it('are the same for the system setting and the manual toggle', () => {
    expect(readTokens(css, ":root:not([data-theme='light'])")).toEqual(themes.dark);
  });
});
```

`tests/theme-storage.test.ts`. The "blocked" cases pin Review Focus item 3.

```ts
import { describe, expect, it } from 'vitest';
import { readStoredTheme, writeStoredTheme } from '../src/lib/theme-storage';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const blocked = () => {
  throw new Error('SecurityError: storage is disabled');
};

describe('readStoredTheme', () => {
  it('returns the stored theme', () => {
    expect(readStoredTheme(() => memoryStorage({ theme: 'dark' }))).toBe('dark');
  });

  it('ignores values that are not a theme', () => {
    expect(readStoredTheme(() => memoryStorage({ theme: 'purple' }))).toBeNull();
    expect(readStoredTheme(() => memoryStorage())).toBeNull();
  });

  it('returns null when storage is blocked', () => {
    expect(readStoredTheme(blocked)).toBeNull();
  });
});

describe('writeStoredTheme', () => {
  it('stores the theme', () => {
    const storage = memoryStorage();
    expect(writeStoredTheme(() => storage, 'light')).toBe(true);
    expect(storage.getItem('theme')).toBe('light');
  });

  it('reports failure without throwing when storage is blocked', () => {
    expect(writeStoredTheme(blocked, 'dark')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npm test`
Expected: FAIL. `contrast.test.ts` fails with `ENOENT` for `tokens.css`; `theme-storage.test.ts` fails to resolve its import.

- [ ] **Step 3: Write the tokens and the storage functions**

`src/styles/tokens.css`. The dark values appear twice on purpose: once for the system setting and once for the manual toggle. A test keeps the two blocks identical.

```css
:root {
  color-scheme: light;
  --paper: #ece8df;
  --panel: #f6f3ec;
  --grid: #ddd8cc;
  --ink: #161616;
  --muted: #5d584c;
  --rule: #b9b3a5;
  --accent: #e64500;
  --accent-text: #b83700;
  --accent-strong: #c23a00;
  --on-accent: #ffffff;
  --ok: #08683f;
  --ok-bg: #dcebe0;
  --ok-line: #9cc7ae;

  --font-display: 'Chakra Petch', 'Arial Narrow', sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
  --font-body: 'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --wrap: 1080px;
  --gutter: 28px;
  --measure: 40rem;
}

@media (max-width: 720px) {
  :root {
    --gutter: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
    --paper: #14130f;
    --panel: #1c1a15;
    --grid: #211f19;
    --ink: #ece8df;
    --muted: #9a9484;
    --rule: #3a372e;
    --accent: #ff6a2b;
    --accent-text: #ff6a2b;
    --accent-strong: #ff6a2b;
    --on-accent: #14130f;
    --ok: #4fe3a1;
    --ok-bg: #0f211a;
    --ok-line: #1f4a3a;
  }
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --paper: #14130f;
  --panel: #1c1a15;
  --grid: #211f19;
  --ink: #ece8df;
  --muted: #9a9484;
  --rule: #3a372e;
  --accent: #ff6a2b;
  --accent-text: #ff6a2b;
  --accent-strong: #ff6a2b;
  --on-accent: #14130f;
  --ok: #4fe3a1;
  --ok-bg: #0f211a;
  --ok-line: #1f4a3a;
}
```

`src/lib/theme-storage.ts`:

```ts
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'theme';

type StorageGetter = () => Pick<Storage, 'getItem' | 'setItem'>;

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** The stored choice, or null if there is none or storage is blocked. */
export function readStoredTheme(getStorage: StorageGetter): Theme | null {
  try {
    const value = getStorage().getItem(THEME_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/** Returns false when storage is blocked. The caller still applies the theme. */
export function writeStoredTheme(getStorage: StorageGetter, theme: Theme): boolean {
  try {
    getStorage().setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test`
Expected: PASS, `Tests  48 passed (48)`.

- [ ] **Step 5: Write the global styles**

`src/styles/base.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 84px;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--ink);
  background-color: var(--paper);
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 20px 20px;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.65;
}

main {
  flex: 1;
}

h1,
h2,
h3,
h4 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.1;
  text-wrap: balance;
}

p,
ul,
ol,
dl,
dd,
figure {
  margin: 0;
}

ul,
ol {
  padding: 0;
  list-style: none;
}

img,
svg {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: var(--accent-text);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

a:hover {
  color: var(--ink);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

button,
input,
textarea {
  font: inherit;
  color: inherit;
}

.wrap {
  width: min(100% - 2 * var(--gutter), var(--wrap));
  margin-inline: auto;
}

.section {
  padding-block: 56px;
}

.label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  line-height: 1.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.button {
  display: inline-block;
  padding: 10px 18px;
  border: 2px solid var(--accent-strong);
  background: var(--accent-strong);
  color: var(--on-accent);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
}

.button:hover {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}

.button-ghost {
  background: transparent;
  border-color: var(--ink);
  color: var(--ink);
}

.bullets {
  display: grid;
  gap: 8px;
  max-width: var(--measure);
}

.bullets li {
  position: relative;
  padding-left: 20px;
}

.bullets li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;
  width: 8px;
  height: 2px;
  background: var(--accent);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: var(--gutter);
  top: -60px;
  z-index: 20;
  padding: 8px 14px;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.skip-link:focus {
  top: 8px;
  color: var(--paper);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Write the browser scripts**

`src/scripts/theme.ts`:

```ts
import { readStoredTheme, writeStoredTheme, type Theme } from '../lib/theme-storage';

const storage = () => window.localStorage;

export function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies the theme even when it cannot be stored, so the toggle always works. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  writeStoredTheme(storage, theme);
  document.dispatchEvent(new CustomEvent('themechange'));
}

export function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) return;

  const sync = () => {
    const dark = currentTheme() === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };

  const stored = readStoredTheme(storage);
  if (stored) document.documentElement.dataset.theme = stored;
  sync();

  button.addEventListener('click', () => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
  document.addEventListener('themechange', sync);
}
```

`src/scripts/menu.ts`:

```ts
/** The small-screen menu button. Without JavaScript the links are simply always shown. */
export function initMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!button || !menu) return;

  const setOpen = (open: boolean) => {
    menu.toggleAttribute('data-open', open);
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', () => setOpen(!menu.hasAttribute('data-open')));
  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.hasAttribute('data-open')) return;
    setOpen(false);
    button.focus();
  });
}
```

`src/scripts/main.ts`. Tasks 5 and 7 add to the list.

```ts
import { initMenu } from './menu';
import { initThemeToggle } from './theme';

// Each feature is independent: one failing must not stop the others.
for (const init of [initThemeToggle, initMenu]) {
  try {
    init();
  } catch (error) {
    console.error(error);
  }
}
```

- [ ] **Step 7: Write the top bar and footer**

`src/components/TopBar.astro`:

```astro
---
import { sections, site } from '../data/site';

const links = [
  ...sections
    .filter((section) => section.nav)
    .map((section) => ({ label: section.label, href: `/#${section.id}` })),
  { label: 'Blog', href: '/blog/' },
];
const onBlog = Astro.url.pathname.startsWith('/blog');
---

<header class="topbar">
  <div class="wrap bar">
    <a class="status" href="/" aria-label={`${site.name}, home. All systems operational.`}>
      <span class="dot" aria-hidden="true"></span>
      <span class="long">All systems&nbsp;</span>operational
    </a>

    <nav class="nav" aria-label="Main">
      <button
        class="menu"
        type="button"
        data-menu-toggle
        aria-expanded="false"
        aria-controls="site-links"
      >
        Menu
      </button>
      <ul id="site-links" class="links" data-menu>
        {
          links.map((link) => (
            <li>
              <a
                href={link.href}
                aria-current={link.href === '/blog/' && onBlog ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))
        }
      </ul>
      <a class="hi" href="/#say-hi">Say hi</a>
      <button class="toggle" type="button" data-theme-toggle aria-label="Switch colour theme">
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor"></path>
        </svg>
      </button>
    </nav>
  </div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--paper);
    border-bottom: 2px solid var(--ink);
  }

  .bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-block: 12px;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .status {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border: 1px solid var(--ok-line);
    border-radius: 2px;
    background: var(--ok-bg);
    color: var(--ok);
    text-decoration: none;
    white-space: nowrap;
  }

  .status:hover {
    color: var(--ok);
    border-color: var(--ok);
  }

  .dot {
    width: 7px;
    height: 7px;
    margin-right: 8px;
    border-radius: 50%;
    background: var(--ok);
  }

  .nav,
  .links {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .links a {
    color: var(--muted);
    text-decoration: none;
  }

  .links a:hover,
  .links a[aria-current='page'] {
    color: var(--ink);
  }

  .hi {
    padding: 5px 12px;
    background: var(--accent-strong);
    color: var(--on-accent);
    letter-spacing: 0.08em;
    text-decoration: none;
    white-space: nowrap;
  }

  .hi:hover {
    background: var(--ink);
    color: var(--paper);
  }

  .menu,
  .toggle {
    border: 1px solid var(--rule);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
  }

  .menu {
    display: none;
    padding: 5px 10px;
    font-size: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
  }

  /* The toggle needs JavaScript, so it only appears once the head script has run. */
  .toggle {
    display: none;
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 50%;
    place-items: center;
  }

  :global(.js) .toggle {
    display: grid;
  }

  .menu:hover,
  .toggle:hover {
    border-color: var(--ink);
  }

  @media (max-width: 720px) {
    .bar {
      flex-wrap: wrap;
    }

    .long {
      display: none;
    }

    .nav {
      gap: 10px;
    }

    /* Without JavaScript the links wrap onto their own row. */
    .links {
      order: 5;
      flex-basis: 100%;
      flex-wrap: wrap;
      gap: 6px 18px;
    }

    .nav {
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    :global(.js) .menu {
      display: inline-block;
    }

    :global(.js) .links {
      display: none;
      position: absolute;
      top: 100%;
      left: calc(-1 * var(--gutter));
      right: calc(-1 * var(--gutter));
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      padding: 4px var(--gutter) 10px;
      border-top: 1px solid var(--rule);
      background: var(--paper);
      border-bottom: 2px solid var(--ink);
    }

    :global(.js) .links[data-open] {
      display: flex;
    }

    :global(.js) .links a {
      display: block;
      padding: 12px 0;
      border-bottom: 1px solid var(--rule);
      color: var(--ink);
    }
  }
</style>
```

`src/components/Footer.astro`:

```astro
---
import { site } from '../data/site';

const year = new Date().getUTCFullYear();
---

<footer class="footer">
  <div class="wrap inner">
    <p class="label">Copyright &copy; {year} {site.name}</p>

    <ul class="links">
      {
        site.socials.map((social) => (
          <li>
            <a href={social.href} rel="me noopener" target="_blank">{social.label}</a>
          </li>
        ))
      }
      <li><a href="/rss.xml">RSS</a></li>
      <li><a href="/#say-hi">Say hi</a></li>
    </ul>

    <button class="hint label" type="button" data-palette-open hidden>
      Press <kbd>/</kbd> for commands
    </button>
  </div>
</footer>

<style>
  .footer {
    margin-top: 40px;
    border-top: 2px solid var(--ink);
    background: var(--panel);
  }

  .inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px 28px;
    padding-block: 22px;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .links a {
    color: var(--ink);
  }

  .links a:hover {
    color: var(--accent-text);
  }

  .hint {
    padding: 6px 10px;
    border: 1px solid var(--rule);
    background: transparent;
    cursor: pointer;
  }

  .hint:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  kbd {
    padding: 0 5px;
    border: 1px solid var(--rule);
    background: var(--paper);
    color: var(--ink);
    font-family: inherit;
  }
</style>
```

- [ ] **Step 8: Write the layout**

`src/layouts/BaseLayout.astro`. Task 7 adds the command palette to it.

```astro
---
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-400-italic.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '../styles/tokens.css';
import '../styles/base.css';
import Footer from '../components/Footer.astro';
import TopBar from '../components/TopBar.astro';
import { site } from '../data/site';

interface Props {
  /** Page title. The site name is added after it. Leave out on the home page. */
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  /** Keeps a page such as the 404 out of search results. */
  noindex?: boolean;
}

const { title, description = site.description, type = 'website', noindex = false } = Astro.props;
const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.title}`;
const canonical = new URL(Astro.url.pathname, Astro.site ?? site.url).href;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex" />}
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/favicon.ico" />
    <link rel="alternate" type="application/rss+xml" title={site.blogTitle} href="/rss.xml" />

    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonical} />
    <meta property="og:site_name" content={site.name} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />

    <!-- Runs before first paint so the stored theme never flashes. Keep in step with theme-storage.ts. -->
    <script is:inline>
      (function () {
        var root = document.documentElement;
        root.classList.add('js');
        try {
          var stored = localStorage.getItem('theme');
          if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;
        } catch (error) {
          /* Storage is blocked: follow the system setting. */
        }
      })();
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <TopBar />
    <main id="main">
      <slot />
    </main>
    <Footer />
    <script>
      import '../scripts/main';
    </script>
  </body>
</html>
```

- [ ] **Step 9: Replace the home page**

`src/pages/index.astro`. Task 5 replaces it again.

```astro
---
import { site } from '../data/site';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout>
  <section class="section wrap">
    <h1>{site.name}</h1>
    <p>{site.title}</p>
  </section>
</BaseLayout>
```

- [ ] **Step 10: Check and build**

Run: `npm run check && npm run build`
Expected: `0 errors`; build ends with `Complete!`.

- [ ] **Step 11: Browser check**

Start the preview (see "How to run a browser check") and open `http://127.0.0.1:4399/`. Run this in the console:

```js
(async () => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const before = root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  toggle.click();
  const afterClick = root.dataset.theme;
  const stored = localStorage.getItem('theme');

  // Review Focus 3: storage blocked. The toggle must still switch the theme.
  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = () => { throw new Error('blocked'); };
  let threw = false;
  try { toggle.click(); } catch { threw = true; }
  const afterBlocked = root.dataset.theme;
  Storage.prototype.setItem = original;

  return {
    hasJsClass: root.classList.contains('js'),
    toggled: afterClick !== before,
    storedMatches: stored === afterClick,
    blockedStillToggles: afterBlocked !== afterClick,
    blockedThrew: threw,
    fontsFromGoogle: performance.getEntriesByType('resource').some((r) => /fonts\.(googleapis|gstatic)\.com/.test(r.name)),
    contactWordPresent: /\bcontact\b/i.test(document.body.innerText),
  };
})();
```

Expected: `hasJsClass: true`, `toggled: true`, `storedMatches: true`, `blockedStillToggles: true`, `blockedThrew: false`, `fontsFromGoogle: false`, `contactWordPresent: false`.

Then reload the page and confirm the chosen theme is kept with no flash. Resize to 375px wide: the status banner reads "Operational", a Menu button appears, and it opens and closes the links. Press Escape with the menu open: it closes.

Stop the preview.

- [ ] **Step 12: Commit**

```bash
git add src tests
git commit -m "feat: add design tokens, theme toggle and page shell" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Home page

**Files:**
- Create: `src/components/Robot.astro`, `Telemetry.astro`, `Hero.astro`, `SectionHeading.astro`, `DeployLog.astro`, `Education.astro`, `ProjectList.astro`, `SpecTable.astro`, `Hobbies.astro`, `SayHi.astro` (all under `src/components/`), `src/scripts/uptime-ticker.ts`, `src/scripts/robot-eyes.ts`
- Modify: `src/scripts/main.ts` (replace), `src/pages/index.astro` (replace)

**Interfaces:**
- Consumes: everything from Tasks 2, 3 and 4.
- Produces:
  - `Hero` prop `latest?: { title: string; href: string; minutes: number }`. The latest-post row is omitted when the prop is absent.
  - `Robot` prop `figure?: string` (default `'FIG. 1'`). Hooks: `[data-robot]`, `[data-eye]`, `[data-socket]`, `[data-pupil]`.
  - `SectionHeading` props `title: string`, `number?: string`, `note?: string`, `level?: 1 | 2` (default 2), `id?: string`.
  - `Telemetry` hooks: `[data-uptime]` with `data-start`, `[data-uptime-days]`, `[data-uptime-clock]`.
  - `initUptime(): void`, `initRobot(): void`.
  - Section ids on the home page: `about`, `deploys`, `education`, `projects`, `skills`, `hobbies`, `say-hi`.
  - Form field ids: `say-hi-email`, `say-hi-message`.

This task is markup and styles driven by data that is already tested, so it is verified by the type check, the build and a browser check rather than new unit tests.

- [ ] **Step 1: Write the hero components**

`src/components/Robot.astro`:

```astro
---
import { site } from '../data/site';

interface Props {
  /** Figure caption, for example 'FIG. 1'. */
  figure?: string;
}

const { figure = 'FIG. 1' } = Astro.props;
---

<figure class="robot">
  <svg
    viewBox="0 0 250 170"
    width="250"
    height="170"
    fill="none"
    stroke-width="1.4"
    role="img"
    aria-label={`Schematic drawing of a robot, unit ${site.unit}`}
    data-robot
  >
    <rect class="line fill" x="80" y="30" width="80" height="62" rx="3"></rect>
    <line class="line" x1="120" y1="12" x2="120" y2="30"></line>
    <circle class="accent-fill" cx="120" cy="10" r="3.5"></circle>

    <g data-eye>
      <circle class="line" cx="104" cy="56" r="9" data-socket></circle>
      <circle class="ink-fill" cx="104" cy="56" r="2.5" data-pupil></circle>
    </g>
    <g data-eye>
      <circle class="line" cx="136" cy="56" r="9" data-socket></circle>
      <circle class="ink-fill" cx="136" cy="56" r="2.5" data-pupil></circle>
    </g>

    <path class="line" d="M100 78h40"></path>
    <rect class="line fill" x="92" y="100" width="56" height="48"></rect>
    <path class="line" d="M104 112h32M104 122h32M104 132h20"></path>
    <path class="line" d="M92 108H70v30M148 108h22v30"></path>

    <g class="callout" stroke-width="1">
      <path d="M145 56h46"></path>
      <path d="M120 10h50"></path>
      <path d="M80 124H36"></path>
    </g>
    <g class="text" aria-hidden="true">
      <text x="194" y="59">OPTICS</text>
      <text x="173" y="13">UPLINK</text>
      <text x="4" y="127">CORE</text>
    </g>
  </svg>
  <figcaption class="label">{figure} / Unit {site.unit}</figcaption>
</figure>

<style>
  .robot {
    display: grid;
    justify-items: center;
    gap: 4px;
  }

  .line {
    stroke: var(--ink);
  }

  .fill {
    fill: var(--panel);
  }

  .ink-fill {
    fill: var(--ink);
  }

  .accent-fill {
    fill: var(--accent);
  }

  .callout {
    stroke: var(--accent);
  }

  .text {
    fill: var(--ink);
    font-family: var(--font-mono);
    font-size: 8.5px;
  }
</style>
```

`src/components/Telemetry.astro`:

```astro
---
import { activeDeployment } from '../data/experience';
import { site } from '../data/site';
import { durationBetween, formatClock, formatDuration } from '../lib/uptime';

// Rendered as of build time; uptime-ticker.ts keeps it current in the browser.
const uptime = durationBetween(new Date(site.careerStart), new Date());
---

<dl class="panels">
  <div class="cell">
    <dt class="label">Uptime</dt>
    <dd data-uptime data-start={site.careerStart}>
      <span data-uptime-days>{formatDuration(uptime)}</span>
      <span class="clock" data-uptime-clock>{formatClock(uptime)}</span>
    </dd>
  </div>
  <div class="cell">
    <dt class="label">Active deployment</dt>
    <dd>{activeDeployment()}</dd>
  </div>
  <div class="cell">
    <dt class="label">Runtime</dt>
    <dd>{site.runtime}</dd>
  </div>
  <div class="cell">
    <dt class="label">Orchestration</dt>
    <dd>{site.orchestration}</dd>
  </div>
</dl>

<style>
  .panels {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 2px solid var(--ink);
    background: var(--panel);
  }

  .cell {
    min-width: 0;
    padding: 12px 14px;
    border-right: 1px solid var(--rule);
  }

  .cell:last-child {
    border-right: 0;
  }

  dd {
    margin-top: 6px;
    font-family: var(--font-display);
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.3;
  }

  [data-uptime-days] {
    white-space: nowrap;
  }

  .clock {
    display: inline-block;
    margin-left: 4px;
    color: var(--ok);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  @media (max-width: 720px) {
    .panels {
      grid-template-columns: repeat(2, 1fr);
    }

    .cell:nth-child(2n) {
      border-right: 0;
    }

    .cell:nth-child(-n + 2) {
      border-bottom: 1px solid var(--rule);
    }

    .clock {
      display: block;
      margin-left: 0;
    }
  }
</style>
```

`src/components/Hero.astro`:

```astro
---
import { site } from '../data/site';
import Robot from './Robot.astro';
import Telemetry from './Telemetry.astro';

interface Props {
  latest?: { title: string; href: string; minutes: number };
}

const { latest } = Astro.props;
const now = new Date();
const revision = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
---

<section class="hero wrap" aria-labelledby="hero-name">
  <p class="masthead label">
    <span>Service manual / Unit {site.unit}</span>
    <span class="rev">Rev {revision}</span>
  </p>

  <div class="intro">
    <div>
      <h1 id="hero-name" class="name">
        {site.firstName}<br /><span>{site.lastName}</span>
      </h1>
      <p class="role"><strong>{site.title}.</strong> {site.summary}</p>
      <p class="actions">
        <a class="button" href={site.resumeUrl}>Download resume</a>
        <a class="button button-ghost" href="/#say-hi">Say hi</a>
      </p>
    </div>
    <Robot />
  </div>

  <Telemetry />

  {
    latest && (
      <a class="latest" href={latest.href}>
        <span class="num">01</span>
        <span class="label kind">Latest post</span>
        <span class="title">{latest.title}</span>
        <span class="label">{latest.minutes} min</span>
      </a>
    )
  }
</section>

<style>
  .hero {
    padding-block: 28px 40px;
  }

  .masthead {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .rev {
    padding: 1px 8px;
    background: var(--accent-strong);
    color: var(--on-accent);
  }

  .intro {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 24px;
    margin-block: 28px 26px;
  }

  .name {
    font-size: clamp(2.75rem, 9vw, 4.5rem);
    line-height: 0.98;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  .name span {
    color: var(--accent);
  }

  .role {
    max-width: 46ch;
    margin-top: 16px;
    color: var(--muted);
    font-size: 1.0625rem;
    line-height: 1.55;
  }

  .role strong {
    color: var(--ink);
    font-weight: 600;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 22px;
  }

  .latest {
    display: grid;
    grid-template-columns: 46px 120px 1fr auto;
    align-items: baseline;
    gap: 10px;
    margin-top: 14px;
    padding-block: 10px;
    border-bottom: 1px solid var(--rule);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    text-decoration: none;
  }

  .latest:hover .title {
    color: var(--accent-text);
    text-decoration: underline;
  }

  .num {
    color: var(--accent);
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
  }

  @media (max-width: 720px) {
    .intro {
      grid-template-columns: 1fr;
    }

    .intro :global(.robot) {
      justify-items: start;
    }

    .latest {
      grid-template-columns: 34px 1fr auto;
    }

    .latest .kind {
      display: none;
    }
  }
</style>
```

- [ ] **Step 2: Write the section components**

`src/components/SectionHeading.astro`:

```astro
---
interface Props {
  title: string;
  /** Two-digit section number, for example '02'. Leave out on pages that are not numbered. */
  number?: string;
  /** Small label on the right, for example '3 entries'. */
  note?: string;
  /** Heading level. The home page sections are h2; page titles are h1. */
  level?: 1 | 2;
  id?: string;
}

const { title, number, note, level = 2, id } = Astro.props;
const Tag = `h${level}` as const;
---

<header class="heading">
  {number && <span class="num" aria-hidden="true">{number} /</span>}
  <Tag id={id} class="title">{title}</Tag>
  {note && <span class="label note">{note}</span>}
</header>

<style>
  .heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 14px;
    margin-bottom: 26px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--ink);
  }

  .num {
    color: var(--accent);
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 700;
  }

  .title {
    font-size: clamp(1.625rem, 4vw, 2.125rem);
    text-transform: uppercase;
  }

  .note {
    margin-left: auto;
  }
</style>
```

`src/components/DeployLog.astro`:

```astro
---
import { roles, roleStatus } from '../data/experience';
import { formatMonth } from '../lib/dates';
---

<ol class="log" reversed>
  {
    roles.map((role) => {
      const status = roleStatus(role);
      return (
        <li class="entry">
          <div class="meta">
            <span class="version">{role.version}</span>
            <span class:list={['status', 'label', { active: status === 'Active' }]}>{status}</span>
            <span class="label">
              {formatMonth(role.start)} to {role.end ? formatMonth(role.end) : 'present'}
            </span>
          </div>
          <div class="body">
            <h3>{role.company}</h3>
            <p class="title">{role.title}</p>
            {role.bullets.length > 0 && (
              <ul class="bullets">
                {role.bullets.map((bullet) => (
                  <li>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      );
    })
  }
</ol>

<style>
  .entry {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
    padding-block: 24px;
    border-bottom: 1px solid var(--rule);
  }

  .entry:first-child {
    padding-top: 0;
  }

  .meta {
    display: grid;
    align-content: start;
    justify-items: start;
    gap: 8px;
  }

  .version {
    color: var(--accent);
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
  }

  .status {
    padding: 2px 8px;
    border: 1px solid var(--rule);
  }

  .status.active {
    border-color: var(--ok-line);
    background: var(--ok-bg);
    color: var(--ok);
  }

  h3 {
    font-size: 1.5rem;
  }

  .title {
    margin-top: 4px;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .bullets {
    margin-top: 16px;
  }

  @media (max-width: 720px) {
    .entry {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .meta {
      grid-auto-flow: column;
      justify-content: start;
      align-items: center;
      gap: 12px;
    }
  }
</style>
```

`src/components/Education.astro`:

```astro
---
import { education } from '../data/education';
import { formatMonth } from '../lib/dates';
---

<ul class="list">
  {
    education.map((entry) => (
      <li class="entry">
        <p class="label">
          {formatMonth(entry.start)} to {formatMonth(entry.end)}
        </p>
        <div>
          <h3>{entry.institution}</h3>
          <p class="degree">{entry.degree}</p>
          <ul class="bullets">
            {entry.notes.map((note) => (
              <li>
                {note.text}
                {note.link && (
                  <>
                    {' '}
                    <a href={note.link.href}>{note.link.label}</a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </li>
    ))
  }
</ul>

<style>
  .entry {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
  }

  .entry + .entry {
    margin-top: 28px;
  }

  h3 {
    font-size: 1.5rem;
  }

  .degree {
    margin-block: 4px 16px;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  @media (max-width: 720px) {
    .entry {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }
</style>
```

`src/components/ProjectList.astro`:

```astro
---
import { Image } from 'astro:assets';
import { moreProjects, projects } from '../data/projects';
---

<ol class="grid">
  {
    projects.map((project, i) => (
      <li class="card">
        <div class="tile">
          {project.image ? (
            <Image src={project.image} alt="" width={300} loading="lazy" />
          ) : (
            <svg viewBox="0 0 120 80" width="120" height="80" fill="none" aria-hidden="true">
              <rect class="line" x="1" y="1" width="118" height="78" stroke-dasharray="4 4" />
              <path class="line" d="M60 24v32M44 40h32" />
              <circle class="line" cx="60" cy="40" r="10" />
            </svg>
          )}
        </div>
        <div class="body">
          <p class="num" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </p>
          <h3>{project.name}</h3>
          <p class="text">{project.description}</p>
          <p class="links">
            {project.links.map((link) => (
              <a href={link.href}>{link.label}</a>
            ))}
          </p>
        </div>
      </li>
    ))
  }
</ol>

<p class="more">
  Check out more on my <a href={moreProjects[0].href}>{moreProjects[0].label}</a> or my{' '}
  <a href={moreProjects[1].href}>{moreProjects[1].label}</a>.
</p>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .card {
    display: grid;
    grid-template-rows: auto 1fr;
    min-width: 0;
    border: 2px solid var(--ink);
    background: var(--panel);
  }

  .tile {
    display: grid;
    place-items: center;
    height: 170px;
    padding: 16px;
    border-bottom: 1px solid var(--rule);
    /* Screenshots were made for a white page, so the tile stays white in both themes. */
    background: #ffffff;
  }

  .tile img {
    max-height: 138px;
    width: auto;
    object-fit: contain;
  }

  .tile svg .line {
    stroke: #5d584c;
  }

  .body {
    padding: 16px 18px 18px;
  }

  .num {
    color: var(--accent);
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1;
  }

  h3 {
    margin-top: 6px;
    font-size: 1.375rem;
  }

  .text {
    margin-top: 8px;
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    margin-top: 14px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .more {
    margin-top: 24px;
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

`src/components/SpecTable.astro`:

```astro
---
import { skills } from '../data/skills';
---

<table class="spec">
  <caption class="visually-hidden">Skills by category</caption>
  <tbody>
    {
      skills.map((group) => (
        <tr>
          <th scope="row" class="label">
            {group.label}
          </th>
          <td>
            <ul class="items">
              {group.items.map((item) => (
                <li>{item}</li>
              ))}
            </ul>
          </td>
        </tr>
      ))
    }
  </tbody>
</table>

<style>
  .spec {
    width: 100%;
    border: 2px solid var(--ink);
    border-collapse: collapse;
    background: var(--panel);
  }

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--rule);
    text-align: left;
    vertical-align: top;
  }

  tr:last-child th,
  tr:last-child td {
    border-bottom: 0;
  }

  th {
    width: 220px;
    border-right: 1px solid var(--rule);
    font-weight: 400;
  }

  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 8px;
  }

  .items li {
    padding: 2px 10px;
    border: 1px solid var(--rule);
    background: var(--paper);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  @media (max-width: 720px) {
    th,
    td {
      display: block;
      width: auto;
      border-right: 0;
    }

    th {
      padding-bottom: 0;
      border-bottom: 0;
    }
  }
</style>
```

`src/components/Hobbies.astro`:

```astro
---
import { hobbies } from '../data/skills';
---

<ul class="hobbies">
  {hobbies.map((hobby) => <li>{hobby}</li>)}
</ul>

<style>
  .hobbies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
  }

  li {
    padding: 4px 12px;
    border: 1px solid var(--ink);
    background: var(--panel);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }
</style>
```

`src/components/SayHi.astro`:

```astro
---
import { site } from '../data/site';
---

<div class="say-hi">
  <p class="lead">
    Have a question, an opportunity or a bug report for one of my projects? Send a message and I
    will reply by email.
  </p>

  <form class="form" method="POST" action={site.formAction}>
    <input type="hidden" name="_subject" value="Contact request from personal website" />

    <label class="label" for="say-hi-email">Your email</label>
    <input id="say-hi-email" type="email" name="_replyto" autocomplete="email" required />

    <label class="label" for="say-hi-message">Your message</label>
    <textarea id="say-hi-message" name="message" rows="6" required></textarea>

    <button class="button" type="submit">Send message</button>
  </form>
</div>

<style>
  .say-hi {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 32px;
  }

  .lead {
    max-width: 38ch;
    font-size: 1.0625rem;
  }

  .form {
    display: grid;
    gap: 8px;
    justify-items: start;
  }

  input[type='email'],
  textarea {
    width: 100%;
    margin-bottom: 12px;
    padding: 10px 12px;
    border: 2px solid var(--ink);
    border-radius: 0;
    background: var(--panel);
  }

  textarea {
    resize: vertical;
  }

  @media (max-width: 720px) {
    .say-hi {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>
```

- [ ] **Step 3: Write the browser scripts**

`src/scripts/uptime-ticker.ts`:

```ts
import { durationBetween, formatClock, formatDuration } from '../lib/uptime';

/** Keeps the build-time uptime value current. If anything is missing, the built value stays. */
export function initUptime(): void {
  const root = document.querySelector<HTMLElement>('[data-uptime]');
  const days = root?.querySelector<HTMLElement>('[data-uptime-days]');
  const clock = root?.querySelector<HTMLElement>('[data-uptime-clock]');
  if (!root || !days || !clock) return;

  const start = new Date(root.dataset.start ?? '');
  if (Number.isNaN(start.getTime())) return;

  const tick = () => {
    const duration = durationBetween(start, new Date());
    days.textContent = formatDuration(duration);
    clock.textContent = formatClock(duration);
  };

  tick();
  window.setInterval(tick, 1000);
}
```

`src/scripts/robot-eyes.ts`:

```ts
/** How far a pupil may move from the centre of its eye, in SVG units. */
const MAX_OFFSET = 4.5;
/** Pointer distance, in pixels, at which the pupils reach the edge of the eye. */
const FULL_DISTANCE = 160;

/** Makes the robot's pupils follow the pointer. Skipped for touch and reduced motion. */
export function initRobot(): void {
  const robot = document.querySelector<SVGSVGElement>('[data-robot]');
  if (!robot) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const eyes = [...robot.querySelectorAll<SVGGElement>('[data-eye]')].flatMap((eye) => {
    const socket = eye.querySelector<SVGCircleElement>('[data-socket]');
    const pupil = eye.querySelector<SVGCircleElement>('[data-pupil]');
    return socket && pupil ? [{ socket, pupil }] : [];
  });
  if (eyes.length === 0) return;

  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const update = () => {
    frame = 0;
    for (const { socket, pupil } of eyes) {
      const box = socket.getBoundingClientRect();
      const dx = pointerX - (box.left + box.width / 2);
      const dy = pointerY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance === 0) continue;
      const reach = Math.min(1, distance / FULL_DISTANCE) * MAX_OFFSET;
      const x = (dx / distance) * reach;
      const y = (dy / distance) * reach;
      pupil.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    }
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame === 0) frame = window.requestAnimationFrame(update);
    },
    { passive: true },
  );
}
```

`src/scripts/main.ts` (replace the whole file). Task 7 adds the palette.

```ts
import { initMenu } from './menu';
import { initRobot } from './robot-eyes';
import { initThemeToggle } from './theme';
import { initUptime } from './uptime-ticker';

// Each feature is independent: one failing must not stop the others.
for (const init of [initThemeToggle, initMenu, initUptime, initRobot]) {
  try {
    init();
  } catch (error) {
    console.error(error);
  }
}
```

- [ ] **Step 4: Replace the home page**

`src/pages/index.astro`. Task 6 adds the latest post to the hero.

```astro
---
import DeployLog from '../components/DeployLog.astro';
import Education from '../components/Education.astro';
import Hero from '../components/Hero.astro';
import Hobbies from '../components/Hobbies.astro';
import ProjectList from '../components/ProjectList.astro';
import SayHi from '../components/SayHi.astro';
import SectionHeading from '../components/SectionHeading.astro';
import SpecTable from '../components/SpecTable.astro';
import { roles } from '../data/experience';
import { projects } from '../data/projects';
import { sectionNumber, site } from '../data/site';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout>
  <Hero />

  <section id="about" class="section wrap" aria-labelledby="about-title">
    <SectionHeading id="about-title" number={sectionNumber('about')} title="About" />
    <p class="about">{site.about}</p>
  </section>

  <section id="deploys" class="section wrap" aria-labelledby="deploys-title">
    <SectionHeading
      id="deploys-title"
      number={sectionNumber('deploys')}
      title="Deploys"
      note={`Experience / ${roles.length} releases`}
    />
    <DeployLog />
  </section>

  <section id="education" class="section wrap" aria-labelledby="education-title">
    <SectionHeading id="education-title" number={sectionNumber('education')} title="Education" />
    <Education />
  </section>

  <section id="projects" class="section wrap" aria-labelledby="projects-title">
    <SectionHeading
      id="projects-title"
      number={sectionNumber('projects')}
      title="Projects"
      note={`${projects.length} entries`}
    />
    <ProjectList />
  </section>

  <section id="skills" class="section wrap" aria-labelledby="skills-title">
    <SectionHeading id="skills-title" number={sectionNumber('skills')} title="Skills" />
    <SpecTable />
  </section>

  <section id="hobbies" class="section wrap" aria-labelledby="hobbies-title">
    <SectionHeading id="hobbies-title" number={sectionNumber('hobbies')} title="Hobbies" />
    <Hobbies />
  </section>

  <section id="say-hi" class="section wrap" aria-labelledby="say-hi-title">
    <SectionHeading id="say-hi-title" number={sectionNumber('say-hi')} title="Say hi" />
    <SayHi />
  </section>
</BaseLayout>

<style>
  .about {
    max-width: var(--measure);
    font-size: 1.125rem;
  }
</style>
```

- [ ] **Step 5: Check and build**

Run: `npm test && npm run check && npm run build`
Expected: tests pass; `0 errors`; the build lists five optimised project images and ends with `Complete!`.

- [ ] **Step 6: Browser check**

Start the preview and open `http://127.0.0.1:4399/` at 1280px wide. Run in the console:

```js
(async () => {
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
  const clock = document.querySelector('[data-uptime-clock]');
  const first = clock.textContent;
  await new Promise((r) => setTimeout(r, 2100));
  document.querySelector('#projects').scrollIntoView({ behavior: 'instant' });
  await new Promise((r) => setTimeout(r, 800));
  return {
    duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
    sections: ['about', 'deploys', 'education', 'projects', 'skills', 'hobbies', 'say-hi'].map((id) => !!document.getElementById(id)),
    uptimeTicks: clock.textContent !== first,
    uptimeDays: document.querySelector('[data-uptime-days]').textContent,
    activeDeployment: [...document.querySelectorAll('dl dd')][1].textContent.trim(),
    imagesLoaded: [...document.querySelectorAll('#projects img')].map((i) => i.complete && i.naturalWidth > 0),
    sidewaysScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    formAction: document.querySelector('#say-hi form').action,
  };
})();
```

Expected: `duplicateIds: []`; seven `true` values; `uptimeTicks: true`; `uptimeDays` like `8y 3m 28d`; `activeDeployment: "Zapier / SRE"`; five `true` values; `sidewaysScroll: false`; `formAction: "https://formspree.io/mrgedawv"`.

Then check by eye:

- Move the pointer around the robot: the pupils follow it.
- Switch to dark mode: every section is legible, and project screenshots sit on white tiles.
- Click About, Deploys and Projects in the nav: each heading lands below the sticky bar, not under it.
- At 375px wide: no sideways scroll; the telemetry panel is two by two; the uptime days stay on one line; the deploy log stacks.
- With "reduce motion" emulated, reload: the pupils stay centred.

Stop the preview.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat: build the home page sections" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Blog

**Files:**
- Create: `src/content.config.ts`, `src/content/blog/system-online.md`, `src/lib/posts.ts`, `src/lib/blog.ts`, `src/styles/prose.css`, `src/components/PostRow.astro`, `src/layouts/PostLayout.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/blog/tags/[tag].astro`, `src/pages/rss.xml.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/posts.test.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `SectionHeading`, `Hero` `latest` prop, `formatDay`, `readingTime`, `site`.
- Produces:
  - Collection `blog` with fields `title: string`, `description: string`, `pubDate: Date`, `updatedDate?: Date`, `tags: string[]` (default `[]`), `draft: boolean` (default `false`).
  - `interface PostLike { id: string; data: { title; pubDate: Date; draft: boolean; tags: string[] } }`.
  - `publishedPosts<T extends PostLike>(posts: T[], includeDrafts: boolean): T[]` (newest first, ties by `id`).
  - `tagSlug(tag: string): string`, `uniqueTags(tags: string[]): { slug; label }[]`.
  - `groupByTag<T>(posts: T[]): { slug; label; posts: T[] }[]` (sorted by slug).
  - `postNumber<T>(posts: T[], id: string): number` (1 is the oldest; 0 if missing).
  - `adjacentPosts<T>(posts: T[], id: string): { newer?: T; older?: T }`.
  - `type Post = CollectionEntry<'blog'>`, `loadPosts(): Promise<Post[]>`, `postHref(post): string` giving `/blog/<id>/`, `tagHref(slug): string` giving `/blog/tags/<slug>/`.

- [ ] **Step 1: Write the failing test**

`tests/posts.test.ts`. The `tagSlug`, `uniqueTags` and `groupByTag` tests pin Review Focus item 2.

```ts
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
```

- [ ] **Step 2: Run the test to see it fail**

Run: `npm test -- tests/posts.test.ts`
Expected: FAIL with `Failed to resolve import "../src/lib/posts"`.

- [ ] **Step 3: Write the post functions**

`src/lib/posts.ts`. It must not import from Astro, so the tests can run without it.

```ts
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
```

- [ ] **Step 4: Run the test to see it pass**

Run: `npm test`
Expected: PASS, `Tests  62 passed (62)`.

- [ ] **Step 5: Define the collection and the loader**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(), description: z.string(), pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(), tags: z.array(z.string()).default([]), draft: z.boolean().default(false),
  }),
});
export const collections = { blog };
```

`src/lib/blog.ts`:

```ts
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
```

- [ ] **Step 6: Write the starter post**

`src/content/blog/system-online.md`. This is placeholder copy for the owner to edit or delete; say so in the final report.

````markdown
---
title: "System online"
description: "The blog is live. What to expect from these field notes."
pubDate: 2026-09-29
tags: [meta]
draft: false
---

This is the first entry in my field notes.

I plan to write about the things I work on day to day: reliability engineering,
infrastructure, Kubernetes, Terraform, and the open source projects I maintain.
Some posts will be postmortems, some will be short notes on a tool or a fix.

## How this blog works

Each post is a Markdown file in the same repository as the rest of this site.
Publishing is a push to `master`:

```bash
git add src/content/blog/my-new-post.md
git commit -m "post: my new post"
git push
```

More soon.
````

- [ ] **Step 7: Write the post styles, row and layout**

`src/styles/prose.css`:

```css
/* Markdown output has no Astro scope attributes, so post styles are global under .prose. */

.prose {
  max-width: var(--measure);
  font-size: 1.0625rem;
  line-height: 1.7;
  overflow-wrap: break-word;
}

.prose > * + * {
  margin-top: 1.15em;
}

.prose h2,
.prose h3,
.prose h4 {
  margin-top: 1.9em;
  scroll-margin-top: 84px;
}

.prose h2 {
  font-size: 1.625rem;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--rule);
}

.prose h3 {
  font-size: 1.25rem;
}

.prose h4 {
  font-size: 1.0625rem;
}

.prose ul,
.prose ol {
  padding-left: 1.4em;
}

.prose ul {
  list-style: square;
}

.prose ol {
  list-style: decimal;
}

.prose li + li {
  margin-top: 0.4em;
}

.prose li::marker {
  color: var(--accent-text);
}

.prose blockquote {
  margin-inline: 0;
  padding: 4px 0 4px 18px;
  border-left: 3px solid var(--ink);
  color: var(--muted);
}

.prose hr {
  border: 0;
  border-top: 2px solid var(--ink);
  margin-block: 2em;
}

.prose img {
  border: 1px solid var(--rule);
  background: var(--panel);
}

.prose :not(pre) > code {
  padding: 1px 5px;
  border: 1px solid var(--rule);
  background: var(--panel);
  font-family: var(--font-mono);
  font-size: 0.875em;
}

/* Long lines scroll inside the block, never the page. */
.prose pre {
  padding: 14px 16px;
  border: 1px solid var(--rule);
  border-left: 3px solid var(--accent);
  background-color: var(--panel) !important;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
}

.prose table {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.prose th,
.prose td {
  padding: 8px 12px;
  border: 1px solid var(--rule);
  text-align: left;
}

.prose th {
  background: var(--panel);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Shiki emits both themes as CSS variables; pick one to match the site theme. */
.astro-code,
.astro-code span {
  color: var(--shiki-light);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .astro-code,
  :root:not([data-theme='light']) .astro-code span {
    color: var(--shiki-dark);
  }
}

:root[data-theme='dark'] .astro-code,
:root[data-theme='dark'] .astro-code span {
  color: var(--shiki-dark);
}
```

`src/components/PostRow.astro`:

```astro
---
import { postHref, tagHref, type Post } from '../lib/blog';
import { formatDay } from '../lib/dates';
import { uniqueTags } from '../lib/posts';
import { readingTime } from '../lib/reading-time';

interface Props {
  post: Post;
  /** 1 for the oldest post. */
  number: number;
}

const { post, number } = Astro.props;
const tags = uniqueTags(post.data.tags);
---

<li class="row">
  <span class="num" aria-hidden="true">{String(number).padStart(2, '0')}</span>
  <div class="main">
    <a class="title" href={postHref(post)}>{post.data.title}</a>
    {post.data.draft && <span class="tag draft">Draft</span>}
    {
      tags.map((tag) => (
        <a class="tag" href={tagHref(tag.slug)}>
          {tag.label}
        </a>
      ))
    }
    <p class="description">{post.data.description}</p>
  </div>
  <p class="meta label">
    <time datetime={post.data.pubDate.toISOString()}>{formatDay(post.data.pubDate)}</time>
    <span>{readingTime(post.body)} min</span>
  </p>
</li>

<style>
  .row {
    display: grid;
    grid-template-columns: 46px 1fr auto;
    align-items: baseline;
    gap: 10px;
    padding-block: 14px;
    border-bottom: 1px solid var(--rule);
  }

  .num {
    color: var(--accent);
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 700;
  }

  .main {
    min-width: 0;
  }

  .title {
    margin-right: 8px;
    color: var(--ink);
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.25;
    text-decoration: none;
  }

  .title:hover {
    color: var(--accent-text);
    text-decoration: underline;
  }

  .tag {
    display: inline-block;
    margin-right: 4px;
    padding: 0 6px;
    border: 1px solid var(--rule);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    text-decoration: none;
  }

  a.tag:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .draft {
    border-color: var(--accent-text);
    color: var(--accent-text);
  }

  .description {
    margin-top: 4px;
    color: var(--muted);
    font-size: 0.9375rem;
  }

  .meta {
    display: grid;
    justify-items: end;
    gap: 2px;
    white-space: nowrap;
  }

  @media (max-width: 720px) {
    .row {
      grid-template-columns: 34px 1fr;
    }

    .meta {
      grid-column: 2;
      grid-auto-flow: column;
      justify-content: start;
      gap: 12px;
    }
  }
</style>
```

`src/layouts/PostLayout.astro`:

```astro
---
import '../styles/prose.css';
import { postHref, tagHref, type Post } from '../lib/blog';
import { formatDay } from '../lib/dates';
import { adjacentPosts, postNumber, uniqueTags } from '../lib/posts';
import { readingTime } from '../lib/reading-time';
import BaseLayout from './BaseLayout.astro';

interface Props {
  post: Post;
  /** Every post in this build, newest first. */
  posts: Post[];
}

const { post, posts } = Astro.props;
const { newer, older } = adjacentPosts(posts, post.id);
const number = String(postNumber(posts, post.id)).padStart(2, '0');
const tags = uniqueTags(post.data.tags);
---

<BaseLayout title={post.data.title} description={post.data.description} type="article">
  <article class="post wrap">
    <header class="head">
      <ul class="label meta">
        <li><a href="/blog/">Field note {number}</a></li>
        <li>
          <time datetime={post.data.pubDate.toISOString()}>{formatDay(post.data.pubDate)}</time>
        </li>
        <li>{readingTime(post.body)} min read</li>
        {post.data.draft && <li class="draft">Draft</li>}
      </ul>
      <h1>{post.data.title}</h1>
      <p class="description">{post.data.description}</p>
      {
        post.data.updatedDate && (
          <p class="label">
            Updated{' '}
            <time datetime={post.data.updatedDate.toISOString()}>
              {formatDay(post.data.updatedDate)}
            </time>
          </p>
        )
      }
    </header>

    <div class="prose">
      <slot />
    </div>

    {
      tags.length > 0 && (
        <ul class="tags" aria-label="Tags">
          {tags.map((tag) => (
            <li>
              <a href={tagHref(tag.slug)}>{tag.label}</a>
            </li>
          ))}
        </ul>
      )
    }

    <nav class="adjacent" aria-label="More posts">
      {
        older ? (
          <a href={postHref(older)}>
            <span class="label">Older</span>
            {older.data.title}
          </a>
        ) : (
          <span />
        )
      }
      {
        newer && (
          <a class="newer" href={postHref(newer)}>
            <span class="label">Newer</span>
            {newer.data.title}
          </a>
        )
      }
    </nav>
  </article>
</BaseLayout>

<style>
  .post {
    padding-block: 40px 24px;
  }

  .head {
    max-width: var(--measure);
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--ink);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
  }

  .meta li + li::before {
    content: '/';
    margin-right: 8px;
  }

  .meta a {
    color: inherit;
  }

  h1 {
    margin-block: 12px;
    font-size: clamp(1.875rem, 6vw, 2.75rem);
    overflow-wrap: break-word;
  }

  .description {
    margin-bottom: 10px;
    color: var(--muted);
    font-size: 1.125rem;
  }

  .draft {
    color: var(--accent-text);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: var(--measure);
    margin-top: 36px;
  }

  .tags a {
    display: block;
    padding: 2px 10px;
    border: 1px solid var(--rule);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    text-decoration: none;
  }

  .tags a:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .adjacent {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    max-width: var(--measure);
    margin-top: 28px;
    padding-top: 18px;
    border-top: 1px solid var(--rule);
  }

  .adjacent a {
    display: grid;
    gap: 4px;
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 600;
    text-decoration: none;
  }

  .adjacent a:hover {
    color: var(--accent-text);
  }

  .newer {
    text-align: right;
  }

  @media (max-width: 720px) {
    .adjacent {
      grid-template-columns: 1fr;
    }

    .newer {
      text-align: left;
    }
  }
</style>
```

- [ ] **Step 8: Write the routes**

`src/pages/blog/index.astro`:

```astro
---
import PostRow from '../../components/PostRow.astro';
import SectionHeading from '../../components/SectionHeading.astro';
import { site } from '../../data/site';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { loadPosts, tagHref } from '../../lib/blog';
import { groupByTag, postNumber } from '../../lib/posts';

const posts = await loadPosts();
const tags = groupByTag(posts);
const count = posts.length === 1 ? '1 entry' : `${posts.length} entries`;
---

<BaseLayout title="Blog" description={site.blogDescription}>
  <section class="section wrap" aria-labelledby="blog-title">
    <SectionHeading id="blog-title" level={1} title="Blog" note={`${site.blogTitle} / ${count}`} />

    {
      posts.length === 0 ? (
        <p class="empty">No field notes filed yet.</p>
      ) : (
        <>
          {tags.length > 0 && (
            <ul class="tags" aria-label="Tags">
              {tags.map((tag) => (
                <li>
                  <a href={tagHref(tag.slug)}>
                    {tag.label} <span>{tag.posts.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <ol class="rows" reversed>
            {posts.map((post) => (
              <PostRow post={post} number={postNumber(posts, post.id)} />
            ))}
          </ol>
        </>
      )
    }

    <p class="feed label"><a href="/rss.xml">Subscribe by RSS</a></p>
  </section>
</BaseLayout>

<style>
  .empty {
    color: var(--muted);
    font-family: var(--font-mono);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .tags a {
    display: block;
    padding: 2px 10px;
    border: 1px solid var(--rule);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    text-decoration: none;
  }

  .tags a:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .tags span {
    color: var(--accent-text);
  }

  .feed {
    margin-top: 24px;
  }
</style>
```

`src/pages/blog/[slug].astro`:

```astro
---
import { render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';
import { loadPosts, type Post } from '../../lib/blog';

export async function getStaticPaths() {
  const posts = await loadPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post, posts } }));
}

interface Props {
  post: Post;
  posts: Post[];
}

const { post, posts } = Astro.props;
const { Content } = await render(post);
---

<PostLayout post={post} posts={posts}>
  <Content />
</PostLayout>
```

`src/pages/blog/tags/[tag].astro`:

```astro
---
import PostRow from '../../../components/PostRow.astro';
import SectionHeading from '../../../components/SectionHeading.astro';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { loadPosts, type Post } from '../../../lib/blog';
import { groupByTag, postNumber } from '../../../lib/posts';

export async function getStaticPaths() {
  const posts = await loadPosts();
  return groupByTag(posts).map((group) => ({
    params: { tag: group.slug },
    props: { label: group.label, tagged: group.posts, posts },
  }));
}

interface Props {
  label: string;
  /** Posts carrying this tag, newest first. */
  tagged: Post[];
  /** Every post, so rows keep their site-wide numbers. */
  posts: Post[];
}

const { label, tagged, posts } = Astro.props;
const count = tagged.length === 1 ? '1 entry' : `${tagged.length} entries`;
---

<BaseLayout title={`Posts tagged ${label}`} description={`Field notes tagged ${label}.`}>
  <section class="section wrap" aria-labelledby="tag-title">
    <SectionHeading id="tag-title" level={1} title={label} note={`Tag / ${count}`} />
    <ol reversed>
      {tagged.map((post) => <PostRow post={post} number={postNumber(posts, post.id)} />)}
    </ol>
    <p class="back label"><a href="/blog/">All posts</a></p>
  </section>
</BaseLayout>

<style>
  .back {
    margin-top: 24px;
  }
</style>
```

`src/pages/rss.xml.ts`:

```ts
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
```

- [ ] **Step 9: Show the latest post on the home page**

In `src/pages/index.astro`, replace these two lines of the front matter:

```astro
import BaseLayout from '../layouts/BaseLayout.astro';
---
```

with:

```astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { loadPosts, postHref } from '../lib/blog';
import { readingTime } from '../lib/reading-time';

const [newest] = await loadPosts();
const latest = newest && {
  title: newest.data.title,
  href: postHref(newest),
  minutes: readingTime(newest.body),
};
---
```

and replace `<Hero />` with `<Hero latest={latest} />`.

The file must now match this exactly:

```astro
---
import DeployLog from '../components/DeployLog.astro';
import Education from '../components/Education.astro';
import Hero from '../components/Hero.astro';
import Hobbies from '../components/Hobbies.astro';
import ProjectList from '../components/ProjectList.astro';
import SayHi from '../components/SayHi.astro';
import SectionHeading from '../components/SectionHeading.astro';
import SpecTable from '../components/SpecTable.astro';
import { roles } from '../data/experience';
import { projects } from '../data/projects';
import { sectionNumber, site } from '../data/site';
import BaseLayout from '../layouts/BaseLayout.astro';
import { loadPosts, postHref } from '../lib/blog';
import { readingTime } from '../lib/reading-time';

const [newest] = await loadPosts();
const latest = newest && {
  title: newest.data.title,
  href: postHref(newest),
  minutes: readingTime(newest.body),
};
---

<BaseLayout>
  <Hero latest={latest} />

  <section id="about" class="section wrap" aria-labelledby="about-title">
    <SectionHeading id="about-title" number={sectionNumber('about')} title="About" />
    <p class="about">{site.about}</p>
  </section>

  <section id="deploys" class="section wrap" aria-labelledby="deploys-title">
    <SectionHeading
      id="deploys-title"
      number={sectionNumber('deploys')}
      title="Deploys"
      note={`Experience / ${roles.length} releases`}
    />
    <DeployLog />
  </section>

  <section id="education" class="section wrap" aria-labelledby="education-title">
    <SectionHeading id="education-title" number={sectionNumber('education')} title="Education" />
    <Education />
  </section>

  <section id="projects" class="section wrap" aria-labelledby="projects-title">
    <SectionHeading
      id="projects-title"
      number={sectionNumber('projects')}
      title="Projects"
      note={`${projects.length} entries`}
    />
    <ProjectList />
  </section>

  <section id="skills" class="section wrap" aria-labelledby="skills-title">
    <SectionHeading id="skills-title" number={sectionNumber('skills')} title="Skills" />
    <SpecTable />
  </section>

  <section id="hobbies" class="section wrap" aria-labelledby="hobbies-title">
    <SectionHeading id="hobbies-title" number={sectionNumber('hobbies')} title="Hobbies" />
    <Hobbies />
  </section>

  <section id="say-hi" class="section wrap" aria-labelledby="say-hi-title">
    <SectionHeading id="say-hi-title" number={sectionNumber('say-hi')} title="Say hi" />
    <SayHi />
  </section>
</BaseLayout>

<style>
  .about {
    max-width: var(--measure);
    font-size: 1.125rem;
  }
</style>
```

- [ ] **Step 10: Check and build**

Run: `npm test && npm run check && npm run build`
Expected: tests pass; `0 errors`; the build lists `/blog/index.html`, `/blog/system-online/index.html`, `/blog/tags/meta/index.html`, `/rss.xml` and `/index.html`.

- [ ] **Step 11: Verify drafts, invalid posts and the empty state**

Create two throwaway posts. Do not commit them.

`src/content/blog/zz-draft.md`:

```markdown
---
title: "A draft that must not publish"
description: "Draft."
pubDate: 2026-10-01
draft: true
---
Draft body.
```

`src/content/blog/zz-stress-test.md`:

````markdown
---
title: "Postmortem: the day DNS took the cluster down and a VeryLongUnbrokenIdentifierThatCannotWrapNormally_inTheTitle"
description: "A stress test post with a long title, long code lines, a table and mixed-case tags."
pubDate: 2026-09-30
tags: [Postmortem, "Site Reliability", k8s, K8s]
---

Intro paragraph with `inline code` and a [link](https://example.com/a/very/long/url/that/keeps/going/and/going/and/going/without/any/break/characters).

## What happened

```bash
kubectl get pods --all-namespaces --field-selector=status.phase!=Running -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName
```

| Time | Event | Owner | Notes that go on for quite a while to force width |
|---|---|---|---|
| 09:00 | CoreDNS CrashLoopBackOff | me | Something long enough to make the table wider than a phone screen |
````

Run: `npm run build && grep -rl "must not publish" dist; ls dist/blog/tags`
Expected: `grep` prints nothing (the draft is nowhere in the build); the tag folders are `k8s`, `meta`, `postmortem`, `site-reliability`.

Now check that an invalid post fails the build. Remove the `description` line from `zz-draft.md`, then:

Run: `npm run build`
Expected: the build FAILS and the message names `zz-draft` and `description`.

Delete `zz-draft.md`.

- [ ] **Step 12: Browser check**

Run `npm run build`, start the preview, set the width to 375px and open `http://127.0.0.1:4399/blog/zz-stress-test/`. Run in the console (Review Focus item 5):

```js
(() => {
  const doc = document.documentElement;
  const pre = document.querySelector('.prose pre');
  return {
    sidewaysScroll: doc.scrollWidth > doc.clientWidth,
    codeScrollsInside: pre.scrollWidth > pre.clientWidth,
    tagCount: document.querySelectorAll('article .tags a').length,
  };
})();
```

Expected: `sidewaysScroll: false`, `codeScrollsInside: true`, `tagCount: 3` (`k8s` and `K8s` are one tag).

Check by eye at 1280px, in both themes:

- `/blog/` lists both posts, newest first, numbered 02 and 01, with tag links and reading time.
- `/blog/tags/k8s/` lists the stress post and links back to all posts.
- The post page shows the metadata line, the older/newer links and readable code in both themes.
- The home page shows a "Latest post" row linking to the newest post.
- `http://127.0.0.1:4399/rss.xml` loads and lists both posts.

Stop the preview.

- [ ] **Step 13: Verify the empty state, then clean up**

```bash
rm src/content/blog/zz-stress-test.md
mv src/content/blog/system-online.md /tmp/system-online.md
npm run build
grep -c "No field notes filed yet" dist/blog/index.html
grep -c "Latest post" dist/index.html
cat dist/rss.xml
mv /tmp/system-online.md src/content/blog/system-online.md
npm run build
```

Expected: the first build warns that no files were found and still succeeds; the first `grep` prints `1`; the second prints `0`; the feed is valid XML with a `<channel>` and no `<item>`; the final build succeeds.

Run: `git status --short`
Expected: no `zz-` files are listed.

- [ ] **Step 14: Commit**

```bash
git add src tests
git commit -m "feat: add Markdown blog with tags and RSS" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Command palette

**Files:**
- Create: `src/lib/palette.ts`, `src/components/CommandPalette.astro`, `src/scripts/command-palette.ts`
- Modify: `src/scripts/main.ts` (replace), `src/layouts/BaseLayout.astro`
- Test: `tests/palette.test.ts`

**Interfaces:**
- Consumes: `setTheme` (Task 4), `sections`, `site`, `projects`, `activeDeployment` (Task 3), `loadPosts`, `postHref` (Task 6), the `[data-palette-open]` button in the footer (Task 4), `#say-hi-message` (Task 5).
- Produces:
  - `interface PaletteItem { label; hint; href?; external?; action?: 'theme-light' | 'theme-dark'; fill? }`.
  - `interface PaletteIndex { whoami; resumeUrl; sections; projects; posts }` where the last three are `{ label; href }[]`.
  - `resolve(input: string, index: PaletteIndex): { items: PaletteItem[]; message?: string }`.
  - `isOpenShortcut(event: { key; ctrlKey; metaKey; altKey }, typingInField: boolean): boolean`.
  - `UNKNOWN_MESSAGE = 'Unknown command. Try help.'`, `NO_POSTS_MESSAGE = 'No field notes filed yet.'`.
  - `initPalette(): void`.

- [ ] **Step 1: Write the failing test**

`tests/palette.test.ts`. "leaves slash alone while typing in a form field" pins Review Focus item 4.

```ts
import { describe, expect, it } from 'vitest';
import {
  isOpenShortcut,
  NO_POSTS_MESSAGE,
  resolve,
  UNKNOWN_MESSAGE,
  type PaletteIndex,
} from '../src/lib/palette';

const index: PaletteIndex = {
  whoami: 'Manasseh Mmadu, Site Reliability Engineer. Active deployment: Zapier / SRE.',
  resumeUrl: 'https://example.com/resume.pdf',
  sections: [
    { label: 'About', href: '/#about' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Say hi', href: '/#say-hi' },
  ],
  projects: [{ label: 'Reka', href: 'https://github.com/mensaah/reka' }],
  posts: [
    { label: 'Newest post', href: '/blog/newest/' },
    { label: 'Older post', href: '/blog/older/' },
  ],
};

const empty: PaletteIndex = { ...index, posts: [] };
const labels = (input: string, from = index) => resolve(input, from).items.map((i) => i.label);

describe('resolve', () => {
  it('shows sections, the blog, recent posts and help when nothing is typed', () => {
    expect(labels('')).toEqual([
      'About', 'Projects', 'Say hi', 'Blog', 'Newest post', 'Older post', 'help',
    ]);
  });

  it('lists every command for help, each filling the input when chosen', () => {
    const result = resolve('help', index);
    expect(result.items).toHaveLength(10);
    expect(result.items.every((item) => item.fill !== undefined)).toBe(true);
  });

  it('prints the identity line for whoami', () => {
    expect(resolve('whoami', index)).toEqual({ items: [], message: index.whoami });
  });

  it('lists projects as external links', () => {
    expect(resolve('ls projects', index).items).toEqual([
      { label: 'Reka', hint: 'Project', href: 'https://github.com/mensaah/reka', external: true },
    ]);
  });

  it('lists posts, or says there are none', () => {
    expect(labels('ls posts')).toEqual(['Newest post', 'Older post']);
    expect(resolve('ls posts', empty)).toEqual({ items: [], message: NO_POSTS_MESSAGE });
  });

  it('opens the newest post for cat blog/latest, or says there are none', () => {
    expect(resolve('cat blog/latest', index).items[0]?.href).toBe('/blog/newest/');
    expect(resolve('cat blog/latest', empty).message).toBe(NO_POSTS_MESSAGE);
  });

  it('filters sections for goto', () => {
    expect(labels('goto proj')).toEqual(['Projects']);
    expect(labels('goto')).toEqual(['About', 'Projects', 'Say hi']);
    expect(resolve('goto nowhere', index).message).toBe(UNKNOWN_MESSAGE);
  });

  it('switches theme', () => {
    expect(resolve('theme dark', index).items[0]?.action).toBe('theme-dark');
    expect(resolve('theme light', index).items[0]?.action).toBe('theme-light');
  });

  it('goes to the form for say hi and opens the resume', () => {
    expect(resolve('say hi', index).items[0]?.href).toBe('/#say-hi');
    expect(resolve('resume', index).items[0]).toMatchObject({
      href: 'https://example.com/resume.pdf',
      external: true,
    });
  });

  it('ignores case and extra spaces', () => {
    expect(labels('  LS   Projects ')).toEqual(['Reka']);
  });

  it('filters everything by what was typed', () => {
    expect(labels('older')).toEqual(['Older post']);
    expect(labels('rek')).toEqual(['Reka']);
  });

  it('says so when nothing matches', () => {
    expect(resolve('sudo rm -rf /', index)).toEqual({ items: [], message: UNKNOWN_MESSAGE });
  });
});

describe('isOpenShortcut', () => {
  const key = (k: string, mods: Partial<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean }> = {}) => ({
    key: k, ctrlKey: false, metaKey: false, altKey: false, ...mods,
  });

  it('opens on slash when not typing', () => {
    expect(isOpenShortcut(key('/'), false)).toBe(true);
  });

  it('leaves slash alone while typing in a form field', () => {
    expect(isOpenShortcut(key('/'), true)).toBe(false);
  });

  it('opens on Ctrl+K and Cmd+K even while typing', () => {
    expect(isOpenShortcut(key('k', { ctrlKey: true }), true)).toBe(true);
    expect(isOpenShortcut(key('K', { metaKey: true }), false)).toBe(true);
  });

  it('ignores other keys and Alt combinations', () => {
    expect(isOpenShortcut(key('k'), false)).toBe(false);
    expect(isOpenShortcut(key('/', { ctrlKey: true }), false)).toBe(false);
    expect(isOpenShortcut(key('k', { ctrlKey: true, altKey: true }), false)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `npm test -- tests/palette.test.ts`
Expected: FAIL with `Failed to resolve import "../src/lib/palette"`.

- [ ] **Step 3: Write the palette logic**

`src/lib/palette.ts`:

```ts
export type PaletteAction = 'theme-light' | 'theme-dark';

export interface PaletteItem {
  label: string;
  hint: string;
  href?: string;
  external?: boolean;
  action?: PaletteAction;
  /** Text to put in the input instead of navigating. Used by `help`. */
  fill?: string;
}

export interface PaletteIndex {
  whoami: string;
  resumeUrl: string;
  sections: { label: string; href: string }[];
  projects: { label: string; href: string }[];
  /** Newest first. */
  posts: { label: string; href: string }[];
}

export interface PaletteResult {
  items: PaletteItem[];
  message?: string;
}

export const UNKNOWN_MESSAGE = 'Unknown command. Try help.';
export const NO_POSTS_MESSAGE = 'No field notes filed yet.';

const COMMANDS: { command: string; hint: string }[] = [
  { command: 'help', hint: 'List the commands' },
  { command: 'whoami', hint: 'Name, title and active deployment' },
  { command: 'ls projects', hint: 'List projects' },
  { command: 'ls posts', hint: 'List blog posts' },
  { command: 'cat blog/latest', hint: 'Open the newest post' },
  { command: 'goto ', hint: 'Go to a section, for example goto projects' },
  { command: 'theme light', hint: 'Switch to light mode' },
  { command: 'theme dark', hint: 'Switch to dark mode' },
  { command: 'say hi', hint: 'Go to the Say hi form' },
  { command: 'resume', hint: 'Open the resume PDF' },
];

const SAY_HI_HREF = '/#say-hi';

function sectionItems(index: PaletteIndex): PaletteItem[] {
  return index.sections.map((s) => ({ label: s.label, hint: 'Section', href: s.href }));
}

function projectItems(index: PaletteIndex): PaletteItem[] {
  return index.projects.map((p) => ({
    label: p.label,
    hint: 'Project',
    href: p.href,
    external: true,
  }));
}

function postItems(index: PaletteIndex): PaletteItem[] {
  return index.posts.map((p) => ({ label: p.label, hint: 'Post', href: p.href }));
}

function commandItems(): PaletteItem[] {
  return COMMANDS.map((c) => ({ label: c.command.trim(), hint: c.hint, fill: c.command }));
}

function matches(item: PaletteItem, query: string): boolean {
  return item.label.toLowerCase().includes(query);
}

/** Turns what was typed into the list to show. Pure: it never touches the page. */
export function resolve(input: string, index: PaletteIndex): PaletteResult {
  const query = input.trim().toLowerCase().replace(/\s+/g, ' ');

  if (query === '') {
    return {
      items: [
        ...sectionItems(index),
        { label: 'Blog', hint: 'Page', href: '/blog/' },
        ...postItems(index).slice(0, 5),
        { label: 'help', hint: 'List the commands', fill: 'help' },
      ],
    };
  }

  if (query === 'help') return { items: commandItems() };
  if (query === 'whoami') return { items: [], message: index.whoami };
  if (query === 'ls projects') return { items: projectItems(index) };

  if (query === 'ls posts') {
    const items = postItems(index);
    return items.length > 0 ? { items } : { items, message: NO_POSTS_MESSAGE };
  }

  if (query === 'cat blog/latest') {
    const latest = postItems(index)[0];
    return latest ? { items: [latest] } : { items: [], message: NO_POSTS_MESSAGE };
  }

  if (query === 'goto' || query.startsWith('goto ')) {
    const wanted = query.slice('goto'.length).trim();
    const items = sectionItems(index).filter((item) => matches(item, wanted));
    return items.length > 0 ? { items } : { items, message: UNKNOWN_MESSAGE };
  }

  if (query === 'theme light') {
    return { items: [{ label: 'Light mode', hint: 'Theme', action: 'theme-light' }] };
  }
  if (query === 'theme dark') {
    return { items: [{ label: 'Dark mode', hint: 'Theme', action: 'theme-dark' }] };
  }
  if (query === 'say hi') {
    return { items: [{ label: 'Say hi', hint: 'Section', href: SAY_HI_HREF }] };
  }
  if (query === 'resume') {
    return {
      items: [{ label: 'Resume', hint: 'PDF', href: index.resumeUrl, external: true }],
    };
  }

  const items = [
    ...sectionItems(index),
    { label: 'Blog', hint: 'Page', href: '/blog/' },
    ...postItems(index),
    ...projectItems(index),
    ...commandItems(),
  ].filter((item) => matches(item, query));

  return items.length > 0 ? { items } : { items, message: UNKNOWN_MESSAGE };
}

export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

/** `/` opens the palette unless the person is typing; Ctrl+K and Cmd+K always do. */
export function isOpenShortcut(event: KeyLike, typingInField: boolean): boolean {
  if (event.altKey) return false;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') return true;
  if (event.ctrlKey || event.metaKey) return false;
  return event.key === '/' && !typingInField;
}
```

- [ ] **Step 4: Run the test to see it pass**

Run: `npm test`
Expected: PASS, `Test Files  8 passed (8)`, `Tests  78 passed (78)`.

- [ ] **Step 5: Write the component and the script**

`src/components/CommandPalette.astro`:

```astro
---
import { activeDeployment } from '../data/experience';
import { projects } from '../data/projects';
import { sections, site } from '../data/site';
import { loadPosts, postHref } from '../lib/blog';
import type { PaletteIndex } from '../lib/palette';

const posts = await loadPosts();

const index: PaletteIndex = {
  whoami: `${site.name}, ${site.title}. Active deployment: ${activeDeployment()}.`,
  resumeUrl: site.resumeUrl,
  sections: sections.map((section) => ({ label: section.label, href: `/#${section.id}` })),
  projects: projects.map((project) => ({ label: project.name, href: project.links[0].href })),
  posts: posts.map((post) => ({ label: post.data.title, href: postHref(post) })),
};

// "<" is escaped so a post title can never close the script element.
const json = JSON.stringify(index).replace(/</g, '\\u003c');
---

<dialog class="palette" data-palette aria-label="Command palette">
  <form class="palette-form" method="dialog" data-palette-form>
    <label class="palette-prompt">
      <span aria-hidden="true">&gt;</span>
      <span class="visually-hidden">Command</span>
      <input
        type="text"
        data-palette-input
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-autocomplete="list"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Type a command or search. Try help"
      />
    </label>
    <p class="palette-message" data-palette-message role="status" hidden></p>
    <ul id="palette-list" class="palette-list" role="listbox" aria-label="Results" data-palette-list>
    </ul>
    <p class="palette-keys label">Up and down to move / Enter to open / Esc to close</p>
  </form>
</dialog>

<script type="application/json" id="palette-index" set:html={json} />

<style is:global>
  /* Rows are created by command-palette.ts, so these styles cannot be scoped. */
  .palette {
    width: min(100% - 32px, 620px);
    max-height: min(70vh, 560px);
    margin-top: 12vh;
    padding: 0;
    border: 2px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
    overflow: hidden;
  }

  .palette::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .palette-form {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }

  .palette-prompt {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 2px solid var(--ink);
    color: var(--accent);
    font-family: var(--font-mono);
  }

  .palette-prompt input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 1rem;
  }

  .palette-prompt input::placeholder {
    color: var(--muted);
    opacity: 1;
  }

  .palette-prompt:focus-within {
    box-shadow: inset 3px 0 0 var(--accent);
  }

  .palette-message {
    padding: 12px 16px;
    border-bottom: 1px solid var(--rule);
    background: var(--panel);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .palette-list {
    flex: 1;
    overflow-y: auto;
  }

  .palette-list li {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .palette-list li[aria-selected='true'] {
    background: var(--ink);
    color: var(--paper);
  }

  .palette-hint {
    color: var(--muted);
    text-align: right;
    font-size: 0.6875rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .palette-list li[aria-selected='true'] .palette-hint {
    color: var(--paper);
  }

  .palette-keys {
    padding: 8px 16px;
    background: var(--panel);
  }
</style>
```

`src/scripts/command-palette.ts`:

```ts
import {
  isOpenShortcut,
  resolve,
  type PaletteIndex,
  type PaletteItem,
} from '../lib/palette';
import { setTheme } from './theme';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function initPalette(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-palette]');
  const form = dialog?.querySelector<HTMLFormElement>('[data-palette-form]');
  const input = dialog?.querySelector<HTMLInputElement>('[data-palette-input]');
  const list = dialog?.querySelector<HTMLUListElement>('[data-palette-list]');
  const message = dialog?.querySelector<HTMLElement>('[data-palette-message]');
  const source = document.getElementById('palette-index');
  if (!dialog || !form || !input || !list || !message || !source?.textContent) return;
  if (typeof dialog.showModal !== 'function') return;

  let index: PaletteIndex;
  try {
    index = JSON.parse(source.textContent) as PaletteIndex;
  } catch {
    return;
  }

  let items: PaletteItem[] = [];
  let active = 0;

  const highlight = (position: number) => {
    if (items.length === 0) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    active = (position + items.length) % items.length;
    [...list.children].forEach((child, i) => {
      child.setAttribute('aria-selected', String(i === active));
    });
    const current = list.children[active];
    if (!current) return;
    input.setAttribute('aria-activedescendant', current.id);
    current.scrollIntoView({ block: 'nearest' });
  };

  const run = (position: number) => {
    const item = items[position];
    if (!item) return;

    if (item.fill !== undefined) {
      input.value = item.fill;
      render();
      input.focus();
      return;
    }

    dialog.close();
    if (item.action === 'theme-light') setTheme('light');
    if (item.action === 'theme-dark') setTheme('dark');
    if (!item.href) return;
    if (item.external) window.open(item.href, '_blank', 'noopener');
    else window.location.assign(item.href);
  };

  const render = () => {
    const result = resolve(input.value, index);
    items = result.items;
    message.textContent = result.message ?? '';
    message.hidden = result.message === undefined;

    list.replaceChildren(
      ...items.map((item, i) => {
        const row = document.createElement('li');
        row.id = `palette-item-${i}`;
        row.setAttribute('role', 'option');

        const label = document.createElement('span');
        label.textContent = item.label;
        const hint = document.createElement('span');
        hint.className = 'palette-hint';
        hint.textContent = item.hint;
        row.append(label, hint);

        row.addEventListener('click', () => run(i));
        row.addEventListener('pointermove', () => {
          if (active !== i) highlight(i);
        });
        return row;
      }),
    );
    highlight(0);
  };

  const open = () => {
    if (dialog.open) return;
    input.value = '';
    render();
    dialog.showModal();
    input.focus();
  };

  document.addEventListener('keydown', (event) => {
    if (dialog.open) return;
    if (!isOpenShortcut(event, isTypingTarget(event.target))) return;
    event.preventDefault();
    open();
  });

  document.querySelectorAll<HTMLElement>('[data-palette-open]').forEach((trigger) => {
    trigger.hidden = false;
    trigger.addEventListener('click', open);
  });

  input.addEventListener('input', render);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlight(active + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(active - 1);
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run(active);
  });

  // A click on the backdrop lands on the dialog element itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
```

`src/scripts/main.ts` (replace the whole file):

```ts
import { initPalette } from './command-palette';
import { initMenu } from './menu';
import { initRobot } from './robot-eyes';
import { initThemeToggle } from './theme';
import { initUptime } from './uptime-ticker';

// Each feature is independent: one failing must not stop the others.
for (const init of [initThemeToggle, initMenu, initUptime, initRobot, initPalette]) {
  try {
    init();
  } catch (error) {
    console.error(error);
  }
}
```

- [ ] **Step 6: Add the palette to the layout**

In `src/layouts/BaseLayout.astro`, add this import directly above the `Footer` import:

```astro
import CommandPalette from '../components/CommandPalette.astro';
```

and add `<CommandPalette />` on the line after `<Footer />`.

The file must now match this exactly:

```astro
---
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-400-italic.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '../styles/tokens.css';
import '../styles/base.css';
import CommandPalette from '../components/CommandPalette.astro';
import Footer from '../components/Footer.astro';
import TopBar from '../components/TopBar.astro';
import { site } from '../data/site';

interface Props {
  /** Page title. The site name is added after it. Leave out on the home page. */
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  /** Keeps a page such as the 404 out of search results. */
  noindex?: boolean;
}

const { title, description = site.description, type = 'website', noindex = false } = Astro.props;
const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.title}`;
const canonical = new URL(Astro.url.pathname, Astro.site ?? site.url).href;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex" />}
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/favicon.ico" />
    <link rel="alternate" type="application/rss+xml" title={site.blogTitle} href="/rss.xml" />

    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonical} />
    <meta property="og:site_name" content={site.name} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />

    <!-- Runs before first paint so the stored theme never flashes. Keep in step with theme-storage.ts. -->
    <script is:inline>
      (function () {
        var root = document.documentElement;
        root.classList.add('js');
        try {
          var stored = localStorage.getItem('theme');
          if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;
        } catch (error) {
          /* Storage is blocked: follow the system setting. */
        }
      })();
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <TopBar />
    <main id="main">
      <slot />
    </main>
    <Footer />
    <CommandPalette />
    <script>
      import '../scripts/main';
    </script>
  </body>
</html>
```

- [ ] **Step 7: Check and build**

Run: `npm test && npm run check && npm run build`
Expected: tests pass; `0 errors`; build ends with `Complete!`.

- [ ] **Step 8: Browser check**

Start the preview and open `http://127.0.0.1:4399/`. Run in the console:

```js
(async () => {
  const dialog = document.querySelector('[data-palette]');
  const input = document.querySelector('[data-palette-input]');
  const message = document.querySelector('[data-palette-message]');
  const rows = () => [...document.querySelectorAll('[data-palette-list] li')].map((li) => li.firstChild.textContent);
  const type = (value) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
  const key = (target, init) => target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
  const out = {};

  key(document.body, { key: '/' });
  out.opensOnSlash = dialog.open;
  type('whoami'); out.whoami = message.textContent;
  type('sudo rm -rf /'); out.unknown = message.textContent;
  type('ls projects'); out.projects = rows().length;
  key(input, { key: 'ArrowDown' }); out.secondRowActive = input.getAttribute('aria-activedescendant');
  dialog.close();

  // Review Focus 4: a slash typed in the message box must not open the palette.
  const box = document.querySelector('#say-hi-message');
  box.focus();
  key(box, { key: '/' }); out.slashInMessageBoxOpens = dialog.open;
  key(box, { key: 'k', ctrlKey: true }); out.ctrlKOpens = dialog.open;

  type('theme dark');
  document.querySelector('[data-palette-form]').requestSubmit();
  await new Promise((r) => setTimeout(r, 100));
  out.themeAfterCommand = document.documentElement.dataset.theme;
  out.closedAfterRun = !dialog.open;
  out.footerHintVisible = !document.querySelector('[data-palette-open]').hidden;
  return out;
})();
```

Expected: `opensOnSlash: true`; `whoami: "Manasseh Mmadu, Site Reliability Engineer. Active deployment: Zapier / SRE."`; `unknown: "Unknown command. Try help."`; `projects: 6`; `secondRowActive: "palette-item-1"`; `slashInMessageBoxOpens: false`; `ctrlKOpens: true`; `themeAfterCommand: "dark"`; `closedAfterRun: true`; `footerHintVisible: true`.

Then by hand: press `/`, type `cat blog/latest`, press Enter, and confirm the newest post opens. Press `/`, then Escape, and confirm focus returns to the page. Click outside the palette and confirm it closes. Click "Press / for commands" in the footer and confirm it opens. Check the palette at 375px wide and in both themes.

Stop the preview.

- [ ] **Step 9: Commit**

```bash
git add src tests
git commit -m "feat: add command palette" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: 404 page, README and deployment

**Files:**
- Create: `src/pages/404.astro`, `.github/workflows/deploy.yml`
- Modify: `README.md` (replace)

**Interfaces:**
- Consumes: `BaseLayout` (`noindex` prop), `Robot` (`figure` prop).
- Produces: `dist/404.html`; a workflow with jobs `test`, `build`, `deploy`.

- [ ] **Step 1: Write the 404 page**

`src/pages/404.astro`:

```astro
---
import Robot from '../components/Robot.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Unit lost" description="This page is not in the manual." noindex>
  <section class="lost wrap">
    <div>
      <p class="label">Error 404</p>
      <h1>Unit lost</h1>
      <p class="text">This page is not in the manual. It may have moved, or the link may be wrong.</p>
      <p class="actions">
        <a class="button" href="/">Return home</a>
        <a class="button button-ghost" href="/blog/">Read the blog</a>
      </p>
    </div>
    <Robot figure="FIG. 404" />
  </section>
</BaseLayout>

<style>
  .lost {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 24px;
    padding-block: 72px;
  }

  h1 {
    margin-block: 10px 14px;
    font-size: clamp(2.5rem, 9vw, 4.5rem);
    text-transform: uppercase;
  }

  .text {
    max-width: 44ch;
    color: var(--muted);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 22px;
  }

  @media (max-width: 720px) {
    .lost {
      grid-template-columns: 1fr;
      padding-block: 40px;
    }

    .lost :global(.robot) {
      justify-items: start;
    }
  }
</style>
```

- [ ] **Step 2: Write the deploy workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
        with:
          node-version: 24

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

`withastro/action` installs dependencies, runs `astro build` and uploads the Pages artifact.

- [ ] **Step 3: Replace the README**

`README.md` (replace the whole file; the old one documents the removed template):

````markdown
# mensaah.me

Personal site and blog of Manasseh Mmadu. Built with [Astro](https://astro.build)
and deployed to GitHub Pages.

## Local development

Requires Node 22.12 or newer.

```bash
npm install
npm run dev       # http://localhost:4321, drafts visible
npm test          # unit tests
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
| Roles | `src/data/experience.ts` |
| Education | `src/data/education.ts` |
| Projects | `src/data/projects.ts` |
| Skills and hobbies | `src/data/skills.ts` |

The current role is the entry in `experience.ts` without an `end`. There can
only be one; a test enforces it. In Claude Code, the `add-role` skill adds a
role and updates everything that depends on it.

## Deployment

`.github/workflows/deploy.yml` tests, builds and deploys on every push to
`master`. The repository's Pages source must be set to "GitHub Actions"
(Settings, Pages). The custom domain comes from `public/CNAME`.

## Design

The design spec is in `docs/superpowers/specs/`. Colours are tokens in
`src/styles/tokens.css`; `tests/contrast.test.ts` fails if a pair drops below
WCAG AA.
````

- [ ] **Step 4: Build and verify**

Run: `npm run build && ls dist/404.html dist/CNAME && grep -c 'noindex' dist/404.html`
Expected: both files are listed; the count is `1`.

Start the preview, open `http://127.0.0.1:4399/does-not-exist` and confirm the "Unit lost" page shows with working links home and to the blog. Stop the preview.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add 404 page, deploy workflow and README" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Maintenance skills

**Files:**
- Create: `.claude/skills/add-role/SKILL.md`, `.claude/skills/add-blog-post/SKILL.md`

**Interfaces:**
- Consumes: the finished file layout from Tasks 1 to 8.
- Produces: two project skills, invocable as `add-role` and `add-blog-post`.

If the `superpowers:writing-skills` skill is available, read it first for front matter and description conventions. The content below already follows them: the description says when to use the skill, and the body is steps plus a table of common mistakes.

- [ ] **Step 1: Write the `add-role` skill**

`.claude/skills/add-role/SKILL.md`:

````markdown
---
name: add-role
description: Use when the owner of this portfolio has a new job, employer, promotion or role to add to the site, or says their current role has ended. Adds the role to the deploy log and updates every place that depends on it.
---

# Add a role

Roles are stored once, in `src/data/experience.ts`. The deploy log, the
"Active deployment" telemetry cell and the command palette's `whoami` all
derive from that file. Do not edit components to add a role.

## 1. Collect the facts

Ask for anything missing. Never invent bullets, dates or titles.

| Fact | Notes |
|---|---|
| Company | As it should be displayed |
| Role title | Full title, for example "Senior Site Reliability Engineer" |
| Short title | Two words at most, for the telemetry cell, for example "Senior SRE" |
| Start month | `YYYY-MM` |
| Current role? | If not, the end month as `YYYY-MM` |
| Bullets | What they did. May be empty |

## 2. Edit `src/data/experience.ts`

1. Read the file. Find the highest `version` (for example `v3.0`).
2. If the new role is current and another role has no `end`, set that role's
   `end` to the new role's start month. Confirm the month with the owner if
   there was a gap.
3. Insert the new role so the array stays sorted newest first by `start`.
4. Give it the next major version: after `v3.0` comes `v4.0`. A promotion
   at the same company is still a new entry with a new major version.
5. Leave `end` out for a current role. Status is derived: no `end` means
   Active, otherwise Retired.

```ts
{
  version: 'v4.0',
  company: 'Example Corp',
  title: 'Senior Site Reliability Engineer',
  shortTitle: 'Senior SRE',
  start: '2027-02',
  bullets: ['Led the migration of the job scheduler to Kubernetes.'],
},
```

## 3. Check what else should change

Ask the owner each question. Change only what they confirm.

| Question | File |
|---|---|
| Should the hero title or one-line summary change? | `src/data/site.ts`: `title`, `summary`, `description` |
| Do the Runtime and Orchestration cells still reflect the stack? | `src/data/site.ts`: `runtime`, `orchestration` |
| Does the About paragraph mention the old role? | `src/data/site.ts`: `about` |
| Does the role add tools or languages? | `src/data/skills.ts` |
| Is the resume document up to date? | The owner edits the Google Doc; `resumeUrl` only changes if the document is replaced |

`careerStart` in `site.ts` does not change: uptime counts from the first role.

## 4. Verify

```bash
npm test
npm run check
npm run build
```

`tests/experience.test.ts` fails if two roles are current, the order is
wrong, a version repeats or a date is not `YYYY-MM`. Fix the data, not the
test.

Then run `npm run dev` and look at the home page: the new role is first in
the deploy log with the right status, and "Active deployment" shows
`Company / Short title`.

## 5. Report

List every file changed and what changed in it. Do not commit or push unless
the owner asks.

## Common mistakes

| Mistake | Fix |
|---|---|
| Two roles without `end` | End the previous role |
| Adding a `status` field | Status is derived from `end` |
| Dates like "Feb 2027" | Use `2027-02` |
| Editing `Telemetry.astro` or `DeployLog.astro` | Edit the data file only |
| Writing bullets the owner did not give | Leave `bullets: []` and ask |
````

- [ ] **Step 2: Write the `add-blog-post` skill**

`.claude/skills/add-blog-post/SKILL.md`:

````markdown
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
````

- [ ] **Step 3: Check every path the skills mention exists**

```bash
for f in src/data/experience.ts src/data/site.ts src/data/skills.ts src/content/blog tests/experience.test.ts src/components/Telemetry.astro src/components/DeployLog.astro src/pages/blog/index.astro src/pages/rss.xml.ts; do test -e "$f" && echo "ok  $f" || echo "MISSING  $f"; done
```

Expected: nine lines starting with `ok`.

- [ ] **Step 4: Commit the skills**

```bash
git add .claude/skills
git commit -m "feat: add add-role and add-blog-post skills" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 5: Exercise `add-role` on a scratch branch**

```bash
git switch -c scratch/skill-check
```

Follow `.claude/skills/add-role/SKILL.md` exactly as written, as if the owner had said: "I started at Example Corp as Senior Site Reliability Engineer (short title: Senior SRE) in February 2027. It is my current role. No bullets yet. Nothing else changes."

Run: `npm test && npm run check && npm run build && grep -o 'Example Corp / Senior SRE' dist/index.html | head -1`
Expected: all pass, and `Example Corp / Senior SRE` is printed.

Check in `src/data/experience.ts` that Zapier now has `end: '2027-02'` and the new role is first with `version: 'v4.0'`.

If following the skill left any step unclear or produced a wrong result, note what was unclear. Fix the skill text in Step 7.

- [ ] **Step 6: Exercise `add-blog-post` on the scratch branch**

Follow `.claude/skills/add-blog-post/SKILL.md` exactly as written, as if the owner had said: "Start a draft called 'Why I rewrote Reka in Go', tagged go and reka. Outline: why Python was the wrong fit, what the rewrite looked like, what I would do differently."

Run: `npm run build && grep -rl "why-i-rewrote-reka-in-go" dist; echo "exit: $?"`
Expected: the build passes and `grep` prints no files (it is a draft).

Set `draft: false` in the new post, then:

Run: `npm run build && ls dist/blog/why-i-rewrote-reka-in-go/index.html dist/blog/tags && grep -c "why-i-rewrote-reka-in-go" dist/blog/index.html dist/rss.xml dist/index.html`
Expected: the post page exists; tag folders include `go` and `reka`; each count is at least `1`.

Confirm the post body contains only the outline points as headings, with no invented prose.

- [ ] **Step 7: Discard the scratch work and apply any fixes**

The scratch branch exists only for this check, so its changes are thrown away.

```bash
git restore .
git clean -fd src/content/blog src/assets/blog
git switch redesign
git branch -D scratch/skill-check
git status --short
```

Expected: no changes listed, and `src/data/experience.ts` has Zapier as the current role again.

If Step 5 or 6 found unclear or wrong instructions, edit the skill file on `redesign`, then commit:

```bash
git add .claude/skills
git commit -m "docs: clarify maintenance skills after trial run" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Final verification

**Files:** none created. Fix anything found in the file that owns it, with its own commit.

**Interfaces:**
- Consumes: the whole site.
- Produces: a verified branch and a report for the owner.

- [ ] **Step 1: Run every automated check from a clean install**

```bash
rm -rf node_modules dist .astro
npm ci
npm test
npm run check
npm run build
```

Expected: `Tests  78 passed (78)`; `0 errors`, `0 warnings`; build ends with `Complete!`.

- [ ] **Step 2: Check the build output**

```bash
ls dist/index.html dist/404.html dist/blog/index.html dist/blog/system-online/index.html dist/blog/tags/meta/index.html dist/rss.xml dist/sitemap-index.xml dist/robots.txt dist/CNAME dist/favicon.ico
grep -rli "fonts.googleapis\|fonts.gstatic\|bootstrap\|jquery\|font-awesome" dist; echo "exit: $?"
grep -o 'id="[^"]*"' dist/index.html | sort | uniq -d
cat dist/index.html dist/blog/index.html dist/404.html | sed 's/Contact request from personal website//' | grep -ci "contact"
```

Expected: all ten files are listed; the second command prints no files; the third prints nothing (no duplicate ids); the fourth prints `0`. The `sed` removes the one allowed use: the hidden subject line of the email the form sends, which visitors never see.

- [ ] **Step 3: Browser pass over every route**

Start the preview. For each of `/`, `/blog/`, `/blog/system-online/`, `/blog/tags/meta/` and `/does-not-exist`, in light and dark mode, at 1280px and 375px:

- No console errors or warnings.
- No sideways scroll: `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- Text is legible and nothing overlaps.

Then once:

- Tab through the home page from the top: the skip link appears first, every interactive element shows a visible focus outline, and the order follows the page.
- Disable JavaScript and reload the home page: all content is readable, the nav links are visible, the theme follows the system setting, the theme toggle is hidden, and the uptime shows the build-time value.
- Validate `http://127.0.0.1:4399/rss.xml` parses as XML: `curl -s http://127.0.0.1:4399/rss.xml | xmllint --noout - && echo valid`.
- Submit the Say hi form with an empty email: the browser blocks it. Do not send a real message.

Stop the preview and delete any screenshots.

- [ ] **Step 4: Confirm the branch state**

Run: `git status --short && git log --oneline master..redesign && git diff --stat master..redesign | tail -1`
Expected: a clean tree; the spec, plan and one commit per task; `master` untouched.

- [ ] **Step 5: Report to the owner**

Report, in plain language:

1. What was built, and that all checks pass, with the numbers from Step 1.
2. How to preview: `npm install`, then `npm run dev`.
3. **The one manual step before merging:** in the repository on GitHub, open Settings, then Pages, and set Source to "GitHub Actions". Until then the workflow cannot publish.
4. Content for the owner to review: the starter post `src/content/blog/system-online.md` is placeholder copy; the Zapier role has no bullets; Reka shows a placeholder tile until an image is supplied; the Say hi intro sentence and the hero summary are new copy.
5. How to use the two skills.
6. Nothing has been pushed or merged. Ask whether to push the branch and open a pull request.

Do not push, merge or open a pull request without the owner's answer.
