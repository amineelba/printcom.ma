import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { QuoteWizard } from '@/components/forms/QuoteWizard'

export const metadata: Metadata = {
  title: 'Demande de devis',
  description: 'Décrivez votre projet d’impression, Printcom vous répond avec un devis adapté.',
}

export default async function QuoteRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ produit?: string; support?: string; finition?: string }>
}) {
  const { produit, support, finition } = await searchParams
  const payload = await getPayload()

  const [products, categories, sectors, materials, finishes, resolvedProduct, resolvedMaterial, resolvedFinish] =
    await Promise.all([
      payload.find({ collection: 'products', where: { status: { equals: 'published' } }, limit: 300, depth: 0, sort: 'title' }),
      payload.find({ collection: 'product-categories', where: { status: { equals: 'published' } }, limit: 100, depth: 0, sort: 'title' }),
      payload.find({ collection: 'sectors', where: { status: { equals: 'published' } }, limit: 100, depth: 0, sort: 'title' }),
      payload.find({ collection: 'materials', where: { status: { equals: 'published' } }, limit: 200, depth: 0, sort: 'title' }),
      payload.find({ collection: 'finishes', where: { status: { equals: 'published' } }, limit: 200, depth: 0, sort: 'title' }),
      produit ? payload.find({ collection: 'products', where: { slug: { equals: produit } }, limit: 1, depth: 0 }) : null,
      support ? payload.find({ collection: 'materials', where: { slug: { equals: support } }, limit: 1, depth: 0 }) : null,
      finition ? payload.find({ collection: 'finishes', where: { slug: { equals: finition } }, limit: 1, depth: 0 }) : null,
    ])

  return (
    <Container width="reading" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Demande de devis' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Demande de devis</h1>
      <p className="pc-text-intro mt-4">
        Décrivez votre projet en quelques étapes. Notre équipe étudie votre demande et revient vers vous avec un
        devis adapté.
      </p>

      <div className="mt-12">
        <QuoteWizard
          options={{
            products: products.docs.map((p) => ({ id: String(p.id), label: p.title })),
            categories: categories.docs.map((c) => ({ id: String(c.id), label: c.title })),
            sectors: sectors.docs.map((s) => ({ id: String(s.id), label: s.title })),
            materials: materials.docs.map((m) => ({ id: String(m.id), label: m.title })),
            finishes: finishes.docs.map((f) => ({ id: String(f.id), label: f.title })),
          }}
          defaults={{
            desiredProduct: resolvedProduct?.docs[0] ? String(resolvedProduct.docs[0].id) : undefined,
            material: resolvedMaterial?.docs[0] ? String(resolvedMaterial.docs[0].id) : undefined,
            finish: resolvedFinish?.docs[0] ? String(resolvedFinish.docs[0].id) : undefined,
          }}
        />
      </div>
    </Container>
  )
}
