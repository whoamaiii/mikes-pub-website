import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const programPath = '/program';
const conceptDisclosure = 'Privat konseptdemo – ikke den offisielle nettsiden til Mike’s Pub.';

async function loadEnhancedProgram(page: Page, path = programPath): Promise<void> {
  await page.goto(path);
  await expect(page.locator('[data-program-filter-shell]')).toHaveAttribute(
    'data-program-filter-enhanced',
    'true',
  );
}

async function expectSelected(page: Page, value: string, visibleRows: number): Promise<void> {
  const filter = page.locator(`[data-program-filter-link][data-filter-value="${value}"]`);
  await expect(filter).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(visibleRows);
  await expect(page.locator('[data-filter-summary-value]:visible')).toHaveCount(1);
}

async function expectFilterInsideViewport(page: Page, value: string, inset = 0): Promise<void> {
  const filterViewport = page.locator('.category-filter');
  const filter = page.locator(`[data-program-filter-link][data-filter-value="${value}"]`);
  const filterBox = await filterViewport.boundingBox();
  const linkBox = await filter.boundingBox();

  expect(filterBox).not.toBeNull();
  expect(linkBox).not.toBeNull();
  expect(linkBox!.x).toBeGreaterThanOrEqual(filterBox!.x + inset);
  expect(linkBox!.x + linkBox!.width).toBeLessThanOrEqual(filterBox!.x + filterBox!.width - inset);
}

test('renders the approved semantic Program hierarchy and fact-safe concept content', async ({
  page,
}) => {
  const response = await page.goto(programPath);

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Program – Mike’s Pub privat konseptdemo');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Program');
  await expect(page.locator('.concept-banner')).toHaveText(conceptDisclosure);
  await expect(page.getByRole('navigation', { name: 'Filtrer arrangementer' })).toHaveCount(1);
  await expect(page.locator('[data-event-list]')).toHaveCount(1);
  await expect(page.locator('[data-event-feedback]')).toHaveCount(1);
  await expect(page.locator('[data-event-row]')).toHaveCount(3);
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(3);
  await expect(page.locator('.event-row-temporal')).toHaveText([
    'Datonøytral konseptoppføring',
    'Datonøytral konseptoppføring',
    'Datonøytral konseptoppføring',
  ]);
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText('Program');
  await expect(page.locator('time')).toHaveCount(0);
  await expect(page.locator('[data-event-row] :is(a, button)')).toHaveCount(0);
  await expect(page.locator('.program-main img')).toHaveCount(0);
  await expect(page.locator('a[href^="http"]')).toHaveCount(0);

  const ids = await page.locator('[id]').evaluateAll((elements) => elements.map(({ id }) => id));
  expect(new Set(ids).size).toBe(ids.length);

  const visibleText = await page.locator('.program-main').innerText();
  expect(visibleText).not.toMatch(/\b(?:kl\.|kr|billett|hver fredag|åpningstid)\b/i);
});

