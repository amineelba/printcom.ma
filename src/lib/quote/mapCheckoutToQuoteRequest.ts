import type { QuoteRequest } from '@/payload-types'
import type { QuoteCheckoutData } from '@/lib/validation/quote'
import { parseExplicitCount } from '@/lib/configurator/safeCount'
import type { ResolvedQuoteContext } from './resolveQuoteContext'

export type QuoteRequestCreateData = Omit<QuoteRequest, 'id' | 'updatedAt' | 'createdAt'>

type QuoteConfiguration = NonNullable<QuoteRequest['configuration']>

/**
 * Canonical product configuration → the quote's existing `configuration`
 * group (see docs/quote-workflow.md for the mapping table). Selected labels
 * are stored as text snapshots so the lead stays truthful if the CMS options
 * change later; relationships keep their ids. Counts are numeric only when
 * the label explicitly is one — the label itself is always kept alongside.
 */
function mapConfiguration(context: ResolvedQuoteContext): QuoteConfiguration {
  const selections = context.configuration?.selections
  if (!selections) {
    // No product / no canonical configuration: legacy material/finish only.
    return {
      material: context.material?.id,
      finish: context.finish ? [context.finish.id] : undefined,
    }
  }

  return {
    format: selections.format,
    customFormatWidth: selections.customFormat?.width,
    customFormatHeight: selections.customFormat?.height,
    customFormatUnit: selections.customFormat?.unit,
    orientation: selections.orientation as QuoteConfiguration['orientation'],
    pageCount: parseExplicitCount(selections.pageCount),
    pageCountLabel: selections.pageCount,
    printSides: selections.printSides as QuoteConfiguration['printSides'],
    color: selections.colorMode,
    material: selections.material?.id,
    grammage: selections.grammage,
    finish: selections.finishes.length ? selections.finishes.map((finish) => finish.id) : undefined,
    quantity: parseExplicitCount(selections.quantity),
    quantityLabel: selections.quantity,
    // Product-specific dimensions (anything beyond the core fields above),
    // snapshotted with their French labels in schema order.
    technicalSelections: selections.technical.length
      ? selections.technical.map((entry) => ({
          key: entry.key,
          label: entry.label,
          valueLabel: entry.valueLabel,
          valueLabels: entry.valueLabels,
          numericValue: entry.numericValue,
          unit: entry.unit,
        }))
      : undefined,
  }
}

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
    configuration: mapConfiguration(context),
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
