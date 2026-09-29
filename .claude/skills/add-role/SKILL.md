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
