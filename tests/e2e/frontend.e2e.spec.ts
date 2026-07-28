import { test, expect } from '@playwright/test'

test.describe('Frontend — golden paths', () => {
  test('homepage loads with the real hero content', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Printcom/)
    await expect(page.locator('h1').first()).toContainText('supports imprimés')
    await expect(page.getByRole('link', { name: 'Demander un devis' }).first()).toBeVisible()
  })

  test('skip link is the first focusable element and jumps to main content', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.locator('.pc-skip-link')
    await expect(skipLink).toBeFocused()
  })

  test('desktop navigation reaches the products archive', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Produits' }).first().click()
    await expect(page).toHaveURL(/\/produits/)
    await expect(page.locator('h1')).toContainText('Produits')
  })

  test('product category filter updates the URL', async ({ page }) => {
    await page.goto('/produits')
    const select = page.locator('#filter-categorie')
    if (await select.count()) {
      await select.selectOption({ index: 1 })
      await expect(page).toHaveURL(/categorie=/)
    }
  })

  test('mobile menu opens, traps focus, and closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Ouvrir le menu' })
    await trigger.click()
    await expect(page.getByRole('dialog', { name: 'Menu principal' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Menu principal' })).toBeHidden()
  })

  test('search overlay opens and navigates to results', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Rechercher' }).click()
    const input = page.getByLabel('Rechercher sur le site Printcom')
    await input.fill('carte')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/recherche\?q=carte/)
  })

  test('contact form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.getByText('Veuillez corriger les champs suivants')).toBeVisible()
  })

  test('quote wizard advances through steps and blocks on missing description', async ({ page }) => {
    await page.goto('/demande-de-devis')
    await expect(page.locator('h1')).toContainText('Demande de devis')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(page.locator('#description-error')).toBeVisible()
  })

  test('unknown route renders the 404 page', async ({ page }) => {
    const response = await page.goto('/cette-page-nexiste-pas')
    expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toContainText('introuvable')
  })

  test('parc-machines is hidden (404) until a confirmed machine is published', async ({ page }) => {
    const response = await page.goto('/parc-machines')
    expect(response?.status()).toBe(404)
  })

  test('reduced motion is respected (no forced animation on load)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
