import { test, expect, type Page } from '@playwright/test'
import {
  CONFIGURABLE_SLUG,
  SCHEMA_CARD_SLUG,
  SCHEMA_DOC_SLUG,
  SCHEMA_LABEL_SLUG,
  createConfiguratorFixtures,
  findQuoteByReference,
  removeConfiguratorFixtures,
  removeQuotesByReference,
} from '../helpers/configuratorFixture'
import { serializeConfiguration } from '../../src/lib/configurator/transport'
import { emptyConfigurationState, type ProductConfigurationState } from '../../src/lib/configurator/types'

test.describe.configure({ mode: 'serial' })

const references: string[] = []

test.beforeAll(async () => {
  await createConfiguratorFixtures()
})

test.afterAll(async () => {
  await removeQuotesByReference(references)
  await removeConfiguratorFixtures()
})

// Each test presents its own address: the submit action rate-limits per IP (3/min).
let ipSeed = Math.floor(Math.random() * 100) + 120
test.beforeEach(async ({ page }) => {
  ipSeed += 1
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `198.51.100.${ipSeed % 250}` })
})

const state = (partial: Partial<ProductConfigurationState>) => ({ ...emptyConfigurationState(), ...partial })
const group = (page: Page, name: string) => page.getByRole('group', { name, exact: true })
const groupNames = (page: Page) => page.locator('fieldset > legend').allTextContents()
const summary = (page: Page) => page.getByRole('region', { name: 'Votre configuration' })
const recap = (page: Page) => page.getByRole('region', { name: 'Votre demande' })

async function fillAndSubmit(page: Page) {
  await page.getByLabel('Nom complet').fill('Amine E2E')
  await page.getByLabel('Téléphone').fill('+212600000000')
  await page.getByLabel('E-mail').fill('e2e-schema@example.com')
  await page.locator('label[for="designSource-client"]').click()
  await page.getByLabel('J’accepte', { exact: false }).check()
  await page.getByRole('button', { name: 'Obtenir mon devis' }).click()
  await expect(page).toHaveURL(/\/demande-de-devis\/merci\?reference=PC-DEVIS-\d{4}-\d{6}/)
  const reference = new URL(page.url()).searchParams.get('reference')!
  references.push(reference)
  return reference
}

test.describe('Each product shows only its own dimensions', () => {
  test('card-like product', async ({ page }) => {
    await page.goto(`/produits/${SCHEMA_CARD_SLUG}`)
    await expect(page.locator('h1')).toHaveText('E2E Schéma carte')
    expect(await groupNames(page)).toEqual(['Format', 'Orientation', 'Support', 'Grammage', 'Finition'])
    // The needs-review "Fenêtre" dimension is known but has no confirmed values: no control at all.
    await expect(group(page, 'Fenêtre')).toHaveCount(0)
    await expect(group(page, 'Reliure')).toHaveCount(0)
    await expect(group(page, 'Adhésif')).toHaveCount(0)
  })

  test('document-like product', async ({ page }) => {
    await page.goto(`/produits/${SCHEMA_DOC_SLUG}`)
    expect(await groupNames(page)).toEqual(['Format', 'Nombre de pages', 'Couverture', 'Reliure'])
    await expect(group(page, 'Format').getByRole('radio')).toHaveCount(1) // A4 only: B's allowlist, not the card's
    await expect(group(page, 'Support')).toHaveCount(0)
    await expect(group(page, 'Grammage')).toHaveCount(0)
    await expect(group(page, 'Orientation')).toHaveCount(0)
  })

  test('label-like product: typed measures, a number, a boolean, choices — and no format', async ({ page }) => {
    await page.goto(`/produits/${SCHEMA_LABEL_SLUG}`)
    expect(await groupNames(page)).toEqual(['Dimensions', 'Support', 'Adhésif', 'Finition', 'Quantité par planche', 'Élastique'])
    await expect(group(page, 'Dimensions').getByRole('textbox')).toHaveCount(3)
    await expect(group(page, 'Format')).toHaveCount(0)
    await expect(group(page, 'Fenêtre')).toHaveCount(0)
    await expect(group(page, 'Support').getByRole('radio')).toHaveCount(1) // a lone option is auto-selected
    await expect(group(page, 'Support').getByRole('radio')).toBeChecked()
  })
})

