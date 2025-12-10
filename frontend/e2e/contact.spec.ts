import { test, expect } from '@playwright/test'

test.describe('Contact Page', () => {
  test('contact page loads', async ({ page }) => {
    await page.goto('/kontakt')
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('displays contact form', async ({ page }) => {
    await page.goto('/kontakt')
    // Look for form elements
    await expect(page.locator('form, input, textarea').first()).toBeVisible()
  })

  test('has name input field', async ({ page }) => {
    await page.goto('/kontakt')
    const nameInput = page.locator('input[name*="name" i], input[placeholder*="name" i], input[id*="name" i]').first()
    await expect(nameInput).toBeVisible()
  })

  test('has email input field', async ({ page }) => {
    await page.goto('/kontakt')
    const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="mail" i]').first()
    await expect(emailInput).toBeVisible()
  })

  test('has message textarea', async ({ page }) => {
    await page.goto('/kontakt')
    const messageField = page.locator('textarea').first()
    await expect(messageField).toBeVisible()
  })

  test('accepts valid input', async ({ page }) => {
    await page.goto('/kontakt')
    const nameInput = page.locator('input[name*="name" i], input[placeholder*="name" i], input[id*="name" i]').first()
    const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="mail" i]').first()
    const messageField = page.locator('textarea').first()

    await nameInput.fill('Test User')
    await emailInput.fill('test@example.com')
    await messageField.fill('Dies ist eine Testnachricht.')

    await expect(nameInput).toHaveValue('Test User')
    await expect(emailInput).toHaveValue('test@example.com')
  })
})
