/**
 * Renders a single JSON-LD <script> tag. Only Organization, LocalBusiness,
 * Service, Product, BreadcrumbList, FAQPage, Article, WebSite and WebPage
 * schemas are used anywhere in this app (section 26) — never fabricated
 * price/stock/review data.
 */
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...data }) }}
    />
  )
}
