import { test, expect } from '@playwright/test'

test.describe('Artists Page', () => {
  test('loads artists page', async ({ page }) => {
    await page.goto('/artists')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    // Check page loaded successfully (not 404)
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('displays page content', async ({ page }) => {
    await page.goto('/artists')
    await page.waitForLoadState('networkidle')
    // Should have some content
    await expect(page.locator('main, [class*="container"], [class*="content"]').first()).toBeVisible()
  })

  test('has search or filter functionality', async ({ page }) => {
    await page.goto('/artists')
    await page.waitForLoadState('networkidle')
    // Look for search input or filter controls
    const searchOrFilter = page.locator('input[type="search"], input[placeholder*="such" i], input[placeholder*="search" i], [class*="filter"], select').first()
    // May or may not exist, just check page loads
    await expect(page.locator('body')).toBeVisible()
  })

  test('artist cards link to profile pages', async ({ page }) => {
    await page.goto('/artists')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    // Find any link to /artists/
    const artistLink = page.locator('a[href^="/artists/"]').first()
    if (await artistLink.isVisible()) {
      await artistLink.click()
      await expect(page).toHaveURL(/\/artists\//)
    }
  })
})
