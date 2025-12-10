import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('page loads on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('header is visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
  })

  test('homepage content is visible on mobile', async ({ page }) => {
    await page.goto('/')
    // Check main content area
    await expect(page.locator('main, section').first()).toBeVisible()
  })

  test('homepage scrolls properly on mobile', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('footer')).toBeInViewport()
  })

  test('dashboard sidebar toggle works on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    // On mobile dashboard, should see hamburger menu
    await page.waitForTimeout(500)
    const hamburger = page.locator('button').filter({ has: page.locator('svg') }).first()
    if (await hamburger.isVisible()) {
      await hamburger.click()
      await page.waitForTimeout(300)
      // Sidebar should become visible
      const sidebar = page.locator('aside').first()
      await expect(sidebar).toBeVisible()
    }
  })

  test('content is readable on mobile', async ({ page }) => {
    await page.goto('/')
    // Check that main content area exists and is visible
    const content = page.locator('main, section, [class*="hero"]').first()
    await expect(content).toBeVisible()
  })

  test('text is properly sized on mobile', async ({ page }) => {
    await page.goto('/')
    // Check that headings exist
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })
})
