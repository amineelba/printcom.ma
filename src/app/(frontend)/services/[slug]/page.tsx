import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { ProcessSteps } from '@/components/content/ProcessSteps'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { ProductCard } from '@/components/cards/ProductCard'
import { CTAGroup } from '@/components/ui/CTAGroup'
import type { Product, Faq } from '@/payload-types'

async function getService(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return {}
  return { title: service.seo?.metaTitle || service.title, description: service.seo?.metaDescription || service.shortDescription || undefined }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const relatedProducts = (service.relatedProducts ?? []).filter((p): p is Product => typeof p === 'object')
  const faqs = (service.relatedFAQs ?? []).filter((f): f is Faq => typeof f === 'object')
  const steps = (service.steps ?? []).map((s) => ({ title: s.title, description: s.description }))

  return (
    <>
      <Container width="wide" className="py-[var(--pc-space-section-small)]">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Services', href: '/services' }, { label: service.title }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="pc-text-page-title text-primary">{service.title}</h1>
            {service.shortDescription ? <p className="pc-text-intro mt-4">{service.shortDescription}</p> : null}
            <CTAGroup className="mt-8" items={[{ label: 'Demander un devis', href: '/demande-de-devis' }]} />
          </div>
          {service.image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-large bg-alternate">
              <ResponsiveImage media={service.image} fill sizes="(min-width: 1069px) 50vw, 100vw" priority />
            </div>
          ) : null}
        </div>
      </Container>

      {service.description ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="reading">
            <RichTextRenderer content={service.description} />
          </Container>
        </section>
      ) : null}

      {steps.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Étapes</h2>
            <div className="mt-10">
              <ProcessSteps steps={steps} />
            </div>
          </Container>
        </section>
      ) : null}

      {service.deliverables?.length ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="reading">
            <h2 className="pc-text-section-title text-primary">Livrables</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {service.deliverables.map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-[1.0625rem] text-primary">
                  <span aria-hidden="true" className="mt-1 text-link">✓</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Produits associés</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
          <h2 className="pc-text-section-title text-primary">Parlons de votre projet</h2>
          <div className="mt-8 flex justify-center">
            <CTAGroup items={[{ label: 'Demander un devis', href: '/demande-de-devis' }]} />
          </div>
        </Container>
      </section>
    </>
  )
}
