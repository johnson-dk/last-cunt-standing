import { test, expect } from '@playwright/test'
import { mockFplApi, goLocal, clearStorage, navTo } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
  await mockFplApi(page)
  await goLocal(page)

  // Add a player, make a pick, process results
  await navTo(page, '/players')
  await page.fill('#player-name', 'Alice')
  await page.click('button:has-text("Add")')

  await navTo(page, '/picks')
  await page.waitForTimeout(500)
  const select = page.locator('tr', { has: page.getByText('Alice') }).locator('select')
  await select.selectOption({ label: 'Arsenal' })
  await page.click('text=Process Results')
  await page.waitForTimeout(1500)
})

test('processed week shows win cell in History grid', async ({ page }) => {
  await navTo(page, '/history')
  await expect(page.locator('.history-pick-cell--win').first()).toBeVisible()
})

test('History shows team name for processed pick', async ({ page }) => {
  await navTo(page, '/history')
  await expect(page.getByText('Arsenal')).toBeVisible()
})

test('process button shows Already processed after processing', async ({ page }) => {
  await navTo(page, '/picks')
  await expect(page.getByRole('button', { name: 'Already processed' })).toBeDisabled()
})
