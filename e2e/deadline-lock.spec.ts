import { test, expect } from '@playwright/test'
import { mockFplApi, goLocal, clearStorage, navTo } from './helpers'

// bootstrap-gw3-closed: GW3 deadline is 2026-08-29 (past), GW4 is next
// fetchCurrentGameweek advances to GW4 as current → GW3 becomes a past week

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
  await mockFplApi(page, 'bootstrap-gw3-closed.json')
  await goLocal(page)

  await navTo(page, '/players')
  await page.fill('#player-name', 'Alice')
  await page.click('button:has-text("Add")')
})

test('picks are locked when viewing a past gameweek', async ({ page }) => {
  await navTo(page, '/picks')
  await page.waitForTimeout(500)

  // Page starts on GW4 (current). Navigate back to closed GW3.
  await page.click('button:has-text("←")')
  await page.waitForTimeout(300)

  const select = page.locator('tr', { has: page.getByText('Alice') }).locator('select')
  await expect(select).toBeDisabled()
})

test('picks are open on the current (not yet closed) gameweek', async ({ page }) => {
  await navTo(page, '/picks')
  await page.waitForTimeout(500)

  // GW4 is current and its deadline is in the future — picks should be open
  const select = page.locator('tr', { has: page.getByText('Alice') }).locator('select')
  await expect(select).toBeEnabled()
})

test('can still process results for a past (closed) week', async ({ page }) => {
  await navTo(page, '/picks')
  await page.waitForTimeout(500)

  await page.click('button:has-text("←")')
  await page.waitForTimeout(300)

  // Process Results should NOT be disabled by the deadline lock alone
  // (it is controlled by isFutureWeek / isAlreadyProcessed, not isClosed)
  await expect(page.getByRole('button', { name: 'Process Results' })).toBeEnabled()
})
