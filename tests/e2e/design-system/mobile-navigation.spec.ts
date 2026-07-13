import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const previewPath = '/design-system/';

async function loadMobilePreview(page: Page, width = 375): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(previewPath);
  await expect(page.locator('[data-mobile-menu-enhanced="true"]')).toBeAttached();
}

async function openMenu(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Åpne meny' }).click();
  await expect(page.getByRole('dialog', { name: 'Hovedmeny' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lukk meny' }).last()).toBeFocused();
}

test('enhances to a named modal with correct current state and 44px controls', async ({ page }) => {
  await loadMobilePreview(page);

  const trigger = page.locator('.mobile-menu-trigger');
  const fallback = page.locator('[data-mobile-menu-fallback]');

  await expect(trigger).toBeVisible();
  await expect(fallback).toBeHidden();
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText('Program');
  await expect(fallback.locator('a[aria-current="page"]')).toHaveText('Program');
  await expect(page.locator('.mobile-menu-dialog a[aria-current="page"]')).toHaveText('Program');

  const triggerBox = await trigger.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(triggerBox!.width).toBeGreaterThanOrEqual(44);
  expect(triggerBox!.height).toBeGreaterThanOrEqual(44);

  await openMenu(page);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).toHaveAttribute('aria-label', 'Lukk meny');

  const closeButton = page.getByRole('button', { name: 'Lukk meny' }).last();
  const closeBox = await closeButton.boundingBox();
  expect(closeBox).not.toBeNull();
  expect(closeBox!.width).toBeGreaterThanOrEqual(44);
  expect(closeBox!.height).toBeGreaterThanOrEqual(44);

  await closeButton.click();
  await expect(page.getByRole('dialog', { name: 'Hovedmeny' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Åpne meny' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Åpne meny' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

test('opens without pointer input, contains focus, closes with Escape and returns focus', async ({
  page,
}) => {
  await loadMobilePreview(page);

  const trigger = page.getByRole('button', { name: 'Åpne meny' });
  await trigger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Hovedmeny' });
  const closeButton = dialog.getByRole('button', { name: 'Lukk meny' });
  const firstLink = dialog.getByRole('link', { name: 'Mike’s Pub – forside' });
  const lastLink = dialog.getByRole('link', { name: 'Finn oss' });
  await expect(closeButton).toBeFocused();

  await firstLink.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(lastLink).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstLink).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Space');
  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();
});

test('keeps the background inert and restores scroll and owned styles on close', async ({
  page,
}) => {
  await loadMobilePreview(page);
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(400);

  const before = await page.evaluate(() => ({
    bodyStyle: document.body.getAttribute('style'),
    clientWidth: document.documentElement.clientWidth,
    htmlStyle: document.documentElement.getAttribute('style'),
    scrollX: Math.round(window.scrollX),
    scrollY: Math.round(window.scrollY),
  }));

  await page
    .getByRole('button', { name: 'Åpne meny' })
    .evaluate((button) => (button as HTMLButtonElement).click());
  const dialog = page.getByRole('dialog', { name: 'Hovedmeny' });
  const closeButton = dialog.getByRole('button', { name: 'Lukk meny' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-mobile-menu-scroll-lock', 'true');
  await expect(page.locator('body')).toHaveCSS('position', 'fixed');

  await page.locator('main').evaluate((main) => main.focus());
  await expect(closeButton).toBeFocused();

  await page.evaluate(() => {
    const state = window as typeof window & { __who17BackgroundClicks?: number };
    state.__who17BackgroundClicks = 0;
    document.querySelector('main')?.addEventListener('click', () => {
      state.__who17BackgroundClicks = (state.__who17BackgroundClicks ?? 0) + 1;
    });
  });
  await page.mouse.click(12, 850);
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __who17BackgroundClicks?: number }).__who17BackgroundClicks,
    ),
  ).toBe(0);

  expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(before.clientWidth);
  await closeButton.click();

  await expect(page.locator('body')).not.toHaveAttribute('data-mobile-menu-scroll-lock', 'true');
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollX))).toBe(before.scrollX);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(before.scrollY);
  expect(await page.evaluate(() => document.body.getAttribute('style'))).toBe(before.bodyStyle);
  expect(await page.evaluate(() => document.documentElement.getAttribute('style'))).toBe(
    before.htmlStyle,
  );
});

test('preserves pre-existing and concurrent unrelated inline styles', async ({ page }) => {
  await loadMobilePreview(page);
  const before = await page.evaluate(() => {
    const { body, documentElement } = document;
    documentElement.style.setProperty('--who17-root-before', 'keep-root');
    documentElement.style.setProperty('scroll-behavior', 'smooth', 'important');
    body.style.setProperty('--who17-body-before', 'keep-body');
    body.style.setProperty('position', 'relative', 'important');
    body.style.setProperty('padding-right', '7px');
    return {
      bodyStyle: body.getAttribute('style'),
      htmlStyle: documentElement.getAttribute('style'),
    };
  });

  await page.getByRole('button', { name: 'Åpne meny' }).click();
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--who17-root-during', 'keep-root-during');
    document.body.style.setProperty('--who17-body-during', 'keep-body-during');
  });
  await page.getByRole('button', { name: 'Lukk meny' }).last().click();

  const after = await page.evaluate(() => {
    const { body, documentElement } = document;
    return {
      bodyBefore: body.style.getPropertyValue('--who17-body-before'),
      bodyDuring: body.style.getPropertyValue('--who17-body-during'),
      bodyPosition: body.style.getPropertyValue('position'),
      bodyPositionPriority: body.style.getPropertyPriority('position'),
      bodyPadding: body.style.getPropertyValue('padding-right'),
      htmlBefore: documentElement.style.getPropertyValue('--who17-root-before'),
      htmlDuring: documentElement.style.getPropertyValue('--who17-root-during'),
      htmlScrollBehavior: documentElement.style.getPropertyValue('scroll-behavior'),
      htmlScrollPriority: documentElement.style.getPropertyPriority('scroll-behavior'),
    };
  });

  expect(after).toEqual({
    bodyBefore: 'keep-body',
    bodyDuring: 'keep-body-during',
    bodyPosition: 'relative',
    bodyPositionPriority: 'important',
    bodyPadding: '7px',
    htmlBefore: 'keep-root',
    htmlDuring: 'keep-root-during',
    htmlScrollBehavior: 'smooth',
    htmlScrollPriority: 'important',
  });
  expect((await page.locator('body').getAttribute('style'))?.startsWith(before.bodyStyle!)).toBe(
    true,
  );
  expect((await page.locator('html').getAttribute('style'))?.startsWith(before.htmlStyle!)).toBe(
    true,
  );
});

