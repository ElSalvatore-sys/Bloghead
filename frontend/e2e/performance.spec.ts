import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('homepage loads within 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(5000)
  })

  test('artists page loads within 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/artists')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(5000)
  })

  test('events page loads within 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/events')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(5000)
  })

  test('no critical console errors on homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    await page.goto('/')
    await page.waitForTimeout(2000)
    // Filter out non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('third-party') &&
      !e.includes('analytics') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::')
    )
    expect(criticalErrors.length).toBe(0)
  })

  test('page is interactive quickly', async ({ page }) => {
    await page.goto('/')
    // Try clicking something to verify interactivity
    const clickable = page.locator('a, button').first()
    await expect(clickable).toBeEnabled()
  })
})
