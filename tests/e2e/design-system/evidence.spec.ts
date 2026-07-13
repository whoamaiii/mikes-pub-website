import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

const previewPath = '/design-system/';
const evidenceDirectory = path.resolve('output/playwright/who-15');

test('captures deterministic WHO-15 viewport evidence', async ({ page }) => {
  test.skip(
    process.env.WHO15_CAPTURE !== '1',
    'Evidence capture runs only when explicitly requested.',
  );
  await mkdir(evidenceDirectory, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 1000 },
    { name: 'tablet-768', width: 768, height: 1000 },
    { name: 'mobile-375', width: 375, height: 900 },
    { name: 'reflow-320', width: 320, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(previewPath);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await page.screenshot({
      path: path.join(evidenceDirectory, `who-15-${viewport.name}.png`),
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(previewPath);
  await page.keyboard.press('Tab');
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-15-focus-1440.png'),
    fullPage: false,
  });

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(previewPath);
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-15-forced-colors-375.png'),
    fullPage: false,
  });
});
