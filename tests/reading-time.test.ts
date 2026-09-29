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
