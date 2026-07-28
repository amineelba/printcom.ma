import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { CTAGroup } from '@/components/ui/CTAGroup'
import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import { SpecificationList } from '@/components/content/SpecificationList'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { ProductCard } from '@/components/cards/ProductCard'
import { ServiceCard } from '@/components/cards/ServiceCard'
import type {
  Product,
  ProductCategory,
  Material,
  Finish,
  Technology,
  Service,
  Faq,
} from '@/payload-types'

async function getProduct(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0] as Product | undefined
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  return {
    title: product.seo?.metaTitle || product.title,
    description: product.seo?.metaDescription || product.shortDescription,
    robots: product.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const category = product.primaryCategory as ProductCategory | number | null | undefined
  const materials = (product.materials ?? []).filter((m): m is Material => typeof m === 'object')
  const finishes = (product.finishes ?? []).filter((f): f is Finish => typeof f === 'object')
  const technologies = (product.recommendedTechnologies ?? []).filter(
    (t): t is Technology => typeof t === 'object' && t.verificationStatus === 'confirmed',
  )
  const relatedServices = (product.relatedServices ?? []).filter((s): s is Service => typeof s === 'object')
  const relatedProducts = (product.relatedProducts ?? []).filter((p): p is Product => typeof p === 'object')
  const faqs = (product.relatedFAQs ?? []).filter((f): f is Faq => typeof f === 'object')

  const specs = [
    product.availableFormats?.length
      ? { label: 'Formats disponibles', value: product.availableFormats.map((f) => f.label).join(', ') }
      : null,
    product.grammages?.length ? { label: 'Grammages', value: product.grammages.map((g) => g.label).join(', ') } : null,
    product.quantities?.length ? { label: 'Quantités', value: product.quantities.map((q) => q.label).join(', ') } : null,
    materials.length ? { label: 'Supports', value: materials.map((m) => m.title).join(', ') } : null,
    finishes.length ? { label: 'Finitions', value: finishes.map((f) => f.title).join(', ') } : null,
    technologies.length ? { label: 'Technologies', value: technologies.map((t) => t.title).join(', ') } : null,
    product.standardLeadTime ? { label: 'Délai indicatif', value: product.standardLeadTime } : null,
  ].filter((s): s is { label: string; value: string } => Boolean(s))

  const filePrepSpecs = [
    product.acceptedFileFormats?.length
      ? { label: 'Formats de fichiers acceptés', value: product.acceptedFileFormats.map((f) => f.label).join(', ') }
      : null,
    product.bleedRequirements ? { label: 'Fond perdu', value: product.bleedRequirements } : null,
    product.recommendedResolution ? { label: 'Résolution recommandée', value: product.recommendedResolution } : null,
    product.colorProfile ? { label: 'Profil colorimétrique', value: product.colorProfile } : null,
  ].filter((s): s is { label: string; value: string } => Boolean(s))

  return (
    <>
      <Container width="wide" className="py-[var(--pc-space-section-small)]">
        <Breadcrumbs
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Produits', href: '/produits' },
            ...(category && typeof category === 'object'
              ? [{ label: category.title, href: `/produits?categorie=${category.slug}` }]
              : []),
            { label: product.title },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-large bg-alternate">
            {product.primaryImage ? (
              <ResponsiveImage media={product.primaryImage} fill sizes="(min-width: 1069px) 50vw, 100vw" priority />
            ) : null}
          </div>
          <div>
            {category && typeof category === 'object' ? (
              <p className="pc-text-eyebrow">{category.title}</p>
            ) : null}
            <h1 className="pc-text-page-title text-primary">{product.title}</h1>
            <p className="pc-text-intro mt-4">{product.shortDescription}</p>
            <CTAGroup
              className="mt-8"
              items={[{ label: 'Demander un devis', href: `/demande-de-devis?produit=${product.slug}` }]}
            />
          </div>
        </div>
      </Container>

      {product.longDescription ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="reading">
            <RichTextRenderer content={product.longDescription} />
          </Container>
        </section>
      ) : null}

      {specs.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="standard">
            <h2 className="pc-text-section-title text-primary">Caractéristiques</h2>
            <div className="mt-8">
              <SpecificationList items={specs} />
            </div>
          </Container>
        </section>
      ) : null}

      {filePrepSpecs.length || product.filePreparationInstructions ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="standard">
            <h2 className="pc-text-section-title text-primary">Préparation des fichiers</h2>
            {filePrepSpecs.length ? (
              <div className="mt-8">
                <SpecificationList items={filePrepSpecs} />
              </div>
            ) : null}
            {product.filePreparationInstructions ? (
              <div className="mt-8">
                <RichTextRenderer content={product.filePreparationInstructions} />
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {relatedServices.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Services liés</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="border-t border-(--pc-color-border-subtle) py-[var(--pc-space-section-small)]">
          <Container width="wide">
            <h2 className="pc-text-section-title text-primary">Produits liés</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="border-t border-(--pc-color-border-subtle) bg-alternate py-[var(--pc-space-section-small)]">
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
          <h2 className="pc-text-section-title text-primary">Un projet {product.title.toLowerCase()} ?</h2>
          <p className="pc-text-intro mt-4">
            Décrivez votre besoin, nous établissons un devis adapté à votre production.
          </p>
          <div className="mt-8 flex justify-center">
            <CTAGroup items={[{ label: 'Demander un devis', href: `/demande-de-devis?produit=${product.slug}` }]} />
          </div>
        </Container>
      </section>
    </>
  )
}
