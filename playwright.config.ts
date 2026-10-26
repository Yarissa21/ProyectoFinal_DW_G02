import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './pruebas-automatizadas',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    locale: 'es-GT',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    timeout: 60000,
  },
});