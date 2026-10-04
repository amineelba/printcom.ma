import Link from 'next/link'

export interface QuoteRequestSummaryItem {
  label: string
  value: string
}

/**
 * "Votre demande" — read-only recap of what the visitor is asking a quote
 * for. Takes a plain label/value list so richer configuration (format,
 * quantity, ...) can be appended later without touching this component.
 * Renders nothing when there is nothing to show: no empty rows, no filler.
 * `editHref` is the real way back to the configurator with the same
 * configuration restored; omitted when there is no valid product to return to.
 */
export function QuoteRequestSummary({
  items,
  editHref,
}: {
  items: QuoteRequestSummaryItem[]
  editHref?: string
}) {
  if (!items.length) return null

  return (
    <section aria-labelledby="quote-summary-title" className="rounded-card border border-border-subtle bg-alternate p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 id="quote-summary-title" className="text-[1.0625rem] font-semibold text-primary">
          Votre demande
        </h2>
        {editHref ? (
          <Link
            href={editHref}
            aria-label="Modifier ma configuration"
            className="inline-flex min-h-(--pc-touch-target-min) items-center text-[0.9375rem] font-medium text-action hover:underline"
          >
            Modifier
          </Link>
        ) : null}
      </div>
      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-[max-content_1fr]">
        {items.map((item) => (
          <div key={item.label} className="contents">
            <dt className="pc-text-body-small text-secondary">{item.label}</dt>
            <dd className="text-[0.9375rem] font-medium text-primary">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
