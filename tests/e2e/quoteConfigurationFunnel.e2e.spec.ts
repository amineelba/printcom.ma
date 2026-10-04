import { test, expect, type Page } from '@playwright/test'
import {
  BARE_SLUG,
  CONFIGURABLE_SLUG,
  createConfiguratorFixtures,
  findQuoteByReference,
  fixtureDocId,
  removeConfiguratorFixtures,
  removeQuotesByReference,
} from '../helpers/configuratorFixture'
import { serializeConfiguration } from '../../src/lib/configurator/transport'
import type { ProductConfigurationState } from '../../src/lib/configurator/types'

test.describe.configure({ mode: 'serial' })

const references: string[] = []

test.beforeAll(async () => {
  await createConfiguratorFixtures()
})

test.afterAll(async () => {
  await removeQuotesByReference(references)
  await removeConfiguratorFixtures()
})

// The submit action rate-limits per IP (3/min). Each test presents its own address so the
// funnel tests (several real submissions) never trip the limiter of the shared dev server.
let ipSeed = Math.floor(Math.random() * 200) + 20
test.beforeEach(async ({ page }) => {
  ipSeed += 1
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `198.51.100.${ipSeed % 250}` })
})

type AnalyticsEvent = { name: string; props: Record<string, unknown> }

/** Records every `printcom:analytics` DOM event in sessionStorage so it survives navigation. */
async function recordAnalytics(page: Page) {
  await page.addInitScript(() => {
    window.addEventListener('printcom:analytics', (event) => {
      const list = JSON.parse(sessionStorage.getItem('pc-events') || '[]')
      list.push((event as CustomEvent).detail)
      sessionStorage.setItem('pc-events', JSON.stringify(list))
    })
  })
}
const readEvents = (page: Page) =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem('pc-events') || '[]') as AnalyticsEvent[])

const state = (partial: Partial<ProductConfigurationState>): ProductConfigurationState => ({
  single: {},
  multiple: {},
  customFormat: { width: '', height: '', unit: 'mm' },
  ...partial,
})
const checkoutUrl = (slug: string, transport?: string, extra = '') =>
  `/demande-de-devis?produit=${slug}${transport ? `&cfg=${transport}` : ''}${extra}`

const summary = (page: Page) => page.getByRole('region', { name: 'Votre demande' })

async function fillAndSubmit(page: Page) {
  await page.getByLabel('Nom complet').fill('Amine E2E')
  await page.getByLabel('Téléphone').fill('+212600000000')
  await page.getByLabel('E-mail').fill('e2e-funnel@example.com')
  // Click the visible card (the input itself is sr-only and can sit under the sticky header after scrolling).
  await page.locator('label[for="designSource-printcom"]').click()
  await expect(page.getByRole('radio', { name: 'Printcom réalise le design' })).toBeChecked()
  await page.getByLabel('J’accepte', { exact: false }).check()
  await page.getByRole('button', { name: 'Obtenir mon devis' }).click()
  await expect(page).toHaveURL(/\/demande-de-devis\/merci\?reference=PC-DEVIS-\d{4}-\d{6}/)
  const reference = new URL(page.url()).searchParams.get('reference')!
  references.push(reference)
  return reference
}

