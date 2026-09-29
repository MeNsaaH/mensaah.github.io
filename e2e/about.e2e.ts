import { expect, test } from '@playwright/test';
import { ORIGIN, serveBuild } from './site';

test.beforeEach(async ({ page }) => {
  await serveBuild(page);
});

test('the About section shows the portrait as a captioned figure', async ({ page }) => {
  await page.goto(`${ORIGIN}/`);
  const figure = page.locator('#about figure');
  const portrait = figure.getByRole('img', { name: 'Portrait of Manasseh Mmadu' });

  await expect(portrait).toBeVisible();
  await expect(figure.locator('figcaption')).toHaveText(/fig\. 2 \/ operator/i);
  expect(await portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('the bio is told as the manual entry for the unit', async ({ page }) => {
  await page.goto(`${ORIGIN}/`);
  const paragraphs = page.locator('#about .about p');
  await expect(paragraphs).toHaveCount(3);
  await expect(paragraphs.first()).toContainText('Unit MM-01');
  await expect(paragraphs.last()).toContainText('Known issue');
});

test('the portrait is served from this site, not a third party', async ({ page }) => {
  await page.goto(`${ORIGIN}/`);
  const source = await page
    .locator('#about figure img')
    .evaluate((img: HTMLImageElement) => img.currentSrc);
  expect(new URL(source).origin).toBe(ORIGIN);
});

for (const width of [1280, 375, 320]) {
  test(`the portrait fits beside or under the About text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${ORIGIN}/`);
    const text = await page.locator('#about .about').boundingBox();
    const photo = await page.locator('#about figure img').boundingBox();
    expect(text && photo).toBeTruthy();

    // Inside the window, never wider than it.
    expect(photo!.x).toBeGreaterThanOrEqual(0);
    expect(photo!.x + photo!.width).toBeLessThanOrEqual(width);
    // Square, and not overlapping the text.
    expect(Math.abs(photo!.width - photo!.height)).toBeLessThanOrEqual(1);
    const beside = photo!.x >= text!.x + text!.width;
    const under = photo!.y >= text!.y + text!.height;
    expect(beside || under).toBe(true);
    expect(beside).toBe(width >= 1280);
  });
}
