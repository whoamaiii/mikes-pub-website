import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const previewPath = '/design-system/';
const evidenceDirectory = path.resolve('output/playwright/who-17');

async function focusTriggerWithKeyboard(page: Page): Promise<void> {
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const trigger = page.getByRole('button', { name: 'Åpne meny' });
  await expect(trigger).toBeFocused();
  await trigger.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

test('captures deterministic WHO-17 navigation evidence', async ({ page, browser }) => {
  test.skip(
    process.env.WHO17_CAPTURE !== '1',
    'Evidence capture runs only when explicitly requested.',
  );
  await mkdir(evidenceDirectory, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { name: '320', width: 320, height: 900 },
    { name: '375', width: 375, height: 900 },
    { name: '768', width: 768, height: 1000 },
    { name: '1023', width: 1023, height: 1000 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(previewPath);
    await focusTriggerWithKeyboard(page);
    await page.screenshot({
      path: path.join(evidenceDirectory, `who-17-${viewport.name}-closed-focus.png`),
      fullPage: false,
    });

    await page.keyboard.press('Enter');
    const closeButton = page.getByRole('button', { name: 'Lukk meny' }).last();
    await expect(closeButton).toBeFocused();
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await page.screenshot({
      path: path.join(evidenceDirectory, `who-17-${viewport.name}-open-focus.png`),
      fullPage: false,
    });
    await closeButton.click();
  }

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(previewPath);
  await focusTriggerWithKeyboard(page);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('dialog', { name: 'Hovedmeny' }).getByRole('link', { name: 'Program' }),
  ).toBeFocused();
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-17-375-open-navigation-focus.png'),
    fullPage: false,
  });

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.reload();
  await focusTriggerWithKeyboard(page);
  await page.keyboard.press('Enter');
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-17-375-forced-colors-open.png'),
    fullPage: false,
  });

  const noJavaScriptContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 900 },
  });
  const noJavaScriptPage = await noJavaScriptContext.newPage();
  await noJavaScriptPage.goto(previewPath);
  const fallback = noJavaScriptPage.locator('[data-mobile-menu-fallback]');
  await fallback.locator('summary').focus();
  await noJavaScriptPage.keyboard.press('Enter');
  await expect(fallback).toHaveAttribute('open', '');
  await noJavaScriptPage.screenshot({
    path: path.join(evidenceDirectory, 'who-17-375-no-javascript-fallback.png'),
    fullPage: false,
  });
  await noJavaScriptContext.close();

  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto(previewPath);
  await focusTriggerWithKeyboard(page);
  await page.keyboard.press('Enter');
  const zoomEquivalent = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(zoomEquivalent.scrollWidth).toBeLessThanOrEqual(zoomEquivalent.clientWidth);
  await page.screenshot({
    path: path.join(evidenceDirectory, 'who-17-200-percent-layout-equivalent.png'),
    fullPage: false,
  });
});
