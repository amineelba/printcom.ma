import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ServiceCard } from '@/components/cards/ServiceCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Service } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Conseil, studio graphique, prépresse, production, façonnage et livraison.',
}

export default async function ServicesArchivePage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'services',
    where: { status: { equals: 'published' }, parent: { exists: false } },
    limit: 100,
    sort: 'order',
    depth: 0,
  })

  const services = result.docs as Service[]

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Services' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Services</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        De la préparation à la livraison, Printcom accompagne chaque étape de votre projet d’impression.
      </p>

      {services.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Services en cours de publication" description="Cette page sera complétée prochainement." />
        </div>
      )}
    </Container>
  )
}
