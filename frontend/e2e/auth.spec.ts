import { test, expect } from '@playwright/test'

test.describe('Authentication Modals', () => {
  // Use desktop viewport where auth buttons are visible
  test.use({ viewport: { width: 1280, height: 720 } })

  test.describe('Login Modal', () => {
    test('opens login modal from header', async ({ page }) => {
      await page.goto('/')
      // Click SIGN IN button in header - use text selector
      const loginBtn = page.locator('button:has-text("SIGN IN")')
      await loginBtn.click()
      // Modal should appear
      await expect(page.getByRole('dialog')).toBeVisible()
    })

    test('login modal has email and password fields', async ({ page }) => {
      await page.goto('/')
      const loginBtn = page.locator('button:has-text("SIGN IN")')
      await loginBtn.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      // Check for email/password inputs in dialog
      await expect(page.getByRole('dialog').locator('input[type="email"], input[placeholder*="mail" i]').first()).toBeVisible()
      await expect(page.getByRole('dialog').locator('input[type="password"]').first()).toBeVisible()
    })

    test('login modal has OAuth buttons', async ({ page }) => {
      await page.goto('/')
      const loginBtn = page.locator('button:has-text("SIGN IN")')
      await loginBtn.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      // Check for Google/Facebook OAuth buttons
      await expect(page.getByRole('dialog').getByRole('button', { name: /google/i })).toBeVisible()
      await expect(page.getByRole('dialog').getByRole('button', { name: /facebook/i })).toBeVisible()
    })

    test('login modal can be closed', async ({ page }) => {
      await page.goto('/')
      const loginBtn = page.locator('button:has-text("SIGN IN")')
      await loginBtn.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      // Close the modal
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('can switch to register modal from login', async ({ page }) => {
      await page.goto('/')
      const loginBtn = page.locator('button:has-text("SIGN IN")')
      await loginBtn.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      // Look for register link
      const registerLink = page.getByRole('dialog').getByText(/registrieren|konto erstellen/i)
      await registerLink.click()
      // Should still have dialog visible (now register modal)
      await expect(page.getByRole('dialog')).toBeVisible()
    })
  })

  test.describe('Register Modal', () => {
    test('opens register modal from header', async ({ page }) => {
      await page.goto('/')
      // Use exact match to target header button, not "Jetzt Registrieren" buttons
      const registerBtn = page.locator('header button').filter({ hasText: /^REGISTRIEREN$/ })
      await registerBtn.click()
      // Register modal shows "WILLKOMMEN BEI BLOGHEAD" heading (doesn't use role="dialog")
      await expect(page.getByText('WILLKOMMEN BEI BLOGHEAD')).toBeVisible()
    })

    test('register modal has account type selection', async ({ page }) => {
      await page.goto('/')
      // Use exact match to target header button, not "Jetzt Registrieren" buttons
      const registerBtn = page.locator('header button').filter({ hasText: /^REGISTRIEREN$/ })
      await registerBtn.click()
      // Register modal shows account type options
      await expect(page.getByText('WILLKOMMEN BEI BLOGHEAD')).toBeVisible()
      // Check for account type buttons (using role to be more specific)
      await expect(page.getByRole('button', { name: /Fan \/ Community/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Künstler.*Zeig dein Talent/i })).toBeVisible()
    })
  })
})
