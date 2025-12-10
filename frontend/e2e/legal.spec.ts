import { test, expect } from '@playwright/test'

test.describe('Legal Pages', () => {
  test('Impressum page loads', async ({ page }) => {
    await page.goto('/impressum')
    await expect(page.locator('body')).not.toContainText('404')
    // Page should have content about Impressum
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('Impressum contains required legal information', async ({ page }) => {
    await page.goto('/impressum')
    // German law requires certain info in Impressum
    await expect(page.getByText(/verantwortlich|angaben|betreiber/i).first()).toBeVisible()
  })

  test('Datenschutz page loads', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.locator('body')).not.toContainText('404')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('Datenschutz contains privacy information', async ({ page }) => {
    await page.goto('/datenschutz')
    // GDPR-related content
    await expect(page.getByText(/daten|privacy|datenschutz/i).first()).toBeVisible()
  })
})