test.describe('Configurator → quote checkout funnel', () => {
  test('configure, review, edit, submit — and the lead keeps the configuration', async ({ page }) => {
    await recordAnalytics(page)
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)

    await page.getByRole('radio', { name: 'A5' }).check({ force: true })
    await page.getByRole('radio', { name: 'Paysage' }).check({ force: true })
    await page.getByRole('radio', { name: 'Recto-verso' }).check({ force: true })
    await page.getByRole('radio', { name: 'E2E Papier mat' }).check({ force: true })
    await page.getByRole('radio', { name: '350 g' }).check({ force: true })
    await page.getByRole('checkbox', { name: 'E2E Vernis A' }).check({ force: true })
    await page.getByRole('checkbox', { name: 'E2E Vernis B' }).check({ force: true })
    await page.getByRole('radio', { name: '500 ex.' }).check({ force: true })

    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(page).toHaveURL(/\/demande-de-devis\?produit=e2e-produit-configurable&cfg=1\./)

    // Server-rendered canonical summary: French labels, selected rows only, no machine values.
    const recap = summary(page)
    await expect(recap).toContainText('E2E Produit configurable')
    for (const text of ['A5', 'Paysage', 'Recto-verso', 'E2E Papier mat', '350 g', 'E2E Vernis A, E2E Vernis B', '500 ex.']) {
      await expect(recap).toContainText(text)
    }
    await expect(recap).not.toContainText(/landscape|double|undefined|null|NaN|__custom__|e2e-papier-mat/)
    await expect(recap).not.toContainText('Couleur') // never chosen → no row
    // Checkout stays contact-only.
    await expect(page.getByRole('radio', { name: 'A5' })).toHaveCount(0)
    await expect(page.locator('input[type="file"]')).toHaveCount(0)

    // "Modifier" returns to the product with everything restored.
    await recap.getByRole('link', { name: 'Modifier ma configuration' }).click()
    await expect(page).toHaveURL(new RegExp(`/produits/${CONFIGURABLE_SLUG}\\?cfg=1\\.`))
    await expect(page.getByRole('radio', { name: 'A5' })).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Paysage' })).toBeChecked()
    await expect(page.getByRole('radio', { name: 'E2E Papier mat' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'E2E Vernis A' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'E2E Vernis B' })).toBeChecked()
    await expect(page.getByRole('region', { name: 'Votre configuration' })).toContainText('E2E Vernis A, E2E Vernis B')

    // Change one thing and go back to checkout: the edit is carried over, the rest untouched.
    await page.getByRole('radio', { name: 'Sur devis' }).check({ force: true })
    await page.getByRole('checkbox', { name: 'E2E Vernis B' }).uncheck({ force: true })
    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(summary(page)).toContainText('Sur devis')
    await expect(summary(page)).toContainText('E2E Vernis A')
    await expect(summary(page)).not.toContainText('E2E Vernis B')

    const reference = await fillAndSubmit(page)

    const quote = await findQuoteByReference(reference)
    expect(quote.configuration).toMatchObject({
      format: 'A5',
      orientation: 'landscape',
      printSides: 'double',
      grammage: '350 g',
      quantityLabel: 'Sur devis',
    })
    expect(quote.configuration?.quantity).toBeFalsy()
    expect(quote.configuration?.material).toBe(await fixtureDocId('materials', 'e2e-papier-mat'))
    expect(quote.configuration?.finish).toEqual([await fixtureDocId('finishes', 'e2e-vernis-a')])
    expect(quote.need.requestType).toBe('product-printing')
    expect(quote.need.desiredProduct).toBeTruthy()

    // Analytics: each view once, started once, submitted exactly once after success, nothing personal.
    const events = await readEvents(page)
    const count = (name: string) => events.filter((event) => event.name === name).length
    expect(count('product_viewed')).toBe(2) // initial visit + restored visit (two page views)
    expect(events.filter((e) => e.name === 'product_viewed').map((e) => e.props.restored_configuration)).toEqual([false, true])
    expect(count('configurator_started')).toBe(2) // once per view: first visit, then the restored (edited) visit
    expect(count('configurator_completed')).toBe(2)
    expect(count('quote_checkout_viewed')).toBe(2)
    expect(count('quote_submitted')).toBe(1)
    expect(events.at(-1)?.name).toBe('quote_submitted')
    const serialized = JSON.stringify(events)
    expect(serialized).not.toMatch(/Amine|e2e-funnel|212600000000|PC-DEVIS/)
    const submitted = events.find((e) => e.name === 'quote_submitted')!
    expect(submitted.props).toMatchObject({ has_product: true, has_configuration: true, design_source: 'printcom' })
  })

  test('a product-only request shows the product and persists only the relationship', async ({ page }) => {
    await page.goto(checkoutUrl(BARE_SLUG))
    await expect(summary(page)).toContainText('E2E Produit sans configuration')
    await expect(summary(page).getByRole('link', { name: 'Modifier ma configuration' })).toHaveAttribute(
      'href',
      `/produits/${BARE_SLUG}`,
    )
    const reference = await fillAndSubmit(page)
    const quote = await findQuoteByReference(reference)
    expect(quote.need.desiredProduct).toBeTruthy()
    expect(quote.configuration?.format).toBeFalsy()
  })

  test('a generic quote without product has no summary and no "Modifier" link', async ({ page }) => {
    await page.goto('/demande-de-devis')
    await expect(summary(page)).toHaveCount(0)
    await expect(page.getByRole('link', { name: /Modifier/ })).toHaveCount(0)
    const reference = await fillAndSubmit(page)
    const quote = await findQuoteByReference(reference)
    expect(quote.need.requestType).toBe('other')
    expect(quote.need.desiredProduct).toBeFalsy()
  })

  test('legacy ?support= and ?finition= links keep working and are normalized', async ({ page }) => {
    await page.goto(checkoutUrl(CONFIGURABLE_SLUG, undefined, '&support=e2e-papier-brillant&finition=e2e-vernis-b'))
    await expect(summary(page)).toContainText('E2E Papier brillant')
    await expect(summary(page)).toContainText('E2E Vernis B')
    // "Modifier" now carries the normalized, canonical transport.
    await expect(summary(page).getByRole('link', { name: 'Modifier ma configuration' })).toHaveAttribute('href', /\?cfg=1\./)
  })
})

