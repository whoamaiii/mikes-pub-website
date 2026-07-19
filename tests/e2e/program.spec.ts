import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const programPath = '/program';
const conceptDisclosure = 'Privat designforslag. Ikke den offisielle nettsiden til Mike’s Pub.';
const conceptCategories = ['music', 'sport', 'quiz', 'standup'];

test('renders the concept Program directory with working filters and honest labelling', async ({
  page,
}) => {
  const response = await page.goto(programPath);

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Program | Mike’s Pub | privat designforslag');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Program');
  await expect(page.locator('.concept-banner')).toHaveText(conceptDisclosure);
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText('Program');

  await expect(page.getByText('Ingen bekreftede arrangementer er publisert ennå.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Designforslag' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Eksempelprogram' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Filtrer programeksempler' })).toHaveCount(1);
  await expect(page.locator('[data-program-filter-shell]')).toHaveCount(1);
  await expect(page.locator('[data-event-list-region]')).toHaveCount(1);
  await expect(page.locator('[data-event-row]')).toHaveCount(conceptCategories.length);
  for (const category of conceptCategories) {
    await expect(page.locator(`[data-event-row][data-event-category="${category}"]`)).toHaveCount(
      1,
    );
  }
  await expect(page.locator('[data-event-row][data-event-status="concept"]')).toHaveCount(
    conceptCategories.length,
  );
  await expect(page.locator('.event-row-status')).toHaveText(
    conceptCategories.map(() => 'Eksempel'),
  );
  await expect(page.locator('time, .program-main img')).toHaveCount(0);

  await expect(
    page.getByRole('link', { name: 'Åpne veibeskrivelse til Mike’s Pub i Google Maps' }),
  ).toHaveCount(2);
  await expect(
    page.getByRole('link', { name: 'Se siste nytt fra Mike’s Pub på Facebook' }).first(),
  ).toHaveAttribute('href', 'https://www.facebook.com/mikespub.saetre/');
  await expect(page.locator('a[href^="http"]')).toHaveCount(4);

  const visibleText = await page.locator('.program-main').innerText();
  expect(visibleText).not.toMatch(/dato ikke fastsatt/i);
  expect(visibleText).not.toMatch(/\b(?:kl\.|kr|billett|hver fredag|åpningstid)\b/i);
  expect(visibleText).not.toMatch(/\b(?:mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)\b/i);
});

test('filters the concept directory per category from shareable URLs', async ({ page }) => {
  for (const [query, fragment, category] of [
    ['musikk', 'filter-musikk', 'music'],
    ['sport', 'filter-sport', 'sport'],
    ['quiz', 'filter-quiz', 'quiz'],
    ['standup', 'filter-standup', 'standup'],
  ]) {
    await page.goto(`/program?kategori=${query}#${fragment}`);
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);
    await expect(page.locator(`[data-event-row][data-event-category="${category}"]`)).toBeVisible();
    await expect(
      page.locator(`.category-filter a[data-filter-value="${category}"]`),
    ).toHaveAttribute('aria-current', 'page');
  }

  await page.goto('/program?kategori=ukjent#filter-ukjent');
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(conceptCategories.length);
});

test('filters the concept directory through the category links', async ({ page }) => {
  await page.goto(programPath);
  await expect(page.locator('[data-program-filter-shell]')).toHaveAttribute(
    'data-program-filter-enhanced',
    'true',
  );

  await page.locator('.category-filter a[data-filter-value="quiz"]').click();
  await expect(page).toHaveURL(/kategori=quiz/);
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);
  await expect(page.locator('[data-event-row][data-event-category="quiz"]')).toBeVisible();

  await page.locator('.category-filter a[data-filter-value="all"]').click();
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(conceptCategories.length);
});

test('is accessible, same-origin and overflow-safe from narrow mobile to desktop', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(programPath);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth, `${width}px`).toBeLessThanOrEqual(dimensions.clientWidth);
  }

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('moves keyboard focus from the skip link to Program content', async ({
  page,
  browserName,
}) => {
  await page.goto(programPath);
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(tabKey);

  const skipLink = page.getByRole('link', { name: 'Hopp til hovedinnhold' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('shows a contrasting focus ring on the light location action', async ({ page }) => {
  await page.goto(programPath);

  const directions = page.locator('.program-location .action-link');
  await directions.focus();
  await expect(directions).toBeFocused();

  const focusIndicator = await directions.evaluate((element) => {
    const linkStyle = getComputedStyle(element);
    const panel = element.closest('.location-panel');
    if (!panel) throw new Error('Expected the directions link inside a location panel.');

    return {
      outlineColor: linkStyle.outlineColor,
      outlineStyle: linkStyle.outlineStyle,
      outlineWidth: Number.parseFloat(linkStyle.outlineWidth),
      panelColor: getComputedStyle(panel).backgroundColor,
    };
  });

  expect(focusIndicator.outlineStyle).toBe('solid');
  expect(focusIndicator.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(focusIndicator.outlineColor).not.toBe(focusIndicator.panelColor);
});

test('links the accepted Home navigation to Program', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.desktop-nav').getByRole('link', { name: 'Program' }).click();
  await expect(page).toHaveURL(/\/program$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Program' })).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps the concept directory and CSS fragment filtering usable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(programPath);

    await expect(page.locator('[data-program-filter-shell]')).toHaveCount(1);
    await expect(page.locator('[data-program-filter-shell]')).not.toHaveAttribute(
      'data-program-filter-enhanced',
      'true',
    );
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(conceptCategories.length);

    await page.goto('/program?kategori=musikk#filter-musikk');
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);
    await expect(page.locator('[data-event-row][data-event-category="music"]')).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
});
