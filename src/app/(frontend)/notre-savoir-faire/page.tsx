import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ServiceCard } from '@/components/cards/ServiceCard'
import { TechnologyCard } from '@/components/cards/TechnologyCard'
import { CTAGroup } from '@/components/ui/CTAGroup'
import type { Service, Technology } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Notre savoir-faire',
  description: 'Du conseil à la livraison, les étapes et technologies confirmées mobilisées par Printcom.',
}

export default async function ExpertisePage() {
  const payload = await getPayload()
  const [services, technologies] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { status: { equals: 'published' }, parent: { exists: false } },
      limit: 6,
      sort: 'order',
    }),
    payload.find({
      collection: 'technologies',
      where: { status: { equals: 'published' }, verificationStatus: { equals: 'confirmed' } },
      limit: 6,
    }),
  ])

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Notre savoir-faire' }]} />
      <h1 className="pc-text-page-title mt-4 max-w-(--container-reading) text-primary">Notre savoir-faire</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Printcom structure chaque projet en étapes claires : conseil, création, prépresse, production,
        façonnage et livraison.
      </p>

      {services.docs.length ? (
        <div className="mt-12">
          <h2 className="pc-text-section-title text-primary">Nos étapes</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(services.docs as Service[]).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      ) : null}

      {technologies.docs.length ? (
        <div className="mt-16">
          <h2 className="pc-text-section-title text-primary">Technologies confirmées</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(technologies.docs as Technology[]).map((technology) => (
              <TechnologyCard key={technology.id} technology={technology} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-14">
        <CTAGroup items={[{ label: 'Demander un devis', href: '/demande-de-devis' }]} />
      </div>
    </Container>
  )
}
