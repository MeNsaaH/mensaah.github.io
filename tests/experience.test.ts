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