test('filters without reload, preserves focus, and follows reload and history state', async ({
  page,
}) => {
  await loadEnhancedProgram(page);
  const documentRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documentRequests.push(request.url());
  });

  const music = page.locator('[data-program-filter-link][data-filter-value="music"]');
  await music.focus();
  await page.keyboard.press('Enter');
  await expect(music).toBeFocused();
  await expect(page).toHaveURL(/\/program\?kategori=musikk#filter-musikk$/);
  await expectSelected(page, 'music', 1);
  expect(documentRequests).toEqual([]);

  await page.locator('[data-program-filter-link][data-filter-value="sport"]').click();
  await expectSelected(page, 'sport', 1);
  await page.goBack();
  await expect(page).toHaveURL(/kategori=musikk#filter-musikk$/);
  await expectSelected(page, 'music', 1);
  await page.goForward();
  await expect(page).toHaveURL(/kategori=sport#filter-sport$/);
  await expectSelected(page, 'sport', 1);

  await page.reload();
  await expect(page.locator('[data-program-filter-shell]')).toHaveAttribute(
    'data-program-filter-enhanced',
    'true',
  );
  await expectSelected(page, 'sport', 1);
});

test('normalizes direct, fragment-only, unknown and contradictory filter state', async ({
  page,
}) => {
  await loadEnhancedProgram(page, '/program?kategori=quiz');
  await expect(page).toHaveURL(/\/program\?kategori=quiz#filter-quiz$/);
  await expectSelected(page, 'quiz', 1);

  await loadEnhancedProgram(page, '/program#filter-musikk');
  await expect(page).toHaveURL(/\/program\?kategori=musikk#filter-musikk$/);
  await expectSelected(page, 'music', 1);

  for (const path of [
    '/program?kategori=ukjent#filter-musikk',
    '/program?kategori=quiz#filter-musikk',
    '/program#filter-ukjent',
  ]) {
    await loadEnhancedProgram(page, path);
    await expect(page).toHaveURL(/\/program\?kategori=alle#filter-all$/);
    await expectSelected(page, 'all', 3);
  }

  await loadEnhancedProgram(page);
  await expect(page).toHaveURL(/\/program$/);
  await expectSelected(page, 'all', 3);
});

test('shows the honest Stand-up filtered-empty state and recovers to Alle', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await loadEnhancedProgram(page);
  const standup = page.locator('[data-program-filter-link][data-filter-value="standup"]');
  await standup.focus();
  await page.keyboard.press('Enter');

  await expect(standup).toBeFocused();
  await expect(page.locator('[data-event-list]')).toBeHidden();
  await expect(page.locator('[data-event-list]')).toHaveCount(1);
  await expect(page.locator('[data-event-feedback]')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Ingen konseptoppføringer i denne kategorien.' }),
  ).toBeVisible();
  await expectFilterInsideViewport(page, 'standup', 4);

  const recovery = page.getByRole('link', { name: 'Vis alle' });
  await page.keyboard.press('Tab');
  await expect(recovery).toBeFocused();
  await page.keyboard.press('Enter');
  await expectSelected(page, 'all', 3);
  await expect(page.locator('[data-event-feedback]')).toBeHidden();
  await expect(page.locator('[data-program-filter-link][data-filter-value="all"]')).toBeFocused();
});

test('is keyboard operable, same-origin, accessible and overflow-safe at 320px', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 320, height: 900 });
  await loadEnhancedProgram(page);

  const music = page.locator('[data-program-filter-link][data-filter-value="music"]');
  await music.focus();
  await expect(music).toBeFocused();
  const targetBox = await music.boundingBox();
  expect(targetBox).not.toBeNull();
  expect(targetBox!.height).toBeGreaterThanOrEqual(44);

  await page.keyboard.press('Enter');
  await expect(music).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.locator('[data-program-filter-link][data-filter-value="standup"]').click();
  const emptyResults = await new AxeBuilder({ page }).analyze();
  expect(emptyResults.violations).toEqual([]);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
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

  test('uses the synchronized fragment fallback for selection, filtering and recovery', async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(programPath);
    await expect(page.locator('[data-program-filter-shell]')).not.toHaveAttribute(
      'data-program-filter-enhanced',
      'true',
    );
    await expect(page.locator('[data-program-filter-link][aria-current]')).toHaveCount(0);
    await expect(page.locator('[data-filter-summary-value="all"]')).toBeVisible();

    const music = page.locator('[data-program-filter-link][data-filter-value="music"]');
    await music.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/kategori=musikk#filter-musikk$/);
    await expect(page.locator('#filter-musikk')).toHaveJSProperty('id', 'filter-musikk');
    expect(
      await page.locator('#filter-musikk').evaluate((target) => target.matches(':target')),
    ).toBe(true);
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);
    await expect(page.locator('[data-filter-summary-value="music"]')).toBeVisible();
    await expect(music).toHaveCSS('border-top-width', '2px');

    await page.reload();
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);

    const standup = page.locator('[data-program-filter-link][data-filter-value="standup"]');
    await standup.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/kategori=standup#filter-standup$/);
    await expect(page.locator('[data-event-list]')).toBeHidden();
    await expect(page.locator('[data-event-feedback]')).toBeVisible();
    await expect(standup).toHaveCSS('border-top-width', '2px');
    await expectFilterInsideViewport(page, 'standup');

    const reachedFilters = new Set<string>();
    const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    await page.locator('body').press('Home');
    for (let index = 0; index < 20; index += 1) {
      await page.keyboard.press(tabKey);
      const value = await page.evaluate(
        () => (document.activeElement as HTMLElement | null)?.dataset.filterValue ?? null,
      );
      if (value) reachedFilters.add(value);
      if (
        await page
          .getByRole('link', { name: 'Vis alle' })
          .evaluate((link) => link === document.activeElement)
      ) {
        break;
      }
    }
    expect([...reachedFilters]).toEqual(
      expect.arrayContaining(['all', 'music', 'sport', 'quiz', 'standup']),
    );
    await expect(page.getByRole('link', { name: 'Vis alle' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/kategori=alle#filter-all$/);
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(3);
  });

  test('keeps trailing selected filters visible after direct navigation and reload', async ({
    page,
  }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 900 });

      for (const value of ['quiz', 'standup']) {
        const slug = value === 'standup' ? 'standup' : 'quiz';
        await page.goto(`/program?kategori=${slug}#filter-${slug}`);
        await expectFilterInsideViewport(page, value);

        await page.reload();
        await expectFilterInsideViewport(page, value);
      }

      await page.goto(programPath);
      const standup = page.locator('[data-program-filter-link][data-filter-value="standup"]');
      await standup.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/kategori=standup#filter-standup$/);
      await expectFilterInsideViewport(page, 'standup');
    }
  });
});
