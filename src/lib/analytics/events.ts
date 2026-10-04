import type { ConfiguratorGroupKey } from '@/lib/configurator/types'

/**
 * The complete, typed vocabulary of conversion events. Properties are
 * deliberately coarse and non-personal: product slug, group keys, counts and
 * booleans. Never names, e-mails, phone numbers, comments, custom-format
 * dimensions, quote references or free text — there is no field in these
 * types that could carry them.
 */
export interface AnalyticsEventMap {
  product_viewed: {
    product_slug: string
    category_slug?: string
    has_configurator: boolean
    /** True when the page opened with a configuration restored from the URL. */
    restored_configuration: boolean
  }
  /** First *human* selection — auto-selected single options and restored state don't count. */
  configurator_started: {
    product_slug: string
    group_key: ConfiguratorGroupKey
  }
  configurator_option_selected: {
    product_slug: string
    group_key: ConfiguratorGroupKey
    /** Machine value of the option ("__custom__" for a custom format; never typed dimensions). */
    option_value: string
    action: 'selected' | 'deselected'
    selected_group_count: number
  }
  /** The visitor left the configurator through its "Obtenir mon devis" CTA. */
  configurator_completed: {
    product_slug: string
    selected_group_count: number
    group_count: number
  }
  quote_checkout_viewed: {
    has_product: boolean
    product_slug?: string
    has_configuration: boolean
    selected_group_count: number
  }
  /** Fired only after the server confirmed the submission. */
  quote_submitted: {
    has_product: boolean
    product_slug?: string
    has_configuration: boolean
    selected_group_count: number
    design_source: 'client' | 'printcom'
  }
}

export type AnalyticsEventName = keyof AnalyticsEventMap
export type AnalyticsEventProps<N extends AnalyticsEventName> = AnalyticsEventMap[N]
