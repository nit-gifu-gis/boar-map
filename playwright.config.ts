import { defineConfig } from '@playwright/test';

const development = process.env.PLAYWRIGHT_DEV === '1';

export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/browser',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: development ? 90_000 : 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    serviceWorkers: 'block',
    permissions: ['geolocation'],
    geolocation: { latitude: 35.39135, longitude: 136.722418 },
    viewport: { width: 1100, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  // Build once before running these tests. The tests never start an application build.
  webServer: {
    command: development
      ? 'node node_modules/next/dist/bin/next dev --webpack -p 3100'
      : 'node node_modules/next/dist/bin/next start -p 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 60_000,
    env: { NEXT_TELEMETRY_DISABLED: '1', SENTRY_DISABLED: '1' },
  },
});
