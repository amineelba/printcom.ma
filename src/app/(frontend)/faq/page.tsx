import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Faq } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description: 'Réponses aux questions les plus fréquentes sur les devis, la production, les fichiers et la livraison.',
}

const CATEGORY_LABELS: Record<string, string> = {
  quote: 'Devis et commande',
  production: 'Production',
  files: 'Fichiers et prépresse',
  delivery: 'Livraison',
  general: 'Général',
}

export default async function FAQPage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'faqs',
    where: { status: { equals: 'published' } },
    limit: 200,
    sort: 'order',
  })

  const faqs = result.docs as Faq[]
  const grouped = faqs.reduce<Record<string, Faq[]>>((acc, faq) => {
    const category = faq.category || 'general'
    acc[category] = acc[category] ? [...acc[category], faq] : [faq]
    return acc
  }, {})

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'FAQ' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Questions fréquentes</h1>

      {faqs.length ? (
        <div className="mt-12 flex flex-col gap-12">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="pc-text-section-title text-primary">{CATEGORY_LABELS[category] || category}</h2>
              <div className="mt-6">
                <FAQAccordion faqs={items} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Questions fréquentes en cours de publication" />
        </div>
      )}
    </Container>
  )
}
