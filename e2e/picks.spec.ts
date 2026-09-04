import { test, expect } from '@playwright/test'
import { mockFplApi, goLocal, clearStorage, navTo } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
  await mockFplApi(page)
  await goLocal(page)

  // Add a player via SPA navigation
  await navTo(page, '/players')
  await page.fill('#player-name', 'Alice')
  await page.click('button:has-text("Add")')
})

test('select a team pick and it persists after navigation', async ({ page }) => {
  await navTo(page, '/picks')
  await page.waitForTimeout(500)

  const select = page.locator('tr', { has: page.getByText('Alice') }).locator('select')
  await select.selectOption({ label: 'Arsenal' })

  await navTo(page, '/dashboard')
  await navTo(page, '/picks')

  const savedSelect = page.locator('tr', { has: page.getByText('Alice') }).locator('select')
  await expect(savedSelect).toHaveValue('1')
})

test('process results marks win correctly', async ({ page }) => {
  await navTo(page, '/picks')
  await page.waitForTimeout(500)

  const select = page.locator('tr', { has: page.getByText('Alice') }).locator('select')
  await select.selectOption({ label: 'Arsenal' })

  await page.click('text=Process Results')
  await page.waitForTimeout(1500)

  await expect(page.locator('.badge--win').first()).toBeVisible()
})

test('process results marks loss correctly', async ({ page }) => {
  await navTo(page, '/players')
  await page.fill('#player-name', 'Bob')
  await page.click('button:has-text("Add")')

  await navTo(page, '/picks')
  await page.waitForTimeout(500)

  const bobSelect = page.locator('tr', { has: page.getByText('Bob') }).locator('select')
  await bobSelect.selectOption({ label: 'Chelsea' })

  await page.click('text=Process Results')
  await page.waitForTimeout(1500)

  // After a loss, Bob is eliminated — check Standings for eliminated badge
  await navTo(page, '/dashboard')
  const bobRow = page.locator('tr', { has: page.getByText('Bob') })
  await expect(bobRow.locator('.badge--eliminated')).toBeVisible()
})

test('process button is disabled for future gameweeks', async ({ page }) => {
  await navTo(page, '/picks')
  await page.waitForTimeout(500)

  await page.click('button:has-text("→")')
  await page.waitForTimeout(300)

  await expect(page.getByRole('button', { name: 'Future week' })).toBeDisabled()
})
