import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { CTAGroup } from '@/components/ui/CTAGroup'
import type { Material } from '@/payload-types'

async function getMaterial(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'materials',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  return result.docs[0] as Material | undefined
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const material = await getMaterial(slug)
  if (!material) return {}
  return { title: material.seo?.metaTitle || material.title, description: material.seo?.metaDescription || material.shortDescription }
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const material = await getMaterial(slug)
  if (!material) notFound()

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Supports', href: '/supports' }, { label: material.title }]} />
      {material.image ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card-large bg-alternate">
          <ResponsiveImage media={material.image} fill sizes="(min-width: 1069px) 60vw, 100vw" />
        </div>
      ) : null}
      <h1 className="pc-text-page-title mt-8 text-primary">{material.title}</h1>
      {material.shortDescription ? <p className="pc-text-intro mt-4">{material.shortDescription}</p> : null}
      <div className="mt-8 flex justify-start">
        <CTAGroup items={[{ label: 'Demander un devis', href: `/demande-de-devis?support=${material.slug}` }]} />
      </div>
    </Container>
  )
}
