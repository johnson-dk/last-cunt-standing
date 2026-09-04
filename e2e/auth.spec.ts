import { test, expect } from '@playwright/test'
import { mockFplApi, clearStorage } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearStorage(page)
  await mockFplApi(page)
})

test('Continue locally bypasses sign-in and lands on Standings', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Sign in with Google')).toBeVisible()
  await page.click('text=Continue locally')
  await page.waitForURL('**/dashboard')
  await expect(page.getByText('Standings')).toBeVisible()
  await expect(page.getByText('Sign in with Google')).not.toBeVisible()
})

test('Switch mode returns to the sign-in screen', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Continue locally')
  await page.waitForURL('**/dashboard')
  await page.click('text=Switch mode')
  await expect(page.getByText('Sign in with Google')).toBeVisible()
})
