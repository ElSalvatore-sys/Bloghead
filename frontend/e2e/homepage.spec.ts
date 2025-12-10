import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads successfully with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Bloghead/i)
  })

  test('displays hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('header is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
  })

  test('footer contains legal links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.getByText(/Impressum/i)).toBeVisible()
    await expect(footer.getByText(/Datenschutz/i)).toBeVisible()
  })
})

test.describe('Homepage Auth Buttons', () => {
  // Use desktop viewport where auth buttons are visible
  test.use({ viewport: { width: 1280, height: 720 } })

  test('register button opens modal when not logged in', async ({ page }) => {
    await page.goto('/')
    // Find REGISTRIEREN button in header (exact match to avoid "Jetzt Registrieren")
    const registerBtn = page.locator('header button').filter({ hasText: /^REGISTRIEREN$/ })
    await registerBtn.click()
    // Register modal shows "WILLKOMMEN BEI BLOGHEAD" heading (doesn't use role="dialog")
    await expect(page.getByText('WILLKOMMEN BEI BLOGHEAD')).toBeVisible({ timeout: 5000 })
  })

  test('sign in button opens login modal', async ({ page }) => {
    await page.goto('/')
    const signInBtn = page.locator('button:has-text("SIGN IN")')
    await signInBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  })
})
