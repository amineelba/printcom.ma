import { Container } from '@/components/ui/Container'
import { CTAGroup } from '@/components/ui/CTAGroup'

export const metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <Container width="reading" className="py-[var(--pc-space-section)] text-center">
      <p className="pc-text-eyebrow">Erreur 404</p>
      <h1 className="pc-text-page-title mt-2 text-primary">Cette page est introuvable.</h1>
      <p className="pc-text-intro mt-4">
        Le contenu que vous cherchez a peut-être été déplacé ou n’existe plus.
      </p>
      <div className="mt-8 flex justify-center">
        <CTAGroup
          items={[
            { label: 'Retour à l’accueil', href: '/' },
            { label: 'Explorer les produits', href: '/produits', variant: 'secondary' },
          ]}
        />
      </div>
    </Container>
  )
}
