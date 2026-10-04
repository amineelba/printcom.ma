import { test, expect, type Page } from '@playwright/test'
import {
  BARE_SLUG,
  CONFIGURABLE_SLUG,
  VISUAL_SLUG,
  createConfiguratorFixtures,
  removeConfiguratorFixtures,
} from '../helpers/configuratorFixture'

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  await createConfiguratorFixtures()
})

test.afterAll(async () => {
  await removeConfiguratorFixtures()
})

const summary = (page: Page) => page.getByRole('region', { name: 'Votre configuration' })

test.describe('Product page configurator', () => {
  test('configure a product, see the summary follow, and continue to the quote checkout', async ({ page }) => {
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    await expect(page.locator('h1')).toHaveText('E2E Produit configurable')
    await expect(summary(page)).not.toContainText('Format')

    await page.getByRole('radio', { name: 'A5' }).check({ force: true })
    await page.getByRole('radio', { name: 'Paysage' }).check({ force: true })
    await page.getByRole('radio', { name: 'E2E Papier mat' }).check({ force: true })
    await page.getByRole('checkbox', { name: 'E2E Vernis A' }).check({ force: true })
    await page.getByRole('checkbox', { name: 'E2E Vernis B' }).check({ force: true })

    await expect(page.getByRole('radio', { name: 'A5' })).toBeChecked()
    await expect(summary(page)).toContainText('A5')
    await expect(summary(page)).toContainText('Paysage')
    await expect(summary(page)).toContainText('E2E Papier mat')
    await expect(summary(page)).toContainText('E2E Vernis A, E2E Vernis B')
    await expect(summary(page)).not.toContainText('Grammage')
    await expect(summary(page)).not.toContainText('landscape')

    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(page).toHaveURL(new RegExp(`/demande-de-devis\\?produit=${CONFIGURABLE_SLUG}&cfg=1\\.`))
    await expect(page.locator('h1')).toHaveText('Demande de devis')
    // Sprint 1 checkout stays short: no configuration questions on the quote page —
    // the choices only come back as a read-only "Votre demande" summary.
    await expect(page.getByRole('radio', { name: 'A5' })).toHaveCount(0)
    await expect(page.getByText('Votre configuration')).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Votre demande' })).toContainText('E2E Vernis A, E2E Vernis B')
  })

  test('single-choice groups are keyboard-operable radios; finishes are checkboxes', async ({ page }) => {
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    const portrait = page.getByRole('radio', { name: 'Portrait' })
    const landscape = page.getByRole('radio', { name: 'Paysage' })

    await portrait.focus()
    await page.keyboard.press('Space')
    await expect(portrait).toBeChecked()
    await page.keyboard.press('ArrowDown')
    await expect(landscape).toBeChecked()
    await expect(portrait).not.toBeChecked()

    const vernisA = page.getByRole('checkbox', { name: 'E2E Vernis A' })
    await vernisA.focus()
    await page.keyboard.press('Space')
    await expect(vernisA).toBeChecked()
    await page.keyboard.press('Space')
    await expect(vernisA).not.toBeChecked()
  })

  test('custom format reveals labelled dimension inputs and feeds the summary', async ({ page }) => {
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    await expect(page.getByLabel('Largeur')).toHaveCount(0)
    await page.getByRole('radio', { name: 'Sur mesure' }).check({ force: true })
    await page.getByLabel('Largeur').fill('120')
    await page.getByLabel('Hauteur').fill('80')
    await expect(page.getByText('La faisabilité du format sera confirmée par notre équipe.')).toBeVisible()
    await expect(summary(page)).toContainText('120 × 80 mm')
    await page.getByRole('radio', { name: 'A4' }).check({ force: true })
    await expect(page.getByLabel('Largeur')).toHaveCount(0)
  })

  test('shows no price, cart or payment UI', async ({ page }) => {
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    await expect(page.getByText(/panier|commander|payer|à partir de|MAD/i)).toHaveCount(0)
  })

  test('a product without configuration keeps a working quote CTA and no empty configurator', async ({ page }) => {
    await page.goto(`/produits/${BARE_SLUG}`)
    await expect(page.locator('h1')).toHaveText('E2E Produit sans configuration')
    await expect(page.getByRole('group')).toHaveCount(0)
    await expect(summary(page)).toHaveCount(0)
    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(page).toHaveURL(new RegExp(`/demande-de-devis\\?produit=${BARE_SLUG}$`))
  })

  test('category archives still render and never mount the configurator', async ({ page }) => {
    await page.goto('/produits/packaging')
    await expect(page.locator('h1')).toContainText('Packaging')
    await expect(page.getByRole('group')).toHaveCount(0)
    await expect(summary(page)).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'E2E Produit configurable' }).first()).toBeVisible()
  })

  test('mobile: single column, no horizontal overflow, CTA reachable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await expect(page.getByRole('link', { name: 'Obtenir mon devis' }).first()).toBeVisible()
  })
})

