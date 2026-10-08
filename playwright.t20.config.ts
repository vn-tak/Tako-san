import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT ?? 3100);
const apiPort = Number(process.env.PREVIEW_API_PORT ?? 8890);
if (![port, apiPort].every((value) => Number.isInteger(value) && value >= 1024 && value <= 65535) || port === apiPort) {
  throw new Error('T20 preview requires distinct unprivileged local ports');
}
const baseURL = `http://127.0.0.1:${port}`;
const drill = process.env.T20_FLAG_DRILL;
if (drill && !['off', 'mismatch'].includes(drill)) throw new Error('Unknown T20 flag drill');

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: drill ? 't20-flags.e2e.ts' : 't20-composition.e2e.ts',
  fullyParallel: false, workers: 1, retries: 0, forbidOnly: true,
  timeout: 60_000, expect: { timeout: 10_000 },
  outputDir: `.wrangler/t20-completion/browser-${drill ?? 'on'}/results`,
  reporter: [['list'], ['json', { outputFile: `.wrangler/t20-completion/browser-${drill ?? 'on'}/report.json` }]],
  use: { baseURL, browserName: 'chromium', locale: 'en-US', timezoneId: 'UTC', serviceWorkers: 'block',
    screenshot: 'only-on-failure', trace: 'off' },
  projects: [390, 768, 1280].map((width) => ({ name: `chromium-${width}`,
    use: { viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 } })),
  webServer: {
    command: 'node scripts/security-preview.mjs', url: `${baseURL}/__preview`, reuseExistingServer: false,
    env: { PORT: String(port), PREVIEW_API_PORT: String(apiPort), PREVIEW_APP_URL: baseURL,
      PREVIEW_MEAL_COMPOSITION_V2: drill === 'off' ? 'false' : 'true',
      PREVIEW_MEAL_COMPOSITION_V2_SERVER: drill ? 'false' : 'true', PREVIEW_T20_D1: 'true' },
    timeout: 60_000, stdout: 'pipe', stderr: 'pipe', gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
  },
});