test('cleans open state when resizing through the 1024px breakpoint', async ({ page }) => {
  await loadMobilePreview(page, 1023);
  await openMenu(page);

  await page.setViewportSize({ width: 1024, height: 900 });
  const dialog = page.getByRole('dialog', { name: 'Hovedmeny' });
  const currentDesktopLink = page.locator('.desktop-nav a[aria-current="page"]');

  await expect(dialog).toBeHidden();
  await expect(page.locator('.desktop-nav')).toBeVisible();
  await expect(currentDesktopLink).toBeFocused();
  await expect(page.locator('body')).not.toHaveAttribute('data-mobile-menu-scroll-lock', 'true');

  await page.setViewportSize({ width: 1023, height: 900 });
  const trigger = page.getByRole('button', { name: 'Åpne meny' });
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('closes before navigation and remains closed after page lifecycle restoration', async ({
  page,
}) => {
  await loadMobilePreview(page);
  await page.evaluate(() => {
    const dialog = document.querySelector<HTMLDialogElement>('[data-mobile-menu-dialog]')!;
    const original = dialog.showModal.bind(dialog);
    const state = window as typeof window & { __who17ShowModalCalls?: number };
    state.__who17ShowModalCalls = 0;
    dialog.showModal = () => {
      state.__who17ShowModalCalls = (state.__who17ShowModalCalls ?? 0) + 1;
      original();
    };
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });

  await openMenu(page);
  expect(
    await page.evaluate(
      () => (window as typeof window & { __who17ShowModalCalls?: number }).__who17ShowModalCalls,
    ),
  ).toBe(1);
  await page
    .getByRole('dialog', { name: 'Hovedmeny' })
    .getByRole('link', { name: 'Finn oss' })
    .click();
  await expect(page).toHaveURL(/#preview-location$/);
  await expect(page.getByRole('dialog', { name: 'Hovedmeny' })).toBeHidden();
  await expect(page.locator('body')).not.toHaveAttribute('data-mobile-menu-scroll-lock', 'true');

  await openMenu(page);
  await page.goto('/__who17_navigation_lifecycle_probe__');
  await page.goBack();
  await expect(page.locator('[data-mobile-menu-enhanced="true"]')).toBeAttached();
  await expect(page.getByRole('dialog', { name: 'Hovedmeny' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Åpne meny' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(page.locator('body')).not.toHaveAttribute('data-mobile-menu-scroll-lock', 'true');
});

test('retains the server-rendered fallback when showModal is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: undefined,
    });
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(previewPath);

  await expect(page.locator('[data-mobile-menu-fallback]')).toBeVisible();
  await expect(page.locator('.mobile-menu-trigger')).toBeHidden();
  await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute(
    'data-mobile-menu-enhanced',
    'true',
  );
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
});

test('rolls back to the keyboard fallback when showModal throws during activation', async ({
  page,
  browserName,
}) => {
  await loadMobilePreview(page);
  await page.evaluate(() => {
    const dialog = document.querySelector<HTMLDialogElement>('[data-mobile-menu-dialog]')!;
    dialog.showModal = () => {
      throw new Error('Synthetic showModal failure');
    };
  });

  const root = page.locator('[data-mobile-menu]');
  const fallback = page.locator('[data-mobile-menu-fallback]');
  const summary = fallback.locator('summary');
  const trigger = page.getByRole('button', { name: 'Åpne meny' });
  const before = await page.evaluate(() => ({
    bodyStyle: document.body.getAttribute('style'),
    htmlStyle: document.documentElement.getAttribute('style'),
    scrollX: Math.round(window.scrollX),
    scrollY: Math.round(window.scrollY),
  }));

  await trigger.focus();
  await page.keyboard.press('Enter');

  await expect(fallback).toBeVisible();
  await expect(trigger).toBeHidden();
  await expect(root).not.toHaveAttribute('data-mobile-menu-enhanced', 'true');
  await expect(page.getByRole('dialog', { name: 'Hovedmeny' })).toBeHidden();
  await expect(summary).toBeFocused();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false);
  expect(await page.evaluate(() => document.body.getAttribute('style'))).toBe(before.bodyStyle);
  expect(await page.evaluate(() => document.documentElement.getAttribute('style'))).toBe(
    before.htmlStyle,
  );
  expect(await page.evaluate(() => Math.round(window.scrollX))).toBe(before.scrollX);
  expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(before.scrollY);

  await page.keyboard.press('Enter');
  await expect(fallback).toHaveAttribute('open', '');
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(fallback.getByRole('link', { name: 'Program' })).toBeFocused();
});

test('has no detectable violations in closed or open state', async ({ page }) => {
  await loadMobilePreview(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await openMenu(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('has no overflow at supported widths and makes only same-origin requests', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  for (const width of [320, 375, 768, 1023]) {
    await loadMobilePreview(page, width);
    await openMenu(page);

    const dimensions = await page.evaluate(() => {
      const dialog = document.querySelector<HTMLDialogElement>('[data-mobile-menu-dialog]')!;
      return {
        clientWidth: document.documentElement.clientWidth,
        dialogRight: dialog.getBoundingClientRect().right,
        dialogWidth: dialog.getBoundingClientRect().width,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.dialogWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.dialogRight).toBeLessThanOrEqual(dimensions.clientWidth);
    await page.getByRole('button', { name: 'Lukk meny' }).last().click();
  }

  const origin = new URL(page.url()).origin;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
});

test('uses immediate behavior when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loadMobilePreview(page);
  await openMenu(page);

  const transitionDurations = await page.locator('.mobile-menu-surface').evaluate((element) =>
    getComputedStyle(element)
      .transitionDuration.split(',')
      .map((duration) => Number.parseFloat(duration)),
  );
  expect(transitionDurations.every((duration) => duration <= 0.00001)).toBe(true);
});

test('uses system colors in forced colors', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Forced-colors emulation is validated in Chromium.');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await loadMobilePreview(page);
  await openMenu(page);
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  await expect(page.getByRole('button', { name: 'Lukk meny' }).last()).toHaveCSS(
    'border-top-style',
    'solid',
  );
});
