import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { TechnologyCard } from '@/components/cards/TechnologyCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Technology } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Technologies',
  description: "Technologies d'impression confirmées et mises en œuvre par Printcom.",
}

export default async function TechnologiesArchivePage() {
  const payload = await getPayload()
  // Frontend only ever renders confirmed technologies (section 16).
  const result = await payload.find({
    collection: 'technologies',
    where: { status: { equals: 'published' }, verificationStatus: { equals: 'confirmed' } },
    limit: 100,
    sort: 'title',
  })

  const technologies = result.docs as Technology[]

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Technologies' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Technologies</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Les technologies présentées ici sont confirmées par l’équipe Printcom.
      </p>

      {technologies.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((technology) => (
            <TechnologyCard key={technology.id} technology={technology} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState
            title="Technologies en cours de vérification"
            description="Cette page sera publiée dès qu’une technologie sera confirmée par l’équipe Printcom."
          />
        </div>
      )}
    </Container>
  )
}
