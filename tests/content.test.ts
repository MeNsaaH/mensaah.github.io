import { describe, expect, it } from 'vitest';
import { certifications, education } from '../src/data/education';
import { roles } from '../src/data/experience';
import { projects } from '../src/data/projects';
import { site } from '../src/data/site';
import { hobbies, skills } from '../src/data/skills';

/** Limits that keep the page brief. Raise one only on purpose. */
const LIMITS = {
  aboutParagraphs: 3,
  aboutCharacters: 600,
  summaryCharacters: 90,
  bulletsPerRole: 6,
  bulletCharacters: 160,
  projectCharacters: 140,
  notesPerSchool: 3,
  hobbyCharacters: 20,
};

describe('content stays brief', () => {
  it('keeps the bio to a few short paragraphs', () => {
    expect(Array.isArray(site.about)).toBe(true);
    expect(site.about.length).toBeGreaterThan(0);
    expect(site.about.length).toBeLessThanOrEqual(LIMITS.aboutParagraphs);
    expect(site.about.join(' ').length).toBeLessThanOrEqual(LIMITS.aboutCharacters);
  });

  it('keeps the hero summary short', () => {
    expect(site.summary.length).toBeLessThanOrEqual(LIMITS.summaryCharacters);
  });

  it.each(roles.map((role) => [role.company, role] as const))(
    'keeps the %s role to a few one-line bullets',
    (_company, role) => {
      expect(role.bullets.length).toBeLessThanOrEqual(LIMITS.bulletsPerRole);
      for (const bullet of role.bullets) {
        expect(bullet.length, bullet).toBeLessThanOrEqual(LIMITS.bulletCharacters);
      }
    },
  );

  it.each(projects.map((project) => [project.name, project] as const))(
    'describes the %s project in one sentence',
    (_name, project) => {
      expect(project.description.length).toBeLessThanOrEqual(LIMITS.projectCharacters);
    },
  );

  it('keeps education notes and hobbies short', () => {
    for (const school of education) {
      expect(school.notes.length).toBeLessThanOrEqual(LIMITS.notesPerSchool);
    }
    for (const hobby of hobbies) {
      expect(hobby.length, hobby).toBeLessThanOrEqual(LIMITS.hobbyCharacters);
    }
  });
});

describe('content is complete', () => {
  it('gives every role that has ended at least one bullet', () => {
    for (const role of roles.filter((r) => r.end !== undefined)) {
      expect(role.bullets.length, role.company).toBeGreaterThan(0);
    }
  });

  it('lists certifications', () => {
    expect(certifications.length).toBeGreaterThan(0);
  });

  it('starts the uptime counter in the month of the first role', () => {
    const first = roles[roles.length - 1]!;
    expect(site.careerStart.slice(0, 7)).toBe(first.start);
  });
});

describe('content is safe to publish', () => {
  const everything = JSON.stringify({ site, roles, education, certifications, projects, skills, hobbies });

  it('contains no phone number', () => {
    expect(everything).not.toMatch(/\+\d{2}[\d\s-]{8,}/);
  });

  it('contains no email address', () => {
    expect(everything).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });

  it('contains no street address or postcode', () => {
    expect(everything).not.toMatch(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/);
  });
});
