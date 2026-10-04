'use client'

import { trackEvent } from '@/lib/analytics/track'
import { useTrackOnce } from './useTrackOnce'

/** Renders nothing; fires `product_viewed` once for a product page view. */
export function TrackProductView({
  productSlug,
  categorySlug,
  hasConfigurator,
  restoredConfiguration,
}: {
  productSlug: string
  categorySlug?: string
  hasConfigurator: boolean
  restoredConfiguration: boolean
}) {
  useTrackOnce(() =>
    trackEvent('product_viewed', {
      product_slug: productSlug,
      category_slug: categorySlug,
      has_configurator: hasConfigurator,
      restored_configuration: restoredConfiguration,
    }),
  )
  return null
}
