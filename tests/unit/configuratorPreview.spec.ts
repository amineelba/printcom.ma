import { describe, it, expect } from 'vitest'
import { buildProductConfiguratorData } from '@/lib/configurator/buildProductConfiguratorData'
import { resolvePreviewMedia, PREVIEW_PRIORITY } from '@/lib/configurator/preview'
import { createInitialConfigurationState, selectSingleOption, toggleMultipleOption } from '@/lib/configurator/state'
import { CONFIGURATOR_GROUP_KEYS, CUSTOM_FORMAT_VALUE, type ConfiguratorGroup, type ConfiguratorMedia } from '@/lib/configurator/types'
import { makeVisualProduct } from './helpers/configuratorFixtures'

const data = buildProductConfiguratorData(makeVisualProduct())
const base: ConfiguratorMedia = { id: 'base', url: '/media/base.jpg', alt: 'Produit de base' }
const initial = createInitialConfigurationState(data)
const resolve = (selection = initial, groups: ConfiguratorGroup[] = data.groups) =>
  resolvePreviewMedia({ baseMedia: base, groups, selection })

describe('resolvePreviewMedia', () => {
  it('returns the base preview when no selected option has a preview image', () => {
    expect(resolve()).toEqual({ media: base, source: 'base' })
  })

  it('a format preview overrides the base preview', () => {
    const r = resolve(selectSingleOption(initial, 'format', 'A4'))
    expect(r.source).toBe('option')
    expect(r.media?.id).toBe('62')
  })

  it('an option with a thumbnail but no preview does NOT override the preview', () => {
    expect(resolve(selectSingleOption(initial, 'format', 'A5'))).toEqual({ media: base, source: 'base' })
  })

  it('an option with a preview but no thumbnail still overrides', () => {
    expect(resolve(selectSingleOption(initial, 'format', 'A6')).media?.id).toBe('64')
  })

  it('picks one deterministic winner by priority when several selections have previews', () => {
    // format outranks grammage in PREVIEW_PRIORITY, whichever was chosen first.
    const formatFirst = selectSingleOption(selectSingleOption(initial, 'format', 'A4'), 'grammage', '300 g')
    const gramFirst = selectSingleOption(selectSingleOption(initial, 'grammage', '300 g'), 'format', 'A4')
    expect(resolve(formatFirst).media?.id).toBe('62')
    expect(resolve(gramFirst).media?.id).toBe('62')
  })

  it('falls through to the next preview when the winner is deselected', () => {
    let state = selectSingleOption(selectSingleOption(initial, 'format', 'A4'), 'grammage', '300 g')
    expect(resolve(state).media?.id).toBe('62')
    state = selectSingleOption(state, 'format', 'A3') // no preview
    expect(resolve(state).media?.id).toBe('66')
  })

  it('returns to the base preview once every override is gone', () => {
    let state = selectSingleOption(initial, 'format', 'A4')
    state = selectSingleOption(state, 'format', 'A3')
    expect(resolve(state)).toEqual({ media: base, source: 'base' })
  })

  it('switching to a custom format never leaves a stale standard-format preview', () => {
    let state = selectSingleOption(initial, 'format', 'A4')
    expect(resolve(state).media?.id).toBe('62')
    state = selectSingleOption(state, 'format', CUSTOM_FORMAT_VALUE)
    expect(resolve(state)).toEqual({ media: base, source: 'base' })
  })

  it('does not depend on the order of groups in the data', () => {
    const state = selectSingleOption(selectSingleOption(initial, 'format', 'A4'), 'grammage', '300 g')
    expect(resolve(state, [...data.groups].reverse()).media?.id).toBe('62')
  })

  it('multiple finishes: the first selected finish (CMS order) with a preview wins, not click order', () => {
    const withFinishPreviews = data.groups.map((g): ConfiguratorGroup =>
      g.key === 'finish'
        ? {
            ...g,
            options: g.options.map((o, i) => ({ ...o, previewImage: { id: `fin-${i}`, url: `/media/fin-${i}.jpg` } })),
          }
        : g,
    )
    const finish = withFinishPreviews.find((g) => g.key === 'finish')!
    let state = toggleMultipleOption(initial, finish, 'vernis-uv')
    state = toggleMultipleOption(state, finish, 'soft-touch')
    expect(resolve(state, withFinishPreviews).media?.id).toBe('fin-0') // Soft Touch is first in CMS order
    state = toggleMultipleOption(state, finish, 'soft-touch')
    expect(resolve(state, withFinishPreviews).media?.id).toBe('fin-1')
  })

  it('shows nothing (not a broken state) when there is neither an override nor a base image', () => {
    expect(resolvePreviewMedia({ baseMedia: undefined, groups: data.groups, selection: initial })).toEqual({
      media: undefined,
      source: 'base',
    })
  })

  it('documents a fixed priority covering every group exactly once', () => {
    expect([...PREVIEW_PRIORITY].sort()).toEqual([...CONFIGURATOR_GROUP_KEYS].sort())
    expect(PREVIEW_PRIORITY[0]).toBe('finish')
    expect(PREVIEW_PRIORITY.indexOf('format')).toBeLessThan(PREVIEW_PRIORITY.indexOf('grammage'))
  })
})
