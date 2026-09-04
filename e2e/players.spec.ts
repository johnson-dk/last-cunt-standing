import { test, expect } from '@playwright/test'
import { mockFplApi, goLocal, clearStorage, navTo } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
  await mockFplApi(page)
  await goLocal(page)
})

test('add a player and see them in Standings', async ({ page }) => {
  await navTo(page, '/players')
  await page.fill('#player-name', 'Alice')
  await page.click('button:has-text("Add")')

  await navTo(page, '/dashboard')
  await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible()
})

test('added player appears in Picks table', async ({ page }) => {
  await navTo(page, '/players')
  await page.fill('#player-name', 'Bob')
  await page.click('button:has-text("Add")')

  await navTo(page, '/picks')
  await expect(page.getByRole('cell', { name: 'Bob' })).toBeVisible()
})

test('add multiple players', async ({ page }) => {
  await navTo(page, '/players')

  for (const name of ['Alice', 'Bob', 'Charlie']) {
    await page.fill('#player-name', name)
    await page.click('button:has-text("Add")')
  }

  await navTo(page, '/dashboard')
  await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Bob' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Charlie' })).toBeVisible()
})
