import { expect, test } from '@playwright/test';

const previewPath = '/design-system/';

test('renders semantic components and explicit states', async ({ page }) => {
  await page.goto(previewPath);

  await expect(page.getByRole('link', { name: 'Hopp til hovedinnhold' })).toHaveAttribute(
    'href',
    '#design-system-preview-main',
  );
  const conceptBanner = page.getByRole('complementary', { name: 'Konseptstatus' });
  await expect(conceptBanner).toHaveText(
    'Privat konseptdemo – ikke den offisielle nettsiden til Mike’s Pub.',
  );
  await expect(conceptBanner.locator('button, [role="button"]')).toHaveCount(0);
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
  await expect(loadingButton.locator('.button-label')).toBeHidden();
  await expect(loadingButton.locator('.button-loading-label')).toBeVisible();

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

test('paints only the loading label at every required review width', async ({ page }) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(previewPath);

    const loadingButton = page.getByRole('button', { name: 'Laster komponent' });
    const normalLabel = loadingButton.locator('.button-label');
    const loadingLabel = loadingButton.locator('.button-loading-label');

    await expect(loadingButton).toBeDisabled();
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    await expect(normalLabel).toBeHidden();
    await expect(loadingLabel).toBeVisible();

    const geometry = await loadingButton.evaluate((button) => {
      const normal = button.querySelector<HTMLElement>('.button-label')!;
      const loading = button.querySelector<HTMLElement>('.button-loading-label')!;
      const toBox = (element: Element) => {
        const box = element.getBoundingClientRect();
        return {
          bottom: box.bottom,
          height: box.height,
          left: box.left,
          right: box.right,
          top: box.top,
          width: box.width,
        };
      };

      return {
        buttonDisplay: getComputedStyle(button).display,
        buttonBox: toBox(button),
        loadingBox: toBox(loading),
        loadingVisibility: getComputedStyle(loading).visibility,
        normalBox: toBox(normal),
        normalVisibility: getComputedStyle(normal).visibility,
        pageClientWidth: document.documentElement.clientWidth,
        pageScrollWidth: document.documentElement.scrollWidth,
      };
    });

    expect(geometry.buttonDisplay).toBe('grid');
    expect(geometry.normalVisibility).toBe('hidden');
    expect(geometry.loadingVisibility).toBe('visible');
    expect(geometry.normalBox).toEqual(geometry.loadingBox);
    expect(geometry.loadingBox.left).toBeGreaterThanOrEqual(geometry.buttonBox.left);
    expect(geometry.loadingBox.right).toBeLessThanOrEqual(geometry.buttonBox.right);
    expect(geometry.loadingBox.top).toBeGreaterThanOrEqual(geometry.buttonBox.top);
    expect(geometry.loadingBox.bottom).toBeLessThanOrEqual(geometry.buttonBox.bottom);
    expect(geometry.pageScrollWidth).toBeLessThanOrEqual(geometry.pageClientWidth);
  }
});
