import type { QuoteRequest } from '@/payload-types'
import type { QuoteCheckoutData } from '@/lib/validation/quote'
import type { ResolvedQuoteContext } from './resolveQuoteContext'

export type QuoteRequestCreateData = Omit<QuoteRequest, 'id' | 'updatedAt' | 'createdAt'>

/**
 * Normalizes the short public checkout into the persisted quote-request
 * structure. The collection keeps its historical groups (need/configuration/
 * productionAndDelivery/files/contact) because the sales team, the PDF export
 * and the future product configurator all read them — fields the checkout no
 * longer asks for are simply left empty, never filled with invented values.
 */
export function mapCheckoutToQuoteRequest(
  reference: string,
  data: QuoteCheckoutData,
  context: ResolvedQuoteContext,
  now: Date = new Date(),
): QuoteRequestCreateData {
  return {
    reference,
    need: {
      // `requestType` is a required select in the collection; the checkout
      // doesn't ask for it, so derive it from what is actually known.
      requestType: context.product ? 'product-printing' : 'other',
      desiredProduct: context.product?.id,
    },
    configuration: {
      material: context.material?.id,
      finish: context.finish ? [context.finish.id] : undefined,
    },
    files: {
      designSource: data.designSource,
      // Legacy flag kept consistent with designSource for the admin/PDF views
      // that predate it. filesReady / needsFileCheck are NOT inferred.
      needsGraphicDesign: data.designSource === 'printcom',
    },
    contact: {
      company: data.company,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      comments: data.comments,
      consentConfirmed: true,
      consentTimestamp: now.toISOString(),
    },
    workflow: {
      status: 'new',
      priority: 'normal',
      source: 'website-quote-form',
    },
  }
}
