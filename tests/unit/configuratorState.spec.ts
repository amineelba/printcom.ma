import { describe, it, expect } from 'vitest'
import { buildProductConfiguratorData } from '@/lib/configurator/buildProductConfiguratorData'
import {
  buildConfigurationSummary,
  buildQuoteHref,
  createInitialConfigurationState,
  selectSingleOption,
  toggleMultipleOption,
  updateCustomFormat,
} from '@/lib/configurator/state'
import { CUSTOM_FORMAT_VALUE } from '@/lib/configurator/types'
import { makeFinish, makeFullProduct, makeProduct } from './helpers/configuratorFixtures'

describe('initial configuration state', () => {
  it('selects a group that has exactly one option', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    const state = createInitialConfigurationState(data)
    expect(state.single['page-count']).toBe('4 pages') // the fixture's only page-count option
  })

  it('does not choose for the visitor when a group has several options', () => {
    const data = buildProductConfiguratorData(makeFullProduct())
    const state = createInitialConfigurationState(data)
    for (const key of ['format', 'orientation', 'print-sides', 'color-mode', 'material', 'grammage', 'quantity'] as const) {
      expect(state.single[key]).toBeUndefined()
    }
    expect(state.multiple.finish).toBeUndefined()
  })

  it('preselects a single multi-choice option as selected', () => {
    const data = buildProductConfiguratorData(makeProduct({ finishes: [makeFinish(41, 'Soft Touch')] }))
    expect(createInitialConfigurationState(data).multiple.finish).toEqual(['soft-touch'])
  })

  it('starts with an empty custom format in millimetres', () => {
    const state = createInitialConfigurationState(buildProductConfiguratorData(makeProduct()))
    expect(state.customFormat).toEqual({ width: '', height: '', unit: 'mm' })
  })
})

describe('selection semantics', () => {
  const data = buildProductConfiguratorData(makeFullProduct())
  const initial = createInitialConfigurationState(data)

  it('single choice: selecting an option replaces the previous one', () => {
    let state = selectSingleOption(initial, 'format', 'A4')
    state = selectSingleOption(state, 'format', 'A5')
    expect(state.single.format).toBe('A5')
  })

  it('does not mutate the previous state', () => {
    selectSingleOption(initial, 'orientation', 'portrait')
    expect(initial.single.orientation).toBeUndefined()
  })

  it('finishes are multiple: options accumulate and toggle off', () => {
    const finish = data.groups.find((g) => g.key === 'finish')!
    let state = toggleMultipleOption(initial, finish, 'vernis-uv')
    state = toggleMultipleOption(state, finish, 'soft-touch')
    expect(state.multiple.finish).toEqual(['soft-touch', 'vernis-uv']) // CMS order, not click order
    state = toggleMultipleOption(state, finish, 'soft-touch')
    expect(state.multiple.finish).toEqual(['vernis-uv'])
  })

  it('selecting "Sur mesure" replaces a standard format (mutually exclusive)', () => {
    let state = selectSingleOption(initial, 'format', 'A4')
    state = selectSingleOption(state, 'format', CUSTOM_FORMAT_VALUE)
    expect(state.single.format).toBe(CUSTOM_FORMAT_VALUE)
    state = selectSingleOption(state, 'format', 'A5')
    expect(state.single.format).toBe('A5')
  })
})

describe('configuration summary', () => {
  const data = buildProductConfiguratorData(makeFullProduct())
  const initial = createInitialConfigurationState(data)

  it('shows only the singleton default when nothing else is chosen', () => {
    expect(buildConfigurationSummary(data, initial)).toEqual([{ key: 'page-count', label: 'Nombre de pages', value: '4 pages' }])
  })

  it('shows selected labels (not machine values), in group order, hiding unselected rows', () => {
    let state = selectSingleOption(initial, 'quantity', '500')
    state = selectSingleOption(state, 'orientation', 'landscape')
    state = selectSingleOption(state, 'print-sides', 'double')
    state = selectSingleOption(state, 'color-mode', 'cmyk')
    state = selectSingleOption(state, 'material', 'couché-mat')
    state = toggleMultipleOption(state, data.groups.find((g) => g.key === 'finish')!, 'soft-touch')
    const rows = buildConfigurationSummary(data, state)
    expect(rows.map((r) => [r.label, r.value])).toEqual([
      ['Orientation', 'Paysage'],
      ['Nombre de pages', '4 pages'],
      ['Impression', 'Recto-verso'],
      ['Couleur', 'Quadrichromie (CMJN)'],
      ['Support', 'Couché mat'],
      ['Finition', 'Soft Touch'],
      ['Quantité', '500'],
    ])
    expect(rows.find((r) => r.label === 'Format')).toBeUndefined()
    expect(rows.find((r) => r.label === 'Grammage')).toBeUndefined()
  })

  it('joins several finishes', () => {
    const finish = data.groups.find((g) => g.key === 'finish')!
    const state = toggleMultipleOption(toggleMultipleOption(initial, finish, 'soft-touch'), finish, 'vernis-uv')
    expect(buildConfigurationSummary(data, state).find((r) => r.key === 'finish')?.value).toBe('Soft Touch, Vernis UV')
  })

  it('never renders placeholders', () => {
    const text = JSON.stringify(buildConfigurationSummary(data, initial))
    expect(text).not.toMatch(/N\/A|Non renseigné|À confirmer|undefined/)
  })

  it('formats custom dimensions with the chosen unit', () => {
    let state = selectSingleOption(initial, 'format', CUSTOM_FORMAT_VALUE)
    const format = () => buildConfigurationSummary(data, state).find((r) => r.key === 'format')?.value
    expect(format()).toBe('Sur mesure')
    state = updateCustomFormat(state, { width: '120' })
    expect(format()).toBe('Sur mesure — largeur 120 mm')
    state = updateCustomFormat(state, { height: '80', unit: 'cm' })
    expect(format()).toBe('120 × 80 cm')
  })

  it('ignores stale custom dimensions once a standard format is chosen', () => {
    let state = updateCustomFormat(initial, { width: '120', height: '80' })
    state = selectSingleOption(state, 'format', 'A4')
    expect(buildConfigurationSummary(data, state).find((r) => r.key === 'format')?.value).toBe('A4')
  })

  it('has no rows for a product without configuration', () => {
    const empty = buildProductConfiguratorData(makeProduct())
    expect(buildConfigurationSummary(empty, createInitialConfigurationState(empty))).toEqual([])
  })
})

describe('quote link', () => {
  it('carries the product slug only', () => {
    expect(buildQuoteHref('cartes-de-visite')).toBe('/demande-de-devis?produit=cartes-de-visite')
  })
})
