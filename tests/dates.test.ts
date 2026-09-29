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
