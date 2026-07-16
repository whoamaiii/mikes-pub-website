import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const homePath = '/';
const conceptDisclosure = 'Privat designforslag. Ikke den offisielle nettsiden til Mike’s Pub.';

test('renders the approved semantic Home hierarchy and safe content', async ({ page }) => {
  const response = await page.goto(homePath);

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Mike’s Pub i Sætre | privat designforslag');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mike’s Pub');
  await expect(page.locator('.concept-banner')).toHaveText(conceptDisclosure);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow, noarchive',
  );

  const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
  expect(headings).toEqual([
    'Før du drar',
    'Dette finner du på Mike’s',
    'Sport på storskjerm',
    'Dart og shuffleboard',
    'Finn oss i Sætre',
  ]);
  await expect(page.locator('.home-program-item')).toHaveCount(2);
  await expect(page.locator('.home-program-entry')).toHaveCount(2);
  await expect(page.locator('.home-program-item a')).toHaveCount(0);
  await expect(page.locator('.home-hero-action a')).toHaveAttribute('href', '#about');
  await expect(page.locator('.home-hero-action a')).toHaveText('Oppdag Mike’s');
  await expect(page.locator('.home-main a[href="/program"]')).toHaveCount(0);
  await expect(
    page.locator('.home-program').getByRole('link', {
      name: 'Se siste nytt fra Mike’s Pub på Facebook',
    }),
  ).toHaveAttribute('href', 'https://www.facebook.com/mikespub.saetre/');
  await expect(page.getByRole('link', { name: 'Ring Mike’s Pub på 918 55 855' })).toHaveAttribute(
    'href',
    'tel:+4791855855',
  );
  await expect(
    page.locator('[data-verification-status="awaiting-owner-confirmation"]'),
  ).toHaveCount(2);
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
    'Åpent nå',
    'Åpent i dag',
    'Bestill bord',
    'Konserter, fotball, quiz og gode kvelder',
    'Datonøytral konseptoppføring',
    'God stemning. Fine folk.',
    'fotball-VM 2026',
  ]) {
    expect(visibleText).not.toContain(blockedText);
  }
  expect(visibleText).toContain('Fotball, dart og shuffleboard');
  expect(visibleText).not.toContain('omtalt i offentlige kilder');
  expect(visibleText).not.toContain('Ikke bekreftet av eier');
  await expect(page.locator('.home-hero-title-readable')).toHaveText('Mike’s');
  await expect(page.locator('.venue-map')).toHaveAccessibleName(
    /Stilisert kartutsnitt som markerer Mike’s Pub i Nordre Sætrevei 2/,
  );
  await expect(page.locator('.venue-map-marker')).toHaveCount(1);
  await expect(page.locator('.venue-map-venue-label')).toHaveText('MIKE’S PUB');
  await expect(page.locator('.venue-map-route, .venue-map-index, .venue-map-legend')).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('link', { name: 'Åpne veibeskrivelse til Mike’s Pub i Google Maps' }),
  ).toHaveCount(3);
});