test.describe('Schema-driven funnel', () => {
  test('card-like: select, preview, checkout summary, Modifier, submit, persisted core fields', async ({ page }) => {
    await page.goto(`/produits/${SCHEMA_CARD_SLUG}`)

    await group(page, 'Format').getByRole('radio', { name: 'A4' }).check({ force: true })
    // The format option's own preview image drives the main preview (Sprint 3 behaviour, schema path).
    await expect(page.getByRole('img', { name: 'Aperçu schéma A4' })).toBeVisible()

    await group(page, 'Orientation').getByRole('radio', { name: 'Paysage' }).check({ force: true })
    await group(page, 'Support').getByRole('radio', { name: 'E2E Papier mat' }).check({ force: true })
    await group(page, 'Grammage').getByRole('radio', { name: '350 g' }).check({ force: true })
    await group(page, 'Finition').getByRole('checkbox', { name: 'E2E Vernis A' }).check({ force: true })
    await group(page, 'Finition').getByRole('checkbox', { name: 'E2E Vernis B' }).check({ force: true })
    await expect(summary(page)).toContainText('Format')
    await expect(summary(page)).toContainText('A4')

    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(page).toHaveURL(/cfg=2\./) // newest transport version
    await expect(recap(page)).toContainText('E2E Schéma carte')
    for (const text of ['A4', 'Paysage', 'E2E Papier mat', '350 g', 'E2E Vernis A, E2E Vernis B']) await expect(recap(page)).toContainText(text)
    // Rows follow the product's own schema order.
    const labels = await recap(page).locator('dt').allTextContents()
    expect(labels).toEqual(['Produit', 'Format', 'Orientation', 'Support', 'Grammage', 'Finition'])
    await expect(recap(page)).not.toContainText(/landscape|undefined|null|e2e-/)

    await recap(page).getByRole('link', { name: 'Modifier ma configuration' }).click()
    await expect(group(page, 'Format').getByRole('radio', { name: 'A4' })).toBeChecked()
    await expect(group(page, 'Orientation').getByRole('radio', { name: 'Paysage' })).toBeChecked()
    await expect(group(page, 'Finition').getByRole('checkbox', { name: 'E2E Vernis B' })).toBeChecked()
    await expect(page.getByRole('img', { name: 'Aperçu schéma A4' })).toBeVisible() // restored state drives the preview

    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    const reference = await fillAndSubmit(page)
    const quote = await findQuoteByReference(reference)
    expect(quote.configuration).toMatchObject({ format: 'A4', orientation: 'landscape', grammage: '350 g' })
    expect(quote.configuration?.material).toBeTruthy()
    expect((quote.configuration?.finish as unknown[]).length).toBe(2)
    expect(quote.configuration?.technicalSelections ?? []).toEqual([])
  })

  test('label-like: typed measure, number and boolean round-trip and are snapshotted on the lead', async ({ page }) => {
    await page.goto(`/produits/${SCHEMA_LABEL_SLUG}`)
    await page.getByLabel('Dimensions : largeur').fill('120,5')
    await page.getByLabel('Dimensions : hauteur').fill('80')
    await group(page, 'Adhésif').getByRole('radio', { name: 'Amovible' }).check({ force: true })
    await group(page, 'Finition').getByRole('checkbox', { name: 'E2E Vernis B' }).check({ force: true })
    await group(page, 'Quantité par planche').getByRole('textbox').fill('24')
    await group(page, 'Élastique').getByRole('checkbox').check()

    await expect(summary(page)).toContainText('120,5 × 80 mm')
    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()

    await expect(recap(page)).toBeVisible()
    const labels = await recap(page).locator('dt').allTextContents()
    expect(labels).toEqual(['Produit', 'Dimensions', 'Support', 'Adhésif', 'Finition', 'Quantité par planche', 'Élastique'])
    await expect(recap(page)).toContainText('120.5 × 80 mm') // canonical (decimal point), never the raw typed text
    await expect(recap(page)).toContainText('24 étiquettes')
    await expect(recap(page)).toContainText('Oui')

    await recap(page).getByRole('link', { name: 'Modifier ma configuration' }).click()
    await expect(page.getByLabel('Dimensions : largeur')).toHaveValue('120.5')
    await expect(page.getByLabel('Dimensions : hauteur')).toHaveValue('80')
    await expect(group(page, 'Adhésif').getByRole('radio', { name: 'Amovible' })).toBeChecked()
    await expect(group(page, 'Quantité par planche').getByRole('textbox')).toHaveValue('24')
    await expect(group(page, 'Élastique').getByRole('checkbox')).toBeChecked()

    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    const reference = await fillAndSubmit(page)
    const quote = await findQuoteByReference(reference)
    const selections = (quote.configuration?.technicalSelections ?? []) as { key: string; label: string; valueLabel: string; numericValue?: number; unit?: string }[]
    expect(selections.map((entry) => [entry.label, entry.valueLabel])).toEqual([
      ['Dimensions', '120.5 × 80 mm'],
      ['Adhésif', 'Amovible'],
      ['Quantité par planche', '24 étiquettes'],
      ['Élastique', 'Oui'],
    ])
    expect(selections.find((entry) => entry.key === 'e2e-par-planche')).toMatchObject({ numericValue: 24, unit: 'étiquettes' })
    expect(quote.configuration?.format).toBeFalsy() // core field untouched: this product has no format
    expect(quote.configuration?.material).toBeTruthy()
  })

  test('the document-like product never accepts the card’s or label’s dimensions', async ({ page }) => {
    const forged = serializeConfiguration(
      state({
        single: { format: 'A5', 'e2e-adhesif': 'Permanent', 'page-count': '16 pages', 'e2e-reliure': 'Spirale', orientation: 'portrait' },
        multiple: { finish: ['e2e-vernis-a'] },
        measures: { dimensions: { width: '10', height: '10', depth: '', unit: 'mm' } },
        flags: { 'e2e-elastique': true },
      }),
    )!
    await page.goto(`/demande-de-devis?produit=${SCHEMA_DOC_SLUG}&cfg=${forged}`)
    const labels = await recap(page).locator('dt').allTextContents()
    expect(labels).toEqual(['Produit', 'Nombre de pages', 'Reliure']) // only what this product really allows
    await expect(recap(page)).not.toContainText(/A5|Permanent|Portrait|Vernis|10 × 10|Oui/)

    await page.goto(`/produits/${SCHEMA_DOC_SLUG}?cfg=${forged}`)
    await expect(group(page, 'Nombre de pages').getByRole('radio', { name: '16 pages' })).toBeChecked()
    await expect(group(page, 'Reliure').getByRole('radio', { name: 'Spirale' })).toBeChecked()
    await expect(group(page, 'Format').getByRole('radio', { name: 'A4' })).not.toBeChecked()
  })

  test('a Sprint 4 (v1) URL still opens the checkout summary and the product page', async ({ page }) => {
    // Emitted by Sprint 4 for the legacy fixture: format A5, landscape, support mat, finishes A+B.
    const v1 = `1.${Buffer.from(JSON.stringify({ f: 'A5', o: 'landscape', m: 'e2e-papier-mat', n: ['e2e-vernis-a', 'e2e-vernis-b'] }), 'utf8').toString('base64url')}`
    await page.goto(`/demande-de-devis?produit=${CONFIGURABLE_SLUG}&cfg=${v1}`)
    const labels = await recap(page).locator('dt').allTextContents()
    expect(labels).toEqual(['Produit', 'Format', 'Orientation', 'Support', 'Finition'])
    await expect(recap(page)).toContainText('A5')
    await expect(recap(page)).toContainText('E2E Vernis A, E2E Vernis B')
    // "Modifier" now emits the newest version.
    await expect(recap(page).getByRole('link', { name: 'Modifier ma configuration' })).toHaveAttribute('href', /cfg=2\./)

    await page.goto(`/produits/${CONFIGURABLE_SLUG}?cfg=${v1}`)
    await expect(page.getByRole('radio', { name: 'A5' })).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Paysage' })).toBeChecked()
  })

  test('an unknown-version payload is ignored, not reinterpreted', async ({ page }) => {
    const v3 = `3.${Buffer.from(JSON.stringify({ s: { format: 'A4' } }), 'utf8').toString('base64url')}`
    await page.goto(`/demande-de-devis?produit=${SCHEMA_CARD_SLUG}&cfg=${v3}`)
    await expect(recap(page).locator('dt')).toHaveCount(1)
    await expect(recap(page)).toContainText('E2E Schéma carte')
  })
})

test.describe('Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('typed controls stay usable with no horizontal scroll', async ({ page }) => {
    await page.goto(`/produits/${SCHEMA_LABEL_SLUG}`)
    await page.getByLabel('Dimensions : largeur').fill('50')
    await page.getByLabel('Dimensions : hauteur').fill('30')
    await group(page, 'Élastique').getByRole('checkbox').check()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(recap(page)).toContainText('50 × 30 mm')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})
