import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from '@/lib/payload/client'
import { Container } from '@/components/ui/Container'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'

export const metadata: Metadata = { title: 'Plan du site' }

async function getLinks() {
  const payload = await getPayload()
  const [categories, services, solutions, sectors, resources] = await Promise.all([
    payload.find({ collection: 'product-categories', where: { status: { equals: 'published' } }, limit: 200, depth: 0 }),
    payload.find({ collection: 'services', where: { status: { equals: 'published' } }, limit: 200, depth: 0 }),
    payload.find({ collection: 'solutions', where: { status: { equals: 'published' } }, limit: 200, depth: 0 }),
    payload.find({ collection: 'sectors', where: { status: { equals: 'published' } }, limit: 200, depth: 0 }),
    payload.find({ collection: 'resources', where: { status: { equals: 'published' } }, limit: 200, depth: 0 }),
  ])
  return { categories, services, solutions, sectors, resources }
}

const STATIC_PAGES = [
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/produits' },
  { label: 'Services', href: '/services' },
  { label: 'Solutions par besoin', href: '/solutions/par-besoin' },
  { label: 'Solutions par secteur', href: '/solutions/par-secteur' },
  { label: 'Technologies', href: '/technologies' },
  { label: 'Supports', href: '/supports' },
  { label: 'Finitions', href: '/finitions' },
  { label: 'Ressources', href: '/ressources' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Notre savoir-faire', href: '/notre-savoir-faire' },
  { label: 'Qualité et engagements', href: '/qualite-et-engagements' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Demander un devis', href: '/demande-de-devis' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
  { label: 'Politique des cookies', href: '/politique-des-cookies' },
]

export default async function SitemapPage() {
  const { categories, services, solutions, sectors, resources } = await getLinks()

  const sections = [
    { title: 'Pages principales', items: STATIC_PAGES },
    {
      title: 'Familles de produits',
      items: categories.docs.map((c) => ({ label: c.title, href: `/produits/${c.slug}` })),
    },
    { title: 'Services', items: services.docs.map((s) => ({ label: s.title, href: `/services/${s.slug}` })) },
    { title: 'Solutions', items: solutions.docs.map((s) => ({ label: s.title, href: `/solutions/${s.slug}` })) },
    { title: 'Secteurs', items: sectors.docs.map((s) => ({ label: s.title, href: `/solutions/par-secteur/${s.slug}` })) },
    { title: 'Ressources', items: resources.docs.map((r) => ({ label: r.title, href: `/ressources/${r.slug}` })) },
  ].filter((section) => section.items.length > 0)

  return (
    <Container width="standard" className="py-[var(--pc-space-section-small)]">
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Plan du site' }]} />
      <h1 className="pc-text-page-title mt-4 text-primary">Plan du site</h1>
      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="pc-text-footnote mb-4 font-semibold uppercase tracking-wide text-tertiary">{section.title}</h2>
            <ul className="flex flex-col gap-2">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[0.9375rem] text-secondary hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Container>
  )
}
