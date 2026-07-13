import { expect, test } from '@playwright/test';

const previewPath = '/design-system/';

test('renders semantic components and explicit states', async ({ page }) => {
  await page.goto(previewPath);

  await expect(page.getByRole('link', { name: 'Hopp til hovedinnhold' })).toHaveAttribute(
    'href',
    '#design-system-preview-main',
  );
  await expect(page.getByRole('link', { name: 'Mike’s Pub – forside' }).first()).toBeAttached();
  const desktopNavigation = page.locator('.desktop-nav');
  await expect(desktopNavigation).toBeAttached();
  await expect(desktopNavigation.locator('a[aria-current="page"]')).toHaveText('Program');

  const trigger = page.locator('.mobile-menu-trigger');
  await expect(trigger).toHaveAttribute('aria-controls', 'design-system-preview-mobile-menu');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  const viewportWidth = page.viewportSize()?.width ?? 0;
  if (viewportWidth >= 1024) {
    await expect(desktopNavigation).toBeVisible();
    await expect(trigger).toBeHidden();
  } else {
    await expect(desktopNavigation).toBeHidden();
    await expect(trigger).toBeVisible();
  }

  await expect(page.getByRole('button', { name: 'Ikke tilgjengelig' })).toBeDisabled();
  const loadingButton = page.getByRole('button', { name: 'Laster komponent' });
  await expect(loadingButton).toBeDisabled();
  await expect(loadingButton).toHaveAttribute('aria-busy', 'true');

  await expect(page.getByRole('navigation', { name: 'Filtrer arrangementer' })).toBeAttached();
  await expect(page.getByRole('link', { name: 'Musikk' }).last()).toHaveAttribute(
    'aria-current',
    'page',
  );

  for (const status of ['concept', 'scheduled', 'postponed', 'cancelled', 'expired']) {
    await expect(page.locator(`[data-event-status="${status}"]`)).toHaveCount(1);
  }

  const missingFields = page.locator('[data-event-status="expired"]');
  await expect(missingFields).toHaveAttribute('data-has-description', 'false');
  await expect(missingFields).toHaveAttribute('data-has-action', 'false');
  await expect(missingFields).toHaveAttribute('data-has-image', 'false');
  await expect(page.locator('[data-event-status="draft"]')).toHaveCount(0);

  await expect(
    page.getByRole('heading', { name: 'Ingen arrangementer i denne kategorien akkurat nå.' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Programmet kunne ikke lastes.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Finn oss i Sætre' })).toBeVisible();
  await expect(page.getByText('Nordre Sætrevei 2').first()).toBeVisible();
});

test('makes no third-party requests and ships no client-side behavior', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto(previewPath, { waitUntil: 'networkidle' });
  const previewOrigin = new URL(page.url()).origin;

  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === previewOrigin)).toBe(true);
  await expect(page.locator('script[src]')).toHaveCount(0);
});
