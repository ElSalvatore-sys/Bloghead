import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBeTruthy()
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      const ariaHidden = await img.getAttribute('aria-hidden')
      // Image should have alt, role=presentation, or be aria-hidden
      expect(alt !== null || role === 'presentation' || ariaHidden === 'true').toBeTruthy()
    }
  })

  test('page has main content area', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main, [role="main"]').first()
    await expect(main).toBeVisible()
  })

  test('interactive elements are keyboard accessible', async ({ page, isMobile }) => {
    // Skip this test on mobile as keyboard navigation works differently
    test.skip(isMobile, 'Keyboard navigation test is desktop-only')
    await page.goto('/')
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('contact form inputs have labels or placeholders', async ({ page }) => {
    await page.goto('/kontakt')
    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')
      const name = await input.getAttribute('name')
      // Input should have some form of identification
      expect(id || ariaLabel || placeholder || name).toBeTruthy()
    }
  })

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/')
    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')
      // Button should have text content or aria-label
      expect(text?.trim() || ariaLabel || title).toBeTruthy()
    }
  })
})
