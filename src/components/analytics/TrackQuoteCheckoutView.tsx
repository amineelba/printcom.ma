'use client'

import { trackEvent } from '@/lib/analytics/track'
import { useTrackOnce } from './useTrackOnce'

/** Renders nothing; fires `quote_checkout_viewed` once per checkout view. */
export function TrackQuoteCheckoutView({
  productSlug,
  selectedGroupCount,
}: {
  productSlug?: string
  selectedGroupCount: number
}) {
  useTrackOnce(() =>
    trackEvent('quote_checkout_viewed', {
      has_product: Boolean(productSlug),
      product_slug: productSlug,
      has_configuration: selectedGroupCount > 0,
      selected_group_count: selectedGroupCount,
    }),
  )
  return null
}
