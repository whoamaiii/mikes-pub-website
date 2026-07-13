import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

const evidenceDirectory = path.resolve('output/playwright/who-18');

test('captures deterministic WHO-18 Home evidence', async ({ page }) => {
  test.skip(process.env.WHO18_CAPTURE !== '1', 'Evidence capture runs only when requested.');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const viewports = [
    { name: 'mobile-320', width: 320, height: 900 },
    { name: 'mobile-375', width: 375, height: 900 },
    { name: 'tablet-768', width: 768, height: 1000 },
    { name: 'desktop-1024', width: 1024, height: 1000 },
    { name: 'desktop-1440', width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page
      .getByRole('img', { name: 'Fasaden til Mike’s Pub i Sætre.' })
      .evaluate(async (element: HTMLImageElement) => {
        await element.decode();
      });
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await page.screenshot({
      path: path.join(evidenceDirectory, `who-18-${viewport.name}.png`),
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Hopp til hovedinnhold' });
  await expect(skipLink).toBeFocused();
  await skipLink.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-18-focus-375.png'),
    fullPage: false,
  });

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.reload();
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-18-forced-colors-375.png'),
    fullPage: false,
  });

  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto('/');
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-18-zoom-equivalent-640.png'),
    fullPage: true,
  });
});
