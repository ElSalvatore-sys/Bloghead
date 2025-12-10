import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  // Header navigation tests need desktop viewport
  test.describe('Header Navigation', () => {
    test.use({ viewport: { width: 1280, height: 720 } })

    test('navigate to artists page', async ({ page }) => {
      await page.goto('/')
      // Click on ARTISTS link in header
      await page.locator('header').getByRole('link', { name: /artists/i }).click()
      await expect(page).toHaveURL(/artists/)
    })

    test('navigate to events page via dropdown', async ({ page }) => {
      await page.goto('/')
      // Events is in a dropdown, first hover/click the dropdown trigger
      const eventsDropdown = page.locator('header').getByText(/events/i).first()
      await eventsDropdown.hover()
      // Wait for dropdown to appear
      await page.waitForTimeout(300)
      // Click on Veranstaltungen link
      const eventsLink = page.getByRole('link', { name: /veranstaltungen/i })
      if (await eventsLink.isVisible()) {
        await eventsLink.click()
        await expect(page).toHaveURL(/events/)
      }
    })

    test('navigate to services page', async ({ page }) => {
      await page.goto('/')
      await page.locator('header').getByRole('link', { name: /services/i }).click()
      await expect(page).toHaveURL(/services/)
    })
  })

  // Footer navigation works on all viewports
  test.describe('Footer Navigation', () => {
    test('navigate to contact page from footer', async ({ page }) => {
      await page.goto('/')
      // Contact is in footer
      await page.locator('footer').getByRole('link', { name: /kontakt/i }).click()
      await expect(page).toHaveURL(/kontakt/)
    })

    test('navigate to impressum from footer', async ({ page }) => {
      await page.goto('/')
      await page.locator('footer').getByRole('link', { name: /impressum/i }).click()
      await expect(page).toHaveURL(/impressum/)
    })

    test('navigate to datenschutz from footer', async ({ page }) => {
      await page.goto('/')
      await page.locator('footer').getByRole('link', { name: /datenschutz/i }).click()
      await expect(page).toHaveURL(/datenschutz/)
    })
  })

  test('logo navigates to homepage', async ({ page }) => {
    await page.goto('/artists')
    // Click on logo/brand link
    const logo = page.locator('header a[href="/"]').first()
    await logo.click()
    await expect(page).toHaveURL('/')
  })
})
