import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const homePath = '/';
const conceptDisclosure = 'Privat konseptdemo – ikke den offisielle nettsiden til Mike’s Pub.';

test('renders the approved semantic Home hierarchy and safe content', async ({ page }) => {
  const response = await page.goto(homePath);

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Mike’s Pub i Sætre – privat konseptdemo');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mike’s Pub i Sætre');
  await expect(page.locator('.concept-banner')).toHaveText(conceptDisclosure);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow, noarchive',
  );

  const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
  expect(headings).toEqual([
    'Dette skjer på Mike’s',
    'Sport på storskjerm',
    'Dart og shuffleboard',
    'Finn oss i Sætre',
  ]);
  await expect(page.locator('.home-program-item')).toHaveCount(4);
  await expect(page.locator('time')).toHaveCount(0);
  await expect(page.locator('[id]')).toHaveCount(
    await page
      .locator('[id]')
      .evaluateAll((elements) => new Set(elements.map(({ id }) => id)).size),
  );

  const visibleText = await page.locator('body').innerText();
  for (const blockedText of [
    'Puben midt i Sætre',
    'lokalt møtested',
    'Åpningstider',
    'Bestill bord',
    'Konserter, fotball, quiz og gode kvelder',
  ]) {
    expect(visibleText).not.toContain(blockedText);
  }
});

test('uses the verified art-directed exterior image without reference assets', async ({ page }) => {
  await page.goto(homePath);

  const image = page.getByRole('img', { name: 'Fasaden til Mike’s Pub i Sætre.' });
  await expect(image).toBeVisible();
  await expect(page.locator('.home-hero-media')).toHaveAttribute(
    'data-rights-status',
    'demo-cleared',
  );

  const metadata = await image.evaluate((element: HTMLImageElement) => ({
    currentSrc: element.currentSrc,
    height: element.naturalHeight,
    width: element.naturalWidth,
  }));
  expect(new URL(metadata.currentSrc).origin).toBe(new URL(page.url()).origin);
  expect(metadata.currentSrc).not.toMatch(/design-reference|\.tiff?$/i);
  expect([
    { width: 880, height: 660 },
    { width: 960, height: 640 },
  ]).toContainEqual({ width: metadata.width, height: metadata.height });
});

test('keeps Home navigation local, valid and same-origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(homePath);

  const hrefs = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => Boolean(href)),
    );
  expect(hrefs.length).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      (targets) => targets.every((target) => document.querySelector(target)),
      hrefs,
    ),
  ).toBe(true);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
  await expect(page.locator('a[href^="http"]')).toHaveCount(0);
});

test('has no detectable automated accessibility violations', async ({ page }) => {
  await page.goto(homePath);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('moves keyboard focus from the skip link to the main landmark', async ({
  page,
  browserName,
}) => {
  await page.goto(homePath);
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

  const box = await skipLink.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);

  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('reflows without horizontal overflow from 320px through wide desktop', async ({ page }) => {
  for (const width of [320, 375, 480, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(homePath);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth, `${width}px`).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test('preserves reflow at the 200 percent layout equivalent', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto(homePath);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('retains Home structure with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(homePath);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const duration = await page
    .locator('.home-hero .action-link')
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.00001);
});

test('retains structure in forced colors', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Forced-colors emulation is validated in Chromium.');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto(homePath);
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  await expect(page.locator('.home-program-item').first()).toHaveCSS(
    'border-bottom-style',
    'solid',
  );
});
