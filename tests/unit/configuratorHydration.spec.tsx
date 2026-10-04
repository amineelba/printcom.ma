import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { ProductConfigurator } from '@/components/configurator/ProductConfigurator'
import { TrackProductView } from '@/components/analytics/TrackProductView'
import { TrackQuoteCheckoutView } from '@/components/analytics/TrackQuoteCheckoutView'
import { buildProductConfiguratorData } from '@/lib/configurator/buildProductConfiguratorData'
import { resolveProductConfiguration } from '@/lib/configurator/resolveConfiguration'
import { parseConfigurationTransport, serializeConfiguration } from '@/lib/configurator/transport'
import { createInitialConfigurationState } from '@/lib/configurator/state'
import { ANALYTICS_DOM_EVENT } from '@/lib/analytics/track'
import { makeFullProduct, makeVisualProduct } from './helpers/configuratorFixtures'
import type { Product } from '@/payload-types'

type Captured = { name: string; props: Record<string, unknown> }
let events: Captured[] = []
const listener = (event: Event) => events.push((event as CustomEvent).detail)

beforeEach(() => {
  events = []
  window.addEventListener(ANALYTICS_DOM_EVENT, listener)
})
afterEach(() => {
  window.removeEventListener(ANALYTICS_DOM_EVENT, listener)
  cleanup()
})

const group = (name: string) => screen.getByRole('group', { name })
const names = () => events.map((event) => event.name)

function restore(product: Product, wire: Parameters<typeof serializeConfiguration>[0]) {
  const resolved = resolveProductConfiguration({
    product,
    transport: parseConfigurationTransport(serializeConfiguration(wire)),
  })
  return resolved.state
}

function renderWith(product: Product, initialState?: ReturnType<typeof restore>, strict = false) {
  const ui = (
    <ProductConfigurator
      data={buildProductConfiguratorData(product)}
      initialState={initialState}
      intro={<h1>{product.title}</h1>}
    />
  )
  return render(strict ? <StrictMode>{ui}</StrictMode> : ui)
}

describe('ProductConfigurator — restored state', () => {
  const product = makeFullProduct()
  const state = restore(product, {
    single: { format: 'A5', orientation: 'landscape', material: 'offset', quantity: '500' },
    multiple: { finish: ['soft-touch', 'vernis-uv'] },
    customFormat: { width: '', height: '', unit: 'mm' },
  })

  it('checks the restored options, including multiple finishes', () => {
    renderWith(product, state)
    expect((within(group('Format')).getByRole('radio', { name: 'A5' }) as HTMLInputElement).checked).toBe(true)
    expect((within(group('Orientation')).getByRole('radio', { name: 'Paysage' }) as HTMLInputElement).checked).toBe(true)
    expect((within(group('Support')).getByRole('radio', { name: 'Offset' }) as HTMLInputElement).checked).toBe(true)
    expect((within(group('Finition')).getByRole('checkbox', { name: 'Soft Touch' }) as HTMLInputElement).checked).toBe(true)
    expect((within(group('Finition')).getByRole('checkbox', { name: 'Vernis UV' }) as HTMLInputElement).checked).toBe(true)
  })

  it('drives the summary from the restored state', () => {
    renderWith(product, state)
    const summary = screen.getByText('Votre configuration').closest('section, div')!.parentElement!
    expect(summary.textContent).toContain('A5')
    expect(summary.textContent).toContain('Soft Touch, Vernis UV')
  })

  it('serializes the restored state back into the CTA — an exact round trip', () => {
    renderWith(product, state)
    const href = screen.getByRole('link', { name: 'Obtenir mon devis' }).getAttribute('href')!
    const cfg = new URL(href, 'http://x').searchParams.get('cfg')
    expect(cfg).toBe(serializeConfiguration(state))
  })

  it('restores the custom format with its dimensions', () => {
    const customState = restore(product, {
      single: { format: '__custom__' },
      multiple: {},
      customFormat: { width: '85', height: '55', unit: 'cm' },
    })
    renderWith(product, customState)
    expect((screen.getByLabelText('Largeur') as HTMLInputElement).value).toBe('85')
    expect((screen.getByLabelText('Hauteur') as HTMLInputElement).value).toBe('55')
    expect((screen.getByLabelText('Unité') as HTMLSelectElement).value).toBe('cm')
  })

  it('feeds the Sprint 3 preview resolver with the restored selection', () => {
    const visual = makeVisualProduct()
    const visualState = restore(visual, {
      single: { format: 'A4' },
      multiple: {},
      customFormat: { width: '', height: '', unit: 'mm' },
    })
    renderWith(visual, visualState)
    expect(screen.getAllByRole('img').some((img) => img.getAttribute('alt') === 'Aperçu A4')).toBe(true)
  })

  it('without initial state, behaves exactly like before (singleton auto-select only)', () => {
    renderWith(product)
    expect((within(group('Nombre de pages')).getByRole('radio') as HTMLInputElement).checked).toBe(true)
    expect((within(group('Format')).getByRole('radio', { name: 'A4' }) as HTMLInputElement).checked).toBe(false)
    expect(createInitialConfigurationState(buildProductConfiguratorData(product)).single.pageCount).toBe('4 pages')
  })
})

