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
