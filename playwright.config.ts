import { defineConfig } from '@playwright/test';

// Browser tests run against the build in dist-e2e, made from the fixture
// posts in e2e/fixtures/blog. `npm run test:e2e` builds it first.
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'github' : 'list',
  use: { browserName: 'chromium' },
});