describe('ProductConfigurator — instrumentation', () => {
  const product = makeFullProduct()

  it('fires nothing on mount or for restored/auto-selected state', () => {
    const state = restore(product, {
      single: { format: 'A4' },
      multiple: {},
      customFormat: { width: '', height: '', unit: 'mm' },
    })
    renderWith(product, state, true)
    expect(events).toEqual([])
  })

  it('fires configurator_started once, then option_selected for each choice', () => {
    renderWith(product)
    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'A4' }))
    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'A5' }))
    expect(names()).toEqual([
      'configurator_started',
      'configurator_option_selected',
      'configurator_option_selected',
    ])
    expect(events[0].props).toEqual({ product_slug: 'cartes-de-visite', group_key: 'format' })
    expect(events[2].props).toMatchObject({ group_key: 'format', option_value: 'A5', action: 'selected' })
  })

  it('reports multi-select deselection and the running selected-group count', () => {
    renderWith(product)
    const soft = within(group('Finition')).getByRole('checkbox', { name: 'Soft Touch' })
    fireEvent.click(soft)
    fireEvent.click(soft)
    const selected = events.filter((event) => event.name === 'configurator_option_selected')
    expect(selected.map((event) => event.props.action)).toEqual(['selected', 'deselected'])
    // "Nombre de pages" is auto-selected (singleton) so it counts toward the summary.
    expect(selected[0].props.selected_group_count).toBe(2)
    expect(selected[1].props.selected_group_count).toBe(1)
  })

  it('never puts typed custom-format dimensions in an event', () => {
    renderWith(product)
    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'Sur mesure' }))
    fireEvent.change(screen.getByLabelText('Largeur'), { target: { value: '85' } })
    expect(JSON.stringify(events)).not.toContain('85')
    expect(events.at(-1)?.props.option_value).toBe('__custom__')
  })

  it('fires configurator_completed when the CTA is used', () => {
    renderWith(product)
    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'A4' }))
    events = []
    const cta = screen.getByRole('link', { name: 'Obtenir mon devis' })
    cta.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(cta)
    expect(events).toEqual([
      {
        name: 'configurator_completed',
        props: { product_slug: 'cartes-de-visite', selected_group_count: 2, group_count: 9 },
      },
    ])
  })
})

describe('view events — once per view, StrictMode-safe', () => {
  it('product_viewed fires once under StrictMode and carries no personal data', () => {
    render(
      <StrictMode>
        <TrackProductView productSlug="cartes" categorySlug="papeterie" hasConfigurator restoredConfiguration={false} />
      </StrictMode>,
    )
    expect(events).toEqual([
      {
        name: 'product_viewed',
        props: {
          product_slug: 'cartes',
          category_slug: 'papeterie',
          has_configurator: true,
          restored_configuration: false,
        },
      },
    ])
  })

  it('quote_checkout_viewed fires once under StrictMode', () => {
    render(
      <StrictMode>
        <TrackQuoteCheckoutView productSlug="cartes" selectedGroupCount={3} />
      </StrictMode>,
    )
    expect(events).toEqual([
      {
        name: 'quote_checkout_viewed',
        props: { has_product: true, product_slug: 'cartes', has_configuration: true, selected_group_count: 3 },
      },
    ])
  })
})
