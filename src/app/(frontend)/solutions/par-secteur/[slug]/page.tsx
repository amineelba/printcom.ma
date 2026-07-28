import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { CTAGroup } from '@/components/ui/CTAGroup'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { CategoryCard } from '@/components/cards/CategoryCard'
import type { ProductCategory, Faq } from '@/payload-types'

async function getSector(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'sectors',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const sector = await getSector(slug)
  if (!sector) return {}
  return { title: sector.seo?.metaTitle || sector.title, description: sector.seo?.metaDescription || sector.shortDescription || undefined }
}

export default async function SectorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sector = await getSector(slug)
  if (!sector) notFound()

  const categories = (sector.recommendedCategories ?? []).filter((c): c is ProductCategory => typeof c === 'object')
  const faqs = (sector.relatedFAQs ?? []).filter((f): f is Faq => typeof f === 'object')

  return (
    <>
      <Container width="wide" className="py-[var(--pc-space-section-small)]">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Solutions', href: '/solutions/par-besoin' }, { label: 'Par secteur', href: '/solutions/par-secteur' }, { label: sector.title }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="pc-text-page-title text-primary">{sector.title}</h1>
            {sector.shortDescription ? <p className="pc-text-intro mt-4">{sector.shortDescription}</p> : null}
            <p className="pc-text-body-small mt-4 text-tertiary">{sector.neutralPositioningNote}</p>
            <CTAGroup className="mt-8" items={[{ label: 'Demander un devis', href: '/demande-de-devis' }]} />
          </div>
          {sector.image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-large bg-alternate">
              <ResponsiveImage media={sector.image} fill sizes="(min-width: 1069px) 50vw, 100vw" priority />
            </div>
          ) : null}
        </div>
      </Container>

      {sector.challenges?.length || sector.printingNeeds?.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide" className="grid gap-10 md:grid-cols-2">
            {sector.challenges?.length ? (
              <div>
                <h2 className="pc-text-section-title text-primary">Enjeux</h2>
                <ul className="mt-6 flex flex-col gap-3">
                  {sector.challenges.map((item) => (
                    <li key={item.label} className="text-[1.0625rem] text-primary">{item.label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {sector.printingNeeds?.length ? (
              <div>
                <h2 className="pc-text-section-title text-primary">Besoins d’impression</h2>
                <ul className="mt-6 flex flex-col gap-3">
                  {sector.printingNeeds.map((item) => (
                    <li key={item.label} className="text-[1.0625rem] text-primary">{item.label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {categories.length ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Familles de produits recommandées</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {sector.constraints ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="reading">
            <h2 className="pc-text-section-title text-primary">Contraintes</h2>
            <p className="pc-text-intro mt-4">{sector.constraints}</p>
          </Container>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="reading">
            <h2 className="pc-text-section-title text-primary">Questions fréquentes</h2>
            <div className="mt-8">
              <FAQAccordion faqs={faqs} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
        <Container width="reading" className="text-center">
          <h2 className="pc-text-section-title text-primary">Parlons de votre secteur</h2>
          <div className="mt-8 flex justify-center">
            <CTAGroup items={[{ label: 'Demander un devis', href: '/demande-de-devis' }]} />
          </div>
        </Container>
      </section>
    </>
  )
}
