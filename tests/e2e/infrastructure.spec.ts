import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const root = fileURLToPath(new URL('../..', import.meta.url));

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );

  return files.flat();
}

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

test('keeps the isolated design-system preview out of production output', async ({ page }) => {
  const response = await page.goto('/design-system/');
  expect(response?.status()).toBe(404);

  const distDirectory = path.join(root, 'dist');
  const distFiles = await listFiles(distDirectory);
  const relativeFiles = distFiles.map((file) => path.relative(distDirectory, file));
  expect(relativeFiles.filter((file) => /design-system|preview-fixture/i.test(file))).toEqual([]);

  const textFiles = distFiles.filter((file) => /\.(?:css|html|js|json|map|txt)$/i.test(file));
  const textOutput = (await Promise.all(textFiles.map((file) => readFile(file, 'utf8')))).join(
    '\n',
  );
  expect(textOutput).not.toMatch(
    /__design-system__|design-system-preview-main|WHO15_CAPTURE|WHO17_CAPTURE|Datonøytral testtekst/i,
  );
});
