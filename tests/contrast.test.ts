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
