import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { CTAGroup } from '@/components/ui/CTAGroup'
import { ResourceCard } from '@/components/cards/ResourceCard'
import type { Resource } from '@/payload-types'

async function getResource(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'resources',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) return {}
  return { title: resource.seo?.metaTitle || resource.title, description: resource.seo?.metaDescription || resource.introduction }
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) notFound()

  const related = (resource.relatedResources ?? []).filter((r): r is Resource => typeof r === 'object')

  return (
    <>
      <Container width="reading" className="py-[var(--pc-space-section-small)]">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Ressources', href: '/ressources' }, { label: resource.title }]} />
        <h1 className="pc-text-page-title mt-6 text-primary">{resource.title}</h1>
        <p className="pc-text-intro mt-4">{resource.introduction}</p>
        {resource.coverImage ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card-large bg-alternate">
            <ResponsiveImage media={resource.coverImage} fill sizes="(min-width: 1069px) 60vw, 100vw" priority />
          </div>
        ) : null}
        <div className="mt-10">
          <RichTextRenderer content={resource.body} />
        </div>
        {resource.downloadFile && typeof resource.downloadFile === 'object' && resource.downloadFile.url ? (
          <div className="mt-8">
            <CTAGroup items={[{ label: 'Télécharger le document', href: resource.downloadFile.url, variant: 'secondary' }]} />
          </div>
        ) : null}
      </Container>

      {related.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">À lire aussi</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ResourceCard key={item.id} resource={item} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
        <Container width="reading" className="text-center">
          <h2 className="pc-text-section-title text-primary">Un projet à concrétiser ?</h2>
          <div className="mt-8 flex justify-center">
            <CTAGroup items={[{ label: 'Demander un devis', href: '/demande-de-devis' }]} />
          </div>
        </Container>
      </section>
    </>
  )
}
