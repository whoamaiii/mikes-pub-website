import { defineConfig } from '@playwright/test';

import { browserProjects } from './tests/e2e/browser-projects';

if (process.env.NO_COLOR !== undefined) {
  delete process.env.NO_COLOR;
  process.env.FORCE_COLOR = '0';
}

const port = 4322;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e/design-system',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['html', { open: 'never', outputFolder: 'playwright-report/design-system' }], ['github']]
    : 'list',
  outputDir: 'test-results/design-system',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run preview:design-system -- --host 127.0.0.1 --port ${port}`,
    port,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: browserProjects,
});
