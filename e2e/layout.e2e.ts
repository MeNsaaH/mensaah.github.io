import { expect, test } from '@playwright/test';
import { ORIGIN, serveBuild, sidewaysOverflow } from './site';

// The long post's title contains a metric name that cannot wrap at a space.
const ROUTES = [
  '/',
  '/blog/',
  '/blog/tags/k8s/',
  '/blog/long-title/',
  '/blog/short/',
  '/does-not-exist',
];

test.beforeEach(async ({ page }) => {
  await serveBuild(page);
});

for (const width of [375, 320]) {
  for (const route of ROUTES) {
    test(`${route} does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(ORIGIN + route);
      expect(await sidewaysOverflow(page)).toBe(0);
    });
  }
}

test('wide code and tables scroll inside their own block', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(`${ORIGIN}/blog/long-title/`);
  for (const selector of ['.prose pre', '.prose table']) {
    const scrolls = await page
      .locator(selector)
      .first()
      .evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls, selector).toBe(true);
  }
});

test('the palette list does not scroll sideways with a long title', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(`${ORIGIN}/`);
  await page.keyboard.press('/');
  await page.locator('[data-palette-input]').fill('ls posts');
  const list = page.locator('[data-palette-list]');
  await expect(list.locator('li')).toHaveCount(2);
  expect(await list.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
});

test('tags that differ only by case or spacing share one page', async ({ page }) => {
  await page.goto(`${ORIGIN}/blog/long-title/`);
  await expect(page.locator('article .tags a')).toHaveText(['k8s', 'Site Reliability']);
});

test('a slash typed in the message box does not open the palette', async ({ page }) => {
  await page.goto(`${ORIGIN}/`);
  const box = page.locator('#say-hi-message');
  await box.click();
  await page.keyboard.type('a/b');
  await expect(box).toHaveValue('a/b');
  await expect(page.locator('[data-palette]')).not.toHaveAttribute('open');
});
