import { randomBytes } from 'node:crypto';

import { defineConfig } from '@playwright/test';

import { browserProjects } from './tests/e2e/browser-projects';

if (process.env.NO_COLOR !== undefined) {
  delete process.env.NO_COLOR;
  process.env.FORCE_COLOR = '0';
}

// Inherited by the server and test workers; never uses the real preview password.
process.env.MIKES_HOSTING_TEST_PASSWORD ??= randomBytes(32).toString('hex');
const port = 8791;
const baseURL = `https://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/hosting',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['html', { open: 'never', outputFolder: 'playwright-report/hosting' }], ['github']]
    : 'list',
  outputDir: 'test-results/hosting',
  use: {
    baseURL,
    // Wrangler's local HTTPS certificate is self-signed; Secure cookies stay enabled.
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node tests/hosting/start-preview.ts',
    url: `${baseURL}/__preview`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    timeout: 30_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
  projects: browserProjects,
});
