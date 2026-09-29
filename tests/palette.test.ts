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
