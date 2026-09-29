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
| Promotion at the same company? | If so, ask whether the owner has separate bullets for the new title. See step 2 |
| Previous role's end month | Only when the new role is current and another role is still open. Ask; do not assume it equals the new start month |
| Bullets | What they did. At most six, each one line (160 characters). Shorten with the owner, do not drop facts silently |
| Links | Optional public work from the role, as label and URL |

If the start month is later than the current month, stop and tell the owner:
the site has no scheduling, so the new role would show as the active
deployment, and the old one as Retired, as soon as the change is published.
Ask whether to go ahead now or wait until the start date.

## 2. Edit `src/data/experience.ts`

1. Read the file. Find the highest `version` (for example `v3.0`).
2. If the new role is current and another role has no `end`, set that role's
   `end` to the month the owner gave for it in step 1. Leaving it open would
   make two roles current, which the tests reject.
3. Insert the new role so the array stays sorted newest first by `start`.
4. Give it the next major version: after `v3.1` comes `v4.0`.
5. A promotion at the same company, without separate bullets for the new
   title, is not a new entry. Update the existing entry instead: set the new
   `title` and `shortTitle`, bump the minor version (`v3.0` becomes `v3.1`),
   and record the change in `note`, for example
   `'Joined as SRE. Promoted to Senior SRE in June 2025.'`. Keep `start` as
   the month they joined the company.
6. Leave `end` out for a current role. Status is derived: no `end` means
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
| Does the bio mention the old employer or role? It is written in a playful voice, as the manual entry for "Unit MM-01", so keep that voice and let the owner approve the wording | `src/data/site.ts`: `about` (one string per paragraph) |
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
wrong, a version repeats or a date is not `YYYY-MM`. `tests/content.test.ts`
fails if an ended role has no bullets, or any role has more than six or one
that is too long, and
if the content contains a phone number, email address or postcode. Fix the
data, not the test.

Then confirm the result in the built page. Replace the placeholders with the
new role's values:

```bash
grep -o '<Company> / <Short title>' dist/index.html | head -1
grep -o '>v[0-9]*\.[0-9]*<' dist/index.html | head -4
```

Expected: the first prints `Company / Short title` (the "Active deployment"
cell). The second lists the versions in deploy-log order, newest first, for
example `>v4.0<`, `>v3.1<`, `>v2.0<`, `>v1.0<` on separate lines.

Offer the owner a preview with `npm run dev` (`http://localhost:4321/`).

## 5. Report

List every file changed and what changed in it. Do not commit or push unless
the owner asks.

## Common mistakes

| Mistake | Fix |
|---|---|
| Two roles without `end` | End the previous role |
| Guessing the previous role's end month | Ask the owner |
| Publishing a role that has not started yet | Warn the owner first; see step 1 |
| Adding a `status` field | Status is derived from `end` |
| Dates like "Feb 2027" | Use `2027-02` |
| Editing `Telemetry.astro` or `DeployLog.astro` | Edit the data file only |
| Writing bullets the owner did not give | Ask for them. A role that has just started may have none; an ended role needs at least one |
| Copying an address or phone number from a resume | Never publish them |