test.describe('Visual options (thumbnails and preview images)', () => {
  test('thumbnails render, the main preview follows preview images, and text options stay clean', async ({ page }) => {
    await page.goto(`/produits/${VISUAL_SLUG}`)
    const preview = page.getByRole('img', { name: 'Produit de base e2e' })
    await expect(preview).toBeVisible()

    const formats = page.getByRole('group', { name: 'Format' })
    const a4 = formats.getByRole('radio', { name: 'A4' })
    const a5 = formats.getByRole('radio', { name: 'A5' })
    const a6 = formats.getByRole('radio', { name: 'A6' })

    // Thumbnails: A4/A5 have one, text-only A6 has no image or empty frame.
    const card = (radio: typeof a4) => radio.locator('xpath=ancestor::label')
    await expect(card(a4).locator('img')).toBeVisible()
    await expect(card(a5).locator('img')).toBeVisible()
    await expect(card(a6).locator('img')).toHaveCount(0)
    await expect(formats.getByText('210 × 297 mm')).toBeVisible()
    await expect(card(page.getByRole('radio', { name: 'E2E Papier image' })).locator('img')).toBeVisible()

    // Preview image on A4 → main preview changes; selected state is exposed.
    await a4.check({ force: true })
    await expect(a4).toBeChecked()
    await expect(page.getByRole('img', { name: 'Aperçu A4 e2e' })).toBeVisible()
    await expect(preview).toHaveCount(0)

    // Thumbnail-only A5 does not replace the preview: base comes back.
    await a5.check({ force: true })
    await expect(page.getByRole('img', { name: 'Produit de base e2e' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Aperçu A4 e2e' })).toHaveCount(0)

    // Text-only option: no broken image anywhere, summary stays correct.
    await a6.check({ force: true })
    const broken = await page.evaluate(() =>
      Array.from(document.images).filter((img) => img.complete && img.naturalWidth === 0).length,
    )
    expect(broken).toBe(0)
    await page.getByRole('radio', { name: '500' }).check({ force: true })
    await expect(page.getByRole('region', { name: 'Votre configuration' })).toContainText('A6')
    await expect(page.getByRole('region', { name: 'Votre configuration' })).toContainText('500')

    // Re-selecting the preview-backed option brings its preview back.
    await a4.check({ force: true })
    await expect(page.getByRole('img', { name: 'Aperçu A4 e2e' })).toBeVisible()

    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(page).toHaveURL(new RegExp(`/demande-de-devis\\?produit=${VISUAL_SLUG}&cfg=1\\.`))
    await expect(page.locator('h1')).toHaveText('Demande de devis')
  })

  test('mobile: image cards stay readable with no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(`/produits/${VISUAL_SLUG}`)
    await page.getByRole('radio', { name: 'A4' }).check({ force: true })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await expect(page.getByRole('radio', { name: 'A4' })).toBeChecked()
    await expect(page.getByText('210 × 297 mm')).toBeVisible()
  })
})