test.describe('Tampered or stale links fail closed', () => {
  test('checkout drops foreign, stale and unoffered values and keeps the valid ones', async ({ page }) => {
    const forged = serializeConfiguration(
      state({
        single: { format: 'A3', material: 'e2e-papier-image', orientation: 'portrait', printSides: 'double' },
        multiple: { finish: ['finition-etrangere', 'e2e-vernis-b'] },
      }),
    )!
    await page.goto(checkoutUrl(CONFIGURABLE_SLUG, forged))
    await expect(summary(page)).toContainText('Portrait')
    await expect(summary(page)).toContainText('Recto-verso')
    await expect(summary(page)).toContainText('E2E Vernis B')
    await expect(summary(page)).not.toContainText(/A3|E2E Papier image|étrangère/)
  })

  test('a malformed or unknown-version payload degrades to the product alone', async ({ page }) => {
    for (const bad of ['garbage', '2.e30', '1.%%%']) {
      await page.goto(checkoutUrl(CONFIGURABLE_SLUG, bad))
      await expect(summary(page)).toContainText('E2E Produit configurable')
      await expect(summary(page).locator('dt')).toHaveCount(1)
      await page.goto(`/produits/${CONFIGURABLE_SLUG}?cfg=${bad}`)
      await expect(page.locator('h1')).toHaveText('E2E Produit configurable')
      await expect(page.getByRole('radio', { name: 'A5' })).not.toBeChecked()
    }
  })

  test('an unknown or draft product yields no summary and no edit link', async ({ page }) => {
    const transport = serializeConfiguration(state({ single: { format: 'A4' } }))
    for (const slug of ['produit-qui-nexiste-pas']) {
      await page.goto(checkoutUrl(slug, transport))
      await expect(summary(page)).toHaveCount(0)
      await expect(page.getByRole('link', { name: /Modifier/ })).toHaveCount(0)
    }
  })

  test('the product page restores only valid values from a forged link', async ({ page }) => {
    const forged = serializeConfiguration(
      state({ single: { format: 'A4', material: 'e2e-papier-image' }, multiple: { finish: ['inconnue'] } }),
    )!
    await page.goto(`/produits/${CONFIGURABLE_SLUG}?cfg=${forged}`)
    await expect(page.getByRole('radio', { name: 'A4' })).toBeChecked()
    await expect(page.getByRole('region', { name: 'Votre configuration' })).not.toContainText('E2E Papier image')
  })

  test('a custom format round-trips with its dimensions', async ({ page }) => {
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    await page.getByRole('radio', { name: 'Sur mesure' }).check({ force: true })
    await page.getByLabel('Largeur').fill('85,5')
    await page.getByLabel('Hauteur').fill('55')
    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()
    await expect(summary(page)).toContainText('85.5 × 55 mm')
    await summary(page).getByRole('link', { name: 'Modifier ma configuration' }).click()
    await expect(page.getByLabel('Largeur')).toHaveValue('85.5')
    await expect(page.getByLabel('Hauteur')).toHaveValue('55')
  })
})

test.describe('Instrumentation boundaries', () => {
  test('category archives never fire product_viewed', async ({ page }) => {
    await recordAnalytics(page)
    await page.goto('/produits/packaging')
    await expect(page.locator('h1')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    expect(await readEvents(page)).toEqual([])
  })

  test('a failed validation never emits quote_submitted', async ({ page }) => {
    await recordAnalytics(page)
    await page.goto(checkoutUrl(CONFIGURABLE_SLUG))
    await page.getByRole('button', { name: 'Obtenir mon devis' }).click()
    await expect(page.locator('#fullName-error')).toBeVisible()
    const names = (await readEvents(page)).map((event) => event.name)
    expect(names).toEqual(['quote_checkout_viewed'])
  })

  test('selecting nothing and leaving fires only the view event', async ({ page }) => {
    await recordAnalytics(page)
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    await expect(page.locator('h1')).toBeVisible()
    // The event fires on hydration, after the server-rendered h1 is already visible.
    await expect.poll(async () => (await readEvents(page)).map((event) => event.name)).toEqual(['product_viewed'])
    await page.waitForTimeout(500)
    expect((await readEvents(page)).map((event) => event.name)).toEqual(['product_viewed'])
  })
})

test.describe('Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('configure → checkout → Modifier works on a phone with no horizontal scroll', async ({ page }) => {
    await page.goto(`/produits/${CONFIGURABLE_SLUG}`)
    await page.getByRole('radio', { name: 'A5' }).check({ force: true })
    await page.getByRole('checkbox', { name: 'E2E Vernis A' }).check({ force: true })
    await page.getByRole('link', { name: 'Obtenir mon devis' }).first().click()

    await expect(summary(page)).toContainText('A5')
    const edit = summary(page).getByRole('link', { name: 'Modifier ma configuration' })
    await expect(edit).toBeVisible()
    const box = await edit.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await edit.click()
    await expect(page.getByRole('radio', { name: 'A5' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'E2E Vernis A' })).toBeChecked()
  })
})