test('uses the supplied art-directed exterior image without local source masters', async ({
  page,
}) => {
  await page.goto(homePath);

  const fontPreloads = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(fontPreloads).toEqual([
    '/fonts/unifraktur-cook/UnifrakturCook-Bold.woff2',
    '/fonts/barlow-condensed/BarlowCondensed-Bold.woff2',
  ]);

  const imagePreloads = page.locator('link[rel="preload"][as="image"]');
  await expect(imagePreloads).toHaveCount(2);
  const responsiveMarkup = await page.locator('.home-hero picture').evaluate((picture) => {
    const desktop = picture.querySelector('source');
    const mobile = picture.querySelector('img');
    if (!desktop || !mobile) throw new Error('The Home hero picture is incomplete.');

    return {
      desktop: {
        media: desktop.getAttribute('media'),
        sizes: desktop.getAttribute('sizes'),
        srcset: desktop.getAttribute('srcset'),
      },
      mobile: {
        media: '(max-width: 63.999rem)',
        sizes: mobile.getAttribute('sizes'),
        srcset: mobile.getAttribute('srcset'),
      },
    };
  });
  const preloadMarkup = await imagePreloads.evaluateAll((links) =>
    links.map((link) => ({
      media: link.getAttribute('media'),
      sizes: link.getAttribute('imagesizes'),
      srcset: link.getAttribute('imagesrcset'),
    })),
  );
  expect(preloadMarkup).toEqual([responsiveMarkup.mobile, responsiveMarkup.desktop]);
  expect(preloadMarkup.map(({ srcset }) => srcset?.split(',').length)).toEqual([5, 5]);

  const image = page.getByRole('img', {
    name: 'Den svarte fasaden til Mike’s Pub med belyst skilt og grønn inngang i Sætre.',
  });
  await expect(image).toBeVisible();
  await expect(page.locator('.home-hero-media')).toHaveAttribute(
    'data-rights-status',
    'demo-cleared',
  );

  const metadata = await image.evaluate(async (element: HTMLImageElement) => {
    const selectedResource = new Image();
    selectedResource.src = element.currentSrc;
    await selectedResource.decode();

    return {
      currentSrc: element.currentSrc,
      height: selectedResource.naturalHeight,
      innerWidth: window.innerWidth,
      srcset: element.srcset,
      width: selectedResource.naturalWidth,
    };
  });
  expect(new URL(metadata.currentSrc).origin).toBe(new URL(page.url()).origin);
  expect(metadata.currentSrc).not.toMatch(/design-reference|\.tiff?$/i);
  expect(metadata.srcset.split(',')).toHaveLength(5);
  if (metadata.innerWidth >= 1024) {
    expect([1024, 1280, 1440, 1600, 1920]).toContain(metadata.width);
    expect(metadata.width / metadata.height).toBeCloseTo(16 / 9, 2);
  } else {
    expect([360, 540, 720, 900, 1080]).toContain(metadata.width);
    expect(metadata.width / metadata.height).toBeCloseTo(4 / 5, 2);
  }

  const budgetedAssets = await page.evaluate((heroUrl) => {
    const css = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(
      ({ href }) => href,
    );
    const js = [...document.querySelectorAll<HTMLScriptElement>('script[src]')].map(
      ({ src }) => src,
    );
    if (css.length === 0 || js.length === 0) {
      throw new Error('Expected production CSS and JavaScript assets.');
    }
    return { css, hero: [heroUrl], html: [window.location.href], js };
  }, metadata.currentSrc);
  const bodyByUrl = new Map<string, Buffer>();
  const getBody = async (url: string): Promise<Buffer> => {
    const cached = bodyByUrl.get(url);
    if (cached) return cached;

    const response = await page.request.get(url);
    expect(response.ok()).toBe(true);
    const body = await response.body();
    bodyByUrl.set(url, body);
    return body;
  };
  const fontUrls = [
    ...new Set(
      (
        await Promise.all(
          budgetedAssets.css.map(async (stylesheetUrl) => ({
            body: (await getBody(stylesheetUrl)).toString('utf8'),
            stylesheetUrl,
          })),
        )
      ).flatMap(({ body, stylesheetUrl }) =>
        [...body.matchAll(/url\((?:['"])?([^'")]+)(?:['"])?\)/g)]
          .map(([, source]) => new URL(source!, stylesheetUrl).href)
          .filter((url) => new URL(url).pathname.startsWith('/fonts/')),
      ),
    ),
  ];
  expect(fontUrls.length).toBeGreaterThan(0);
  const assetBytes = Object.fromEntries(
    await Promise.all(
      Object.entries({ ...budgetedAssets, fonts: fontUrls }).map(async ([kind, urls]) => {
        const bodies = await Promise.all(urls.map(getBody));
        return [kind, bodies.reduce((total, body) => total + body.byteLength, 0)];
      }),
    ),
  );
  expect(assetBytes.html).toBeLessThanOrEqual(24 * 1024);
  expect(assetBytes.css).toBeLessThanOrEqual(48 * 1024);
  expect(assetBytes.js).toBeLessThanOrEqual(8 * 1024);
  expect(assetBytes.fonts).toBeLessThanOrEqual(500 * 1024);
  expect(assetBytes.hero).toBeLessThanOrEqual(320 * 1024);
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
  await expect(page.locator('a[href^="http"]')).toHaveCount(6);
  expect(
    await page
      .locator('a[data-external="true"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('rel'))),
  ).toEqual([
    'noopener noreferrer',
    'noopener noreferrer',
    'noopener noreferrer',
    'noopener noreferrer',
    'noopener noreferrer',
    'noopener noreferrer',
  ]);
});

test('has no detectable automated accessibility violations', async ({ page }) => {
  await page.goto(homePath);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('keeps the paper-surface manifesto accent above large-text contrast minimums', async ({
  page,
}) => {
  await page.goto(homePath);

  const manifesto = page.locator('.home-manifesto');
  const accent = manifesto.locator('em');
  await accent.scrollIntoViewIfNeeded();
  await expect(manifesto).toHaveAttribute('data-reveal-visible', 'true');
  await expect(accent).toBeVisible();

  const contrast = await accent.evaluate((element) => {
    const parseRgb = (value: string): [number, number, number] => {
      const channels = value
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number);
      if (!channels || channels.length !== 3) throw new Error(`Unsupported color: ${value}`);
      return channels as [number, number, number];
    };
    const luminance = ([red, green, blue]: [number, number, number]): number => {
      const [r, g, b] = [red, green, blue].map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const foreground = luminance(parseRgb(getComputedStyle(element).color));
    const background = luminance(
      parseRgb(getComputedStyle(element.closest('.home-manifesto')!).backgroundColor),
    );
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });

  expect(contrast).toBeGreaterThanOrEqual(3);
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
  await expect(page.locator('.home-hero-media')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.home-hero-action .action-link')).toBeVisible();
  const programItems = page.locator('.home-program-item');
  expect(await programItems.count()).toBe(2);
  await expect(programItems.nth(0)).toHaveCSS('border-bottom-style', 'solid');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps every progressively enhanced Home section visible and usable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(homePath);

    const revealSections = page.locator('[data-reveal]');
    await expect(revealSections).toHaveCount(5);
    for (let index = 0; index < (await revealSections.count()); index += 1) {
      await expect(revealSections.nth(index)).toBeVisible();
      await expect(revealSections.nth(index)).toHaveCSS('opacity', '1');
    }

    await expect(page.locator('html')).not.toHaveAttribute('data-reveal-enhanced', 'true');
    await expect(
      page.getByRole('link', { name: 'Åpne veibeskrivelse til Mike’s Pub i Google Maps' }).last(),
    ).toBeVisible();
  });
});
