import { defineConfig } from '@playwright/test';

// Configure a baseURL so tests can `page.goto('/')`.
// Override the port when running locally if Next picks a different one:
//   PLAYWRIGHT_BASE_URL=http://localhost:3002 npx playwright test
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    headless: true,
  },
});
