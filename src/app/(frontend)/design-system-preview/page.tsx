import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { FAQAccordion } from '@/components/content/FAQAccordion'
import { TextInput, TextArea, Select } from '@/components/forms/inputs'
import { FormField } from '@/components/forms/FormField'
import type { Faq } from '@/payload-types'

export const metadata: Metadata = { title: 'Design system preview', robots: { index: false, follow: false } }

const COLOR_SWATCHES: { label: string; varName: string }[] = [
  { label: 'gray-50', varName: '--pc-color-gray-50' },
  { label: 'gray-100', varName: '--pc-color-gray-100' },
  { label: 'gray-200', varName: '--pc-color-gray-200' },
  { label: 'gray-400', varName: '--pc-color-gray-400' },
  { label: 'gray-600', varName: '--pc-color-gray-600' },
  { label: 'gray-900', varName: '--pc-color-gray-900' },
  { label: 'brand-500', varName: '--pc-color-brand-500' },
  { label: 'brand-600', varName: '--pc-color-brand-600' },
  { label: 'success', varName: '--pc-color-success' },
  { label: 'warning', varName: '--pc-color-warning' },
  { label: 'error', varName: '--pc-color-error' },
]

const SPACE_TOKENS = ['--pc-space-2', '--pc-space-4', '--pc-space-6', '--pc-space-8', '--pc-space-12', '--pc-space-16', '--pc-space-24']
const RADIUS_TOKENS = ['--pc-radius-xs', '--pc-radius-sm', '--pc-radius-md', '--pc-radius-lg', '--pc-radius-xl', '--pc-radius-2xl', '--pc-radius-full']

const DEMO_FAQS: Faq[] = [
  {
    id: 1,
    question: 'Ceci est une question de démonstration ?',
    answer: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Ceci est une réponse de démonstration pour tester l’accordéon.', version: 1 }],
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    status: 'published',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
]

/**
 * Internal-only visual regression reference (section 35). Statically
 * unreachable in a production build since NODE_ENV is resolved at build
 * time — `next build` always sets it to "production", so this branch is
 * dead code (and therefore absent) in the shipped bundle.
 */
export default function DesignSystemPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <Container width="wide" className="flex flex-col gap-16 py-16">
      <div>
        <h1 className="pc-text-page-title text-primary">Design system preview</h1>
        <p className="pc-text-intro mt-4">Référence interne de développement — non indexée, absente en production.</p>
      </div>

      <section>
        <h2 className="pc-text-section-title text-primary">Couleurs</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.varName} className="flex flex-col gap-2">
              <div className="h-16 rounded-card-small border border-border-subtle" style={{ background: `var(${swatch.varName})` }} />
              <p className="pc-text-footnote">{swatch.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="pc-text-section-title text-primary">Typographie</h2>
        <div className="mt-6 flex flex-col gap-4">
          <p className="pc-text-hero-display text-primary">Hero display</p>
          <p className="pc-text-page-title text-primary">Page title</p>
          <p className="pc-text-section-title text-primary">Section title</p>
          <p className="pc-text-intro text-primary">Intro text — proposition concise sur deux lignes maximum.</p>
          <p className="text-[1.0625rem] text-primary">Body text — paragraphe standard du site.</p>
          <p className="pc-text-body-small text-secondary">Body small — légendes et méta-informations.</p>
          <p className="pc-text-footnote">Footnote — mentions légales et notes de bas de page.</p>
        </div>
      </section>

      <section>
        <h2 className="pc-text-section-title text-primary">Espacement</h2>
        <div className="mt-6 flex flex-col gap-2">
          {SPACE_TOKENS.map((token) => (
            <div key={token} className="flex items-center gap-4">
              <span className="pc-text-footnote w-32">{token}</span>
              <div className="bg-action" style={{ width: `var(${token})`, height: '1rem' }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="pc-text-section-title text-primary">Rayons</h2>
        <div className="mt-6 flex flex-wrap gap-4">
          {RADIUS_TOKENS.map((token) => (
            <div key={token} className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 border border-border-default bg-alternate" style={{ borderRadius: `var(${token})` }} />
              <p className="pc-text-footnote">{token}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="pc-text-section-title text-primary">Boutons</h2>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="text">Text link ›</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section>
        <h2 className="pc-text-section-title text-primary">Champs de formulaire</h2>
        <div className="mt-6 grid max-w-(--container-reading) gap-6">
          <FormField label="Champ texte" htmlFor="ds-text">
            <TextInput id="ds-text" placeholder="Exemple" />
          </FormField>
          <FormField label="Champ en erreur" htmlFor="ds-error" error="Message d’erreur de démonstration.">
            <TextInput id="ds-error" invalid />
          </FormField>
          <FormField label="Zone de texte" htmlFor="ds-textarea">
            <TextArea id="ds-textarea" rows={3} />
          </FormField>
          <FormField label="Sélecteur" htmlFor="ds-select">
            <Select id="ds-select">
              <option>Option A</option>
              <option>Option B</option>
            </Select>
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="pc-text-section-title text-primary">Accordéon</h2>
        <div className="mt-6 max-w-(--container-reading)">
          <FAQAccordion faqs={DEMO_FAQS} />
        </div>
      </section>
    </Container>
  )
}
