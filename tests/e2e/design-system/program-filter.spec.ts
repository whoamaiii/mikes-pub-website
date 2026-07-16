import { expect, test, type Page } from '@playwright/test';

const fixturePath = '/program';

async function loadEnhancedProgram(page: Page, path = fixturePath): Promise<void> {
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

async function tabToRecoveryLink(page: Page, browserName: string): Promise<void> {
  const recovery = page.getByRole('link', { name: 'Vis alle' });
  const key = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';

  for (let step = 0; step < 5; step += 1) {
    if (await recovery.evaluate((link) => link === document.activeElement)) return;
    await page.keyboard.press(key);
  }

  await expect(recovery).toBeFocused();
}

test('uses the real Program directory with isolated publishable synthetic records', async ({
  page,
}) => {
  await loadEnhancedProgram(page);

  await expect(page.locator('[data-program-fixture-disclosure]')).toContainText(
    'ikke arrangementer eller publiserbare fakta',
  );
  await expect(page.getByRole('navigation', { name: 'Filtrer arrangementer' })).toHaveCount(1);
  await expect(page.locator('[data-event-row]')).toHaveCount(3);
  await expectSelected(page, 'all', 3);
  await expect(page.locator('[data-event-status="concept"]')).toHaveCount(0);
  await expect(page.locator('[data-filter-target="quiz"]')).toHaveAttribute(
    'data-filter-empty',
    'true',
  );
  await expect(page.locator('[data-filter-target="standup"]')).toHaveAttribute(
    'data-filter-empty',
    'true',
  );
  await expect(page.locator('[data-filter-target="music"]')).not.toHaveAttribute(
    'data-filter-empty',
    'true',
  );
  await expect(page.locator('[data-filter-target="sport"]')).not.toHaveAttribute(
    'data-filter-empty',
    'true',
  );
});

test('preserves focus, URL, history and reload state while filtering', async ({ page }) => {
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
  await expectSelected(page, 'music', 2);
  expect(documentRequests).toEqual([]);

  await page.locator('[data-program-filter-link][data-filter-value="sport"]').click();
  await expectSelected(page, 'sport', 1);
  await page.goBack();
  await expect(page).toHaveURL(/kategori=musikk#filter-musikk$/);
  await expectSelected(page, 'music', 2);
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
  await loadEnhancedProgram(page, '/program?kategori=sport');
  await expect(page).toHaveURL(/\/program\?kategori=sport#filter-sport$/);
  await expectSelected(page, 'sport', 1);

  await loadEnhancedProgram(page, '/program#filter-musikk');
  await expect(page).toHaveURL(/\/program\?kategori=musikk#filter-musikk$/);
  await expectSelected(page, 'music', 2);

  for (const path of [
    '/program?kategori=ukjent#filter-musikk',
    '/program?kategori=quiz#filter-musikk',
    '/program#filter-ukjent',
  ]) {
    await loadEnhancedProgram(page, path);
    await expect(page).toHaveURL(/\/program\?kategori=alle#filter-all$/);
    await expectSelected(page, 'all', 3);
  }
});

test('shows filtered-empty feedback and keeps the narrow filter scroller usable', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await loadEnhancedProgram(page);

  for (const value of ['quiz', 'standup']) {
    const emptyFilter = page.locator(`[data-program-filter-link][data-filter-value="${value}"]`);
    await emptyFilter.focus();
    await page.keyboard.press('Enter');

    await expect(emptyFilter).toBeFocused();
    await expect(page.locator('[data-event-list]')).toBeHidden();
    await expect(page.locator('[data-event-feedback]')).toBeVisible();
    await expectFilterInsideViewport(page, value, 4);

    const recovery = page.getByRole('link', { name: 'Vis alle' });
    await tabToRecoveryLink(page, browserName);
    await expect(recovery).toBeFocused();
    await page.keyboard.press('Enter');
    await expectSelected(page, 'all', 3);
    await expect(page.locator('[data-program-filter-link][data-filter-value="all"]')).toBeFocused();
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('uses synchronized fragments for filtering, empty feedback and recovery', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(fixturePath);
    await expect(page.locator('[data-program-filter-shell]')).not.toHaveAttribute(
      'data-program-filter-enhanced',
      'true',
    );

    const music = page.locator('[data-program-filter-link][data-filter-value="music"]');
    await music.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/kategori=musikk#filter-musikk$/);
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(2);
    await expect(page.locator('[data-filter-summary-value="music"]')).toBeVisible();

    for (const value of ['quiz', 'standup']) {
      const emptyFilter = page.locator(`[data-program-filter-link][data-filter-value="${value}"]`);
      await emptyFilter.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`kategori=${value}#filter-${value}$`));
      await expect(page.locator('[data-event-list]')).toBeHidden();
      await expect(page.locator('[data-event-feedback]')).toBeVisible();
      await expectFilterInsideViewport(page, value);

      const recovery = page.getByRole('link', { name: 'Vis alle' });
      await recovery.focus();
      await expect(recovery).toBeFocused();
      await Promise.all([page.waitForURL(/kategori=alle#filter-all$/), recovery.press('Enter')]);
      await expect(page.locator('[data-event-row]:visible')).toHaveCount(3);
    }
  });
});
