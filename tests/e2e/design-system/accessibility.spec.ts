import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const previewPath = '/design-system/';

test('has no detectable accessibility violations', async ({ page }) => {
  await page.goto(previewPath);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('renders full-empty and error EventList states with explicit semantics', async ({ page }) => {
  await page.goto(previewPath);

  const empty = page.locator('[data-preview-event-list-state="empty"]');
  await expect(empty.locator('[data-event-list]')).toHaveCount(1);
  await expect(empty.locator('[data-event-list] li')).toHaveCount(0);
  await expect(empty.locator('[data-event-feedback][data-state="empty"]')).toHaveCount(1);
  await expect(
    empty.getByRole('heading', { name: 'Tom programliste: testtilstand' }),
  ).toBeVisible();
  await expect(empty.getByRole('link', { name: 'Vis filtereksempel' })).toBeVisible();
  await expect(empty.getByRole('alert')).toHaveCount(0);

  const error = page.locator('[data-preview-event-list-state="error"]');
  await expect(error.locator('[data-event-list]')).toHaveCount(1);
  await expect(error.locator('[data-event-list] li')).toHaveCount(0);
  await expect(error.locator('[data-event-feedback][data-state="error"]')).toHaveCount(1);
  await expect(error.getByRole('alert')).toHaveCount(1);
  await expect(error.getByRole('heading', { name: 'Programfeil: testtilstand' })).toBeVisible();
  await expect(error.getByRole('link', { name: 'Prøv eksempelhandling' })).toBeVisible();
});

test('starts with a visible skip-link focus and follows responsive navigation order', async ({
  page,
  browserName,
}) => {
  await page.goto(previewPath);
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(tabKey);

  const skipLink = page.getByRole('link', { name: 'Hopp til hovedinnhold' });
  await expect(skipLink).toBeFocused();
  await skipLink.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await expect(skipLink).toBeVisible();

  const boundingBox = await skipLink.boundingBox();
  const viewport = page.viewportSize();
  expect(boundingBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  const outline = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      offset: Number.parseFloat(style.outlineOffset),
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(outline.style).not.toBe('none');
  expect(outline.width).toBeGreaterThanOrEqual(2);

  const outlineExtent = outline.width + Math.max(outline.offset, 0);
  expect(boundingBox!.x - outlineExtent).toBeGreaterThanOrEqual(0);
  expect(boundingBox!.y - outlineExtent).toBeGreaterThanOrEqual(0);
  expect(boundingBox!.x + boundingBox!.width + outlineExtent).toBeLessThanOrEqual(viewport!.width);
  expect(boundingBox!.y + boundingBox!.height + outlineExtent).toBeLessThanOrEqual(
    viewport!.height,
  );

  await page.keyboard.press(tabKey);
  await expect(page.getByRole('link', { name: 'Mike’s Pub - forside' }).first()).toBeFocused();

  await page.keyboard.press(tabKey);
  const viewportWidth = page.viewportSize()?.width ?? 0;
  if (viewportWidth >= 1024) {
    await expect(page.getByRole('link', { name: 'Program' }).first()).toBeFocused();
  } else {
    await expect(page.getByRole('button', { name: 'Åpne meny' })).toBeFocused();
  }
});

test('moves focus to the main landmark when the skip link is activated', async ({
  page,
  browserName,
}) => {
  await page.goto(previewPath);
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('reflows without document overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(previewPath);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('preserves reflow at the 200 percent layout equivalent', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto(previewPath);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('removes non-essential motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(previewPath);

  const transitionDurations = await page
    .locator('.action-link')
    .first()
    .evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(',')
        .map((duration) => Number.parseFloat(duration)),
    );
  expect(transitionDurations.every((duration) => duration <= 0.00001)).toBe(true);
});

test('retains controls and focus treatment in forced colors', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Forced-colors emulation is validated in Chromium.');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(previewPath);

  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Hopp til hovedinnhold' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Utfør handling' })).toHaveCSS(
    'border-top-style',
    'solid',
  );
});
