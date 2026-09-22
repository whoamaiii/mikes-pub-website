import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const password = process.env.MIKES_HOSTING_TEST_PASSWORD!;

async function signIn(page: Page, path = '/program?kategori=quiz'): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole('heading', { name: "Mike's Pub" })).toBeVisible();
  const input = page.getByLabel('Passord', { exact: true });
  await input.fill(password);
  await input.press('Enter');
  await expect(page).toHaveURL(/\/program\//);
}

test('filters after the real Pages redirect and preserves focus, path and history', async ({
  page,
}) => {
  await signIn(page);
  const shell = page.locator('[data-program-filter-shell]');
  const quiz = page.locator('[data-program-filter-link][data-filter-value="quiz"]');
  const sport = page.locator('[data-program-filter-link][data-filter-value="sport"]');
  await expect(shell).toHaveAttribute('data-program-filter-enhanced', 'true');
  await expect(page).toHaveURL(/\/program\/\?kategori=quiz#filter-quiz$/);
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);
  await expect(quiz).toHaveAttribute('aria-current', 'page');

  const documentRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documentRequests.push(request.url());
  });
  await sport.focus();
  await page.keyboard.press('Enter');
  await expect(sport).toBeFocused();
  await expect(page).toHaveURL(/\/program\/\?kategori=sport#filter-sport$/);
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(3);
  await page.goBack();
  await expect(quiz).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);
  await page.goForward();
  await expect(sport).toHaveAttribute('aria-current', 'page');
  expect(documentRequests).toEqual([]);

  await page.reload();
  await expect(shell).toHaveAttribute('data-active-filter', 'sport');
  await expect(page).toHaveURL(/\/program\/\?kategori=sport#filter-sport$/);
  await page.getByRole('link', { name: 'Hopp til hovedinnhold' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page).toHaveURL(/\/program\/\?kategori=sport#main-content$/);
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(3);
  await page.goto('/program/?kategori=musikk');
  await expect(shell).toHaveAttribute('data-active-filter', 'music');
  await expect(page.getByText('Ingen arrangementer i denne kategorien.')).toBeVisible();
  await page.getByRole('link', { name: 'Vis alle', exact: true }).click();
  await expect(page.locator('[data-event-row]:visible')).toHaveCount(4);
  await expect(page.locator('[data-program-filter-link][data-filter-value="all"]')).toBeFocused();
});

test('protects static assets, rejects a wrong password and signs out the browser', async ({
  page,
  request,
}) => {
  for (const path of ['/', '/program/', '/favicon.svg', '/404.html']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(303);
    expect(response.headers().location).toContain('/__preview?returnTo=');
    expect(response.headers()['cache-control']).toContain('no-store');
  }

  await page.goto('/program');
  await page.getByLabel('Passord', { exact: true }).fill('incorrect-local-test-password');
  await page.getByRole('button', { name: 'Åpne designforslaget' }).click();
  await expect(page.getByRole('alert')).toContainText('Passordet var ikke riktig');
  expect(await page.context().cookies()).toEqual([]);

  await signIn(page);
  const cookie = (await page.context().cookies()).find(
    ({ name }) => name === '__Host-mikes-pub-preview',
  );
  expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
  const asset = await page.request.get('/favicon.svg');
  expect(asset.status()).toBe(200);
  const missing = await page.request.get('/__missing_hosting_test__');
  expect(missing.status()).toBe(404);

  const logout = await page.request.post('/__preview/logout', { maxRedirects: 0 });
  expect(logout.status()).toBe(303);
  expect(await page.context().cookies()).toEqual([]);
  await page.goto('/program/');
  await expect(page.getByLabel('Passord', { exact: true })).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps fragment filtering usable after the hosting redirect', async ({ page }) => {
    await signIn(page, '/program');
    await page.getByRole('link', { name: 'Quiz', exact: true }).click();
    await expect(page).toHaveURL(/\/program\/\?kategori=quiz#filter-quiz$/);
    await expect(page.locator('[data-event-row]:visible')).toHaveCount(1);
    await expect(page.locator('[data-event-row][data-event-category="quiz"]')).toBeVisible();
  });
});
