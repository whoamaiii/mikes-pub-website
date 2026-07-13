import { expect, test } from '@playwright/test';

const previewPath = '/design-system/';

test.use({ javaScriptEnabled: false });

test('keeps complete keyboard navigation available without JavaScript', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(previewPath);

  const fallback = page.locator('[data-mobile-menu-fallback]');
  const summary = fallback.locator('summary');
  const trigger = page.locator('.mobile-menu-trigger');
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  const reverseTabKey = browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';

  await expect(fallback).toBeVisible();
  await expect(trigger).toBeHidden();
  await expect(fallback).not.toHaveAttribute('open', '');
  expect(await summary.evaluate((element) => element.tagName)).toBe('SUMMARY');
  await expect(summary).toHaveAccessibleName('Meny');
  const links = fallback.locator('a');
  await expect(links).toHaveCount(5);
  await expect(links.first()).toBeHidden();

  await page.keyboard.press(tabKey);
  await page.keyboard.press(tabKey);
  await page.keyboard.press(tabKey);
  await expect(summary).toBeFocused();
  await expect(summary).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(fallback).toHaveAttribute('open', '');
  await expect(summary).toHaveAccessibleName('Meny');

  const currentLink = fallback.locator('a[aria-current="page"]');
  await expect(currentLink).toHaveText('Program');
  for (const label of ['Program', 'Sport', 'På Mike’s', 'Galleri', 'Finn oss']) {
    await page.keyboard.press(tabKey);
    await expect(fallback.getByRole('link', { name: label })).toBeFocused();
  }

  for (let index = 0; index < 5; index += 1) await page.keyboard.press(reverseTabKey);
  await expect(summary).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(fallback).not.toHaveAttribute('open', '');
  await expect(summary).toHaveAccessibleName('Meny');
  await expect(links.first()).toBeHidden();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('shows desktop navigation and hides the fallback at the desktop breakpoint', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(previewPath);

  await expect(page.locator('.desktop-nav')).toBeVisible();
  await expect(page.locator('[data-mobile-menu-fallback]')).toBeHidden();
  await expect(page.locator('.mobile-menu-trigger')).toBeHidden();
});
