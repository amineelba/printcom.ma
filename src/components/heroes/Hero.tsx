import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CTAGroup, type CTAGroupItem } from '@/components/ui/CTAGroup'
import { Container } from '@/components/ui/Container'

export function Hero({
  eyebrow,
  title,
  description,
  ctas = [],
  media,
  tone = 'default',
}: {
  eyebrow?: string
  title: string
  description?: string
  ctas?: CTAGroupItem[]
  media?: ReactNode
  tone?: 'default' | 'alternate'
}) {
  return (
    <section className={`${tone === 'alternate' ? 'bg-alternate' : 'bg-canvas'} border-b border-(--pc-color-border-subtle)`}>
      <Container width="wide" className="grid min-h-[var(--pc-template-hero-min-height-small)] items-center gap-10 py-[var(--pc-space-16)] lg:min-h-[var(--pc-template-hero-min-height-large)] lg:grid-cols-2 lg:py-[var(--pc-space-24)]">
        <div className="max-w-(--pc-template-hero-copy-max-width)">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="pc-text-hero-display text-primary">{title}</h1>
          {description ? <p className="pc-text-intro mt-6">{description}</p> : null}
          {ctas.length ? <CTAGroup items={ctas} className="mt-8" /> : null}
        </div>
        {media ? <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-large lg:aspect-square">{media}</div> : null}
      </Container>
    </section>
  )
}
