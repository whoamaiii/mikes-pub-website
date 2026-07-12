import { expect, test } from '@playwright/test';

test('serves the static preview without product routes or third-party requests', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  const response = await page.goto('/__who14_infrastructure_probe__');
  const previewOrigin = new URL(page.url()).origin;

  expect(response?.status()).toBe(404);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === previewOrigin)).toBe(true);
});
