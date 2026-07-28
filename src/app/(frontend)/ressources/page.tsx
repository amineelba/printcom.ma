import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResourceCard } from '@/components/cards/ResourceCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Resource } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Ressources',
  description: 'Guides pratiques, conseils de préparation de fichiers et retours d’expérience Printcom.',
}

export default async function ResourcesArchivePage() {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'resources',
    where: { status: { equals: 'published' } },
    limit: 60,
    sort: '-publishDate',
  })

  const resources = result.docs as Resource[]

  return (
    <Container width="wide" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Ressources' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Ressources</h1>
      <p className="pc-text-intro mt-4 max-w-(--container-reading)">
        Guides pratiques et conseils pour préparer, choisir et déployer vos supports imprimés.
      </p>

      {resources.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Ressources en cours de publication" />
        </div>
      )}
    </Container>
  )
}
