import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4173/mushroom_kingdom/', browserName: 'chromium', headless: true },
  webServer: { command: 'npm run dev -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173/mushroom_kingdom/', reuseExistingServer: !process.env.CI },
});
