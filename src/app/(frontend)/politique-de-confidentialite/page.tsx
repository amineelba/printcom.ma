import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { EmptyState } from '@/components/feedback/EmptyState'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default async function PrivacyPolicyPage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'legal-documents',
    where: { slug: { equals: 'politique-de-confidentialite' }, status: { equals: 'published' } },
    limit: 1,
  })
  const document = result.docs[0]

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Politique de confidentialité' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">{document?.title || 'Politique de confidentialité'}</h1>
      {document ? (
        <div className="mt-8">
          <RichTextRenderer content={document.body} />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="Ce contenu est en cours de rédaction" description="Il sera publié prochainement par l’équipe Printcom." />
        </div>
      )}
    </Container>
  )
}
