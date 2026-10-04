import { afterEach, describe, expect, it, vi } from 'vitest'
import { ANALYTICS_DOM_EVENT, registerAnalyticsProvider, trackEvent } from '@/lib/analytics/track'

afterEach(() => vi.restoreAllMocks())

describe('analytics abstraction', () => {
  it('delivers typed events to registered providers and to the DOM', () => {
    const track = vi.fn()
    const unregister = registerAnalyticsProvider({ name: 'test', track })
    const listener = vi.fn()
    window.addEventListener(ANALYTICS_DOM_EVENT, listener)

    trackEvent('configurator_started', { product_slug: 'cartes', group_key: 'format' })

    expect(track).toHaveBeenCalledWith('configurator_started', { product_slug: 'cartes', group_key: 'format' })
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      name: 'configurator_started',
      props: { product_slug: 'cartes', group_key: 'format' },
    })

    unregister()
    trackEvent('configurator_started', { product_slug: 'cartes', group_key: 'format' })
    expect(track).toHaveBeenCalledTimes(1)
    window.removeEventListener(ANALYTICS_DOM_EVENT, listener)
  })

  it('drops undefined props and keeps only short primitives', () => {
    const track = vi.fn()
    const unregister = registerAnalyticsProvider({ name: 'test', track })
    trackEvent('product_viewed', {
      product_slug: 'x'.repeat(300),
      category_slug: undefined,
      has_configurator: true,
      restored_configuration: false,
    })
    const props = track.mock.calls[0][1] as Record<string, unknown>
    expect(props).not.toHaveProperty('category_slug')
    expect((props.product_slug as string).length).toBe(100)
    unregister()
  })

  it('never throws, even when a provider does', () => {
    const second = vi.fn()
    const off1 = registerAnalyticsProvider({
      name: 'broken',
      track: () => {
        throw new Error('boom')
      },
    })
    const off2 = registerAnalyticsProvider({ name: 'ok', track: second })
    expect(() =>
      trackEvent('quote_checkout_viewed', { has_product: false, has_configuration: false, selected_group_count: 0 }),
    ).not.toThrow()
    expect(second).toHaveBeenCalledTimes(1)
    off1()
    off2()
  })
})
