import { test, expect } from '@playwright/test'

test.describe('Quote checkout — /demande-de-devis', () => {
  test('is a single-scroll form: no stepper, no wizard controls, no file upload or brief', async ({ page }) => {
    await page.goto('/demande-de-devis')
    await expect(page.locator('h1')).toHaveText('Demande de devis')
    await expect(page.getByRole('button', { name: 'Obtenir mon devis' })).toBeVisible()

    await expect(page.getByText(/Étape \d/)).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Continuer|Précédent/ })).toHaveCount(0)
    await expect(page.locator('input[type="file"]')).toHaveCount(0)
    await expect(page.getByLabel(/Décrivez votre besoin|Lien externe|Adresse ou zone/)).toHaveCount(0)
    await expect(page.getByText('Votre demande', { exact: true })).toHaveCount(0) // no context → no empty summary card
  })

  test('shows required errors tied to their fields, and blocks submit', async ({ page }) => {
    await page.goto('/demande-de-devis')
    await page.getByRole('button', { name: 'Obtenir mon devis' }).click()

    await expect(page).toHaveURL(/\/demande-de-devis$/)
    await expect(page.locator('#fullName-error')).toBeVisible()
    await expect(page.locator('#phone-error')).toBeVisible()
    await expect(page.locator('#email-error')).toBeVisible()
    await expect(page.locator('#designSource-error')).toBeVisible()
    await expect(page.locator('#consentConfirmed-error')).toBeVisible()
    await expect(page.locator('#company-error')).toHaveCount(0)

    await expect(page.locator('#fullName')).toHaveAttribute('aria-describedby', 'fullName-error')
    await expect(page.locator('#fullName')).toBeFocused()
  })

  test('design source is a mutually exclusive, keyboard-operable radio group', async ({ page }) => {
    await page.goto('/demande-de-devis')
    const group = page.getByRole('group', { name: /Qui fournit le design/ })
    const own = group.getByRole('radio', { name: 'J’ai déjà mon design' })
    const printcom = group.getByRole('radio', { name: 'Printcom réalise le design' })

    await expect(own).not.toBeChecked()
    await expect(printcom).not.toBeChecked()

    await own.focus()
    await page.keyboard.press('Space')
    await expect(own).toBeChecked()

    await page.keyboard.press('ArrowDown')
    await expect(printcom).toBeChecked()
    await expect(own).not.toBeChecked()

    // Choosing an answer reveals nothing extra.
    await expect(page.locator('input[type="file"]')).toHaveCount(0)
    await expect(page.getByLabel(/brief|cahier des charges/i)).toHaveCount(0)
  })

  test('submits the short form and lands on the confirmation with a reference', async ({ page }) => {
    await page.goto('/demande-de-devis')
    await page.getByLabel('Nom complet').fill('Amine E2E')
    await page.getByLabel('Téléphone').fill('+212600000000')
    await page.getByLabel('E-mail').fill('e2e@example.com')
    await page.getByRole('radio', { name: 'Printcom réalise le design' }).check({ force: true })
    await page.getByLabel('J’accepte', { exact: false }).check()
    await page.getByRole('button', { name: 'Obtenir mon devis' }).click()

    await expect(page).toHaveURL(/\/demande-de-devis\/merci\?reference=PC-DEVIS-\d{4}-\d{6}/)
    await expect(page.locator('h1')).toHaveText('Demande reçue')
    await expect(page.getByText(/PC-DEVIS-\d{4}-\d{6}/)).toBeVisible()
    await expect(page.getByText('vous contactera pour confirmer les détails')).toBeVisible()
  })
})
