export type Theme = 'light' | 'dark';

export const THEME_KEY = 'theme';

type StorageGetter = () => Pick<Storage, 'getItem' | 'setItem'>;

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** The stored choice, or null if there is none or storage is blocked. */
export function readStoredTheme(getStorage: StorageGetter): Theme | null {
  try {
    const value = getStorage().getItem(THEME_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/** Returns false when storage is blocked. The caller still applies the theme. */
export function writeStoredTheme(getStorage: StorageGetter, theme: Theme): boolean {
  try {
    getStorage().setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
