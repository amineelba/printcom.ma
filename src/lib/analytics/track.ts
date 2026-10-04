import type { AnalyticsEventMap, AnalyticsEventName, AnalyticsEventProps } from './events'

/**
 * Provider-neutral analytics seam. No third-party dependency: a provider is
 * any object with `track`. Until one is registered (a later, deliberate
 * decision — consent, vendor), events only surface as a DOM `CustomEvent`
 * that nothing listens to in production.
 *
 * Tracking must never affect the experience: it is a no-op on the server and
 * every provider call is isolated in try/catch.
 */
export interface AnalyticsProvider {
  name: string
  track: (name: AnalyticsEventName, props: Record<string, string | number | boolean>) => void
}

/** DOM event dispatched on `window` for every tracked event (tests, tag managers). */
export const ANALYTICS_DOM_EVENT = 'printcom:analytics'

const providers = new Set<AnalyticsProvider>()

export function registerAnalyticsProvider(provider: AnalyticsProvider): () => void {
  providers.add(provider)
  return () => providers.delete(provider)
}

const MAX_STRING_LENGTH = 100

/** Defence in depth: only short primitives ever leave this module. */
function sanitize(props: object): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') clean[key] = value.slice(0, MAX_STRING_LENGTH)
    else if (typeof value === 'number' && Number.isFinite(value)) clean[key] = value
    else if (typeof value === 'boolean') clean[key] = value
  }
  return clean
}

export function trackEvent<N extends AnalyticsEventName>(name: N, props: AnalyticsEventProps<N>): void {
  if (typeof window === 'undefined') return
  const clean = sanitize(props)

  for (const provider of providers) {
    try {
      provider.track(name, clean)
    } catch {
      // A failing provider must never break the page.
    }
  }

  try {
    window.dispatchEvent(new CustomEvent(ANALYTICS_DOM_EVENT, { detail: { name, props: clean } }))
  } catch {
    // Ignore.
  }
}

export type { AnalyticsEventMap, AnalyticsEventName, AnalyticsEventProps }
