import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { type Page } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf-8')

export async function mockFplApi(page: Page, bootstrapFile = 'bootstrap.json') {
  const bootstrap = fixture(bootstrapFile)
  const fixtureData = fixture('fixtures-gw3-arsenal-win.json')

  await page.route('**/fpl-api/bootstrap-static/**', (route) =>
    route.fulfill({ contentType: 'application/json', body: bootstrap }),
  )
  await page.route('**/fpl-api/fixtures/**', (route) =>
    route.fulfill({ contentType: 'application/json', body: fixtureData }),
  )
}

// Clears localStorage before the first page load only
export async function clearStorage(page: Page) {
  await page.addInitScript(() => localStorage.clear())
}

// Navigate to the app, authenticate in local mode, land on /dashboard
export async function goLocal(page: Page) {
  await page.goto('/')
  await page.click('text=Continue locally')
  await page.waitForURL('**/dashboard')
}

// SPA-safe navigation — clicks the nav link without a full page reload
export async function navTo(page: Page, path: string) {
  await page.click(`a[href="${path}"]`)
  await page.waitForURL(`**${path}`)
}
