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
