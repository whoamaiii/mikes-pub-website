import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

const evidenceDirectory = path.resolve('output/playwright/who-20');

test('captures deterministic WHO-20 Program evidence', async ({ page }) => {
  test.skip(process.env.WHO20_CAPTURE !== '1', 'Evidence capture runs only when requested.');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const viewports = [
    { name: 'mobile-375', width: 375, height: 900 },
    { name: 'tablet-768', width: 768, height: 1000 },
    { name: 'desktop-1440', width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/program');
    await expect(page.locator('[data-program-filter-shell]')).toHaveAttribute(
      'data-program-filter-enhanced',
      'true',
    );
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await page.screenshot({
      path: path.join(evidenceDirectory, `who-20-${viewport.name}.png`),
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/program');
  const standup = page.locator('[data-program-filter-link][data-filter-value="standup"]');
  await standup.focus();
  await page.keyboard.press('Enter');
  await expect(standup).toBeFocused();
  await expect(page.locator('[data-event-feedback]')).toBeVisible();
  await standup.evaluate((element) => {
    element.scrollIntoView({ block: 'start', inline: 'nearest' });
    window.scrollBy({ top: -8 });
  });
  await expect(standup).toBeVisible();
  const box = await standup.boundingBox();
  const filterBox = await page.locator('.category-filter').boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(filterBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(filterBox!.x + 4);
  expect(box!.y).toBeGreaterThanOrEqual(4);
  expect(box!.x + box!.width).toBeLessThanOrEqual(filterBox!.x + filterBox!.width - 4);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height - 4);
  await expect(standup).toHaveCSS('outline-style', 'solid');
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-20-filtered-empty-focus-375.png'),
    fullPage: false,
  });
});
