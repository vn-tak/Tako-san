import { defineConfig } from '@playwright/test';
import baseline from '../../playwright.t18c.config';
export default defineConfig({
  ...baseline,
  testDir: '../../tests/e2e/t17-ui',
  outputDir: './e2e-results',
  reporter: [['list'], ['json', { outputFile: '.artifacts/ui11/e2e-report.json' }]],
  use: { ...baseline.use, baseURL: 'http://127.0.0.1:5206', launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } },
  webServer: { ...baseline.webServer, url: 'http://127.0.0.1:5206/__preview', reuseExistingServer: true },
});
