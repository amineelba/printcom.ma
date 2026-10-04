import type { ConfigurationSummaryRow } from '@/lib/configurator/types'

/**
 * "Votre configuration" — product name plus the values the visitor has
 * actually chosen. Unselected groups produce no row, no placeholder.
 * `aria-live` so a screen-reader user hears the recap change as they choose.
 */
export function ConfiguratorSummary({ productTitle, rows }: { productTitle: string; rows: ConfigurationSummaryRow[] }) {
  return (
    <section aria-labelledby="configurator-summary-title" aria-live="polite" className="rounded-card border border-border-subtle bg-alternate p-6">
      <h2 id="configurator-summary-title" className="text-[1.0625rem] font-semibold text-primary">
        Votre configuration
      </h2>
      <p className="mt-2 text-[0.9375rem] font-medium text-primary">{productTitle}</p>
      {rows.length ? (
        <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
          {rows.map((row) => (
            <div key={row.key} className="contents">
              <dt className="pc-text-body-small text-secondary">{row.label}</dt>
              <dd className="text-[0.9375rem] text-primary">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
