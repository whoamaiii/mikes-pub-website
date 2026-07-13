import { devices } from '@playwright/test';

export const browserProjects = [
  { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
];
