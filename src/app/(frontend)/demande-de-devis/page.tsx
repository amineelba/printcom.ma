import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { QuoteCheckout } from '@/components/forms/QuoteCheckout'
import type { QuoteRequestSummaryItem } from '@/components/forms/QuoteRequestSummary'
import { TrackQuoteCheckoutView } from '@/components/analytics/TrackQuoteCheckoutView'
import { buildProductConfigurationHref } from '@/lib/configurator/transport'
import { resolveQuoteContext } from '@/lib/quote/resolveQuoteContext'

export const metadata: Metadata = {
  title: 'Demande de devis',
  description: 'Quelques informations suffisent. Notre équipe vous contacte ensuite pour finaliser votre demande.',
}

type SearchParam = string | string[] | undefined
const first = (value: SearchParam) => (Array.isArray(value) ? value[0] : value)

export default async function QuoteRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ produit?: SearchParam; support?: SearchParam; finition?: SearchParam; cfg?: SearchParam }>
}) {
  const params = await searchParams
  const payload = await getPayload()

  // Query params prefill the summary only — the visitor is never asked to
  // pick anything again. Everything is canonicalized server-side against the
  // published product: unknown/unpublished slugs resolve to nothing, and a
  // tampered or stale `cfg` keeps only the values the product really offers.
  const { product, material, finish, configuration } = await resolveQuoteContext(payload, {
    productSlug: first(params.produit),
    materialSlug: first(params.support),
    finishSlug: first(params.finition),
    configurationTransport: first(params.cfg),
  })

  const summaryItems: QuoteRequestSummaryItem[] = configuration
    ? [
        ...(product ? [{ label: 'Produit', value: product.title }] : []),
        ...configuration.rows.map(({ label, value }) => ({ label, value })),
      ]
    : [
        material ? { label: 'Support', value: material.title } : null,
        finish ? { label: 'Finition', value: finish.title } : null,
      ].filter((item): item is QuoteRequestSummaryItem => item !== null)
  const selectedGroupCount = configuration?.rows.length ?? 0

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Demande de devis' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Demande de devis</h1>
      <p className="pc-text-intro mt-4">
        Quelques informations suffisent. Notre équipe vous contacte ensuite pour finaliser votre demande.
      </p>

      <TrackQuoteCheckoutView productSlug={product?.slug} selectedGroupCount={selectedGroupCount} />

      <div className="mt-10">
        <QuoteCheckout
          summaryItems={summaryItems}
          selectedGroupCount={selectedGroupCount}
          editHref={product ? buildProductConfigurationHref(product.slug, configuration?.transport) : undefined}
          productContext={
            product ? { productSlug: product.slug, configurationTransport: configuration?.transport } : undefined
          }
          context={product ? undefined : { materialSlug: material?.slug, finishSlug: finish?.slug }}
        />
      </div>
    </Container>
  )
}
