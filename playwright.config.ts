import { defineConfig } from '@playwright/test';

import { browserProjects } from './tests/e2e/browser-projects';

if (process.env.NO_COLOR !== undefined) {
  delete process.env.NO_COLOR;
  process.env.FORCE_COLOR = '0';
}

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4321);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['design-system/**'],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
    port,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: browserProjects,
});
