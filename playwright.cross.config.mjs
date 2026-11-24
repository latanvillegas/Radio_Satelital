import { defineConfig, devices } from '@playwright/test'
import base from './playwright.config.mjs'

export default defineConfig({
  ...base,
  testMatch: 'cross-engine.spec.mjs',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-cross' }], ['json', { outputFile: 'test-results-cross/results.json' }]],
  outputDir: 'test-results-cross',
  projects: [
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'android-emulation', use: { ...devices['Pixel 7'] } },
    { name: 'ios-emulation', use: { ...devices['iPhone 13'] } },
  ],
})
