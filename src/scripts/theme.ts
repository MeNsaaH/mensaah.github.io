import { readStoredTheme, writeStoredTheme, type Theme } from '../lib/theme-storage';

const storage = () => window.localStorage;

export function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies the theme even when it cannot be stored, so the toggle always works. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  writeStoredTheme(storage, theme);
  document.dispatchEvent(new CustomEvent('themechange'));
}

export function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) return;

  const sync = () => {
    const dark = currentTheme() === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };

  const stored = readStoredTheme(storage);
  if (stored) document.documentElement.dataset.theme = stored;
  sync();

  button.addEventListener('click', () => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
  document.addEventListener('themechange', sync);
}
