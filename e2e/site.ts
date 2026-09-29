import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';

const DIST = path.resolve('dist-e2e');

/** A made-up origin. Every request to it is answered from dist-e2e, so no server is needed. */
export const ORIGIN = 'http://site.test';

const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

export async function serveBuild(page: Page): Promise<void> {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const { pathname } = new URL(route.request().url());
    const relative = decodeURIComponent(pathname);
    const file = path.join(DIST, relative.endsWith('/') ? `${relative}index.html` : relative);
    try {
      await route.fulfill({
        body: await readFile(file),
        contentType: TYPES[path.extname(file)] ?? 'application/octet-stream',
      });
    } catch {
      await route.fulfill({
        status: 404,
        body: await readFile(path.join(DIST, '404.html')),
        contentType: 'text/html',
      });
    }
  });
}

/** How far the page is wider than the window, in pixels. 0 means no sideways scroll. */
export async function sidewaysOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(0, root.scrollWidth - root.clientWidth);
  });
}
