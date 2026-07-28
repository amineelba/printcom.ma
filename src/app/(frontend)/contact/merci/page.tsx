import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CTAGroup } from '@/components/ui/CTAGroup'

export const metadata: Metadata = { title: 'Message envoyé', robots: { index: false, follow: false } }

export default function ContactThankYouPage() {
  return (
    <Container width="reading" className="py-[var(--pc-space-section)] text-center">
      <p className="pc-text-eyebrow">Message envoyé</p>
      <h1 className="pc-text-page-title mt-2 text-primary">Merci, votre message a bien été reçu.</h1>
      <p className="pc-text-intro mt-4">
        Notre équipe vous répondra dans les meilleurs délais, à l’adresse ou au numéro que vous avez indiqué.
      </p>
      <div className="mt-8 flex justify-center">
        <CTAGroup items={[{ label: 'Retour à l’accueil', href: '/' }]} />
      </div>
    </Container>
  )
}
