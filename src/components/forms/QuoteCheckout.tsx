'use client'

import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { quoteCheckoutSchema, type DesignSource, type QuoteCheckoutInput } from '@/lib/validation/quote'
import { trackEvent } from '@/lib/analytics/track'
import { submitQuoteRequest } from '@/app/(frontend)/demande-de-devis/actions'
import { FormField } from './FormField'
import { FormErrorSummary } from './FormErrorSummary'
import { ConsentField } from './ConsentField'
import { DesignSourceSelector } from './DesignSourceSelector'
import { QuoteRequestSummary, type QuoteRequestSummaryItem } from './QuoteRequestSummary'
import { TextInput, TextArea } from './inputs'
import { Button } from '@/components/ui/Button'

export type QuoteCheckoutContext = NonNullable<QuoteCheckoutInput['context']>
export type QuoteCheckoutProductContext = NonNullable<QuoteCheckoutInput['productContext']>

interface CheckoutState {
  fullName: string
  company: string
  phone: string
  email: string
  designSource?: DesignSource
  comments: string
  consentConfirmed: boolean
}

/** First focusable element of each field, in page order — used to focus the first error. */
const FIELD_FOCUS_ORDER: { key: keyof CheckoutState; elementId: string }[] = [
  { key: 'fullName', elementId: 'fullName' },
  { key: 'company', elementId: 'company' },
  { key: 'phone', elementId: 'phone' },
  { key: 'email', elementId: 'email' },
  { key: 'designSource', elementId: 'designSource-client' },
  { key: 'comments', elementId: 'comments' },
  { key: 'consentConfirmed', elementId: 'consentConfirmed' },
]

/**
 * Single-scroll quote checkout (Sprint 1). Replaces the former 6-step
 * wizard: no stepper, no next/back, no recap step. Collects only identity,
 * who provides the design, an optional comment and consent — everything else
 * is clarified by Printcom during follow-up.
 */
export function QuoteCheckout({
  summaryItems,
  editHref,
  context,
  productContext,
  selectedGroupCount = 0,
}: {
  summaryItems: QuoteRequestSummaryItem[]
  /** "Modifier" target — the product page with the configuration restored. */
  editHref?: string
  /** Legacy catalogue slugs (no product); re-validated server-side. */
  context?: QuoteCheckoutContext
  /** Product + canonical configuration transport; re-canonicalized server-side. */
  productContext?: QuoteCheckoutProductContext
  /** Count of selected configuration groups — analytics only. */
  selectedGroupCount?: number
}) {
  const router = useRouter()
  const [state, setState] = useState<CheckoutState>({
    fullName: '',
    company: '',
    phone: '',
    email: '',
    comments: '',
    consentConfirmed: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const submittingRef = useRef(false)
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

  const update = <K extends keyof CheckoutState>(key: K, value: CheckoutState[K]) =>
    setState((current) => ({ ...current, [key]: value }))

  const focusFirstError = (nextErrors: Record<string, string>) => {
    const first = FIELD_FOCUS_ORDER.find(({ key }) => nextErrors[key])
    if (first) document.getElementById(first.elementId)?.focus()
  }

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Ref guard: state updates are async, a fast double-click could otherwise
    // slip a second submit through before `isSubmitting` re-renders.
    if (submittingRef.current) return

    const input: QuoteCheckoutInput = {
      fullName: state.fullName,
      company: state.company,
      phone: state.phone,
      email: state.email,
      // Absent until the visitor picks one; the schema reports it as required.
      designSource: state.designSource as DesignSource,
      comments: state.comments,
      consentConfirmed: state.consentConfirmed as true,
      context,
      productContext,
      honeypot: (new FormData(event.currentTarget).get('website') as string | null) ?? '',
      idempotencyKey,
    }

    const parsed = quoteCheckoutSchema.safeParse(input)
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) nextErrors[issue.path.join('.')] ??= issue.message
      setErrors(nextErrors)
      setSubmitError(undefined)
      focusFirstError(nextErrors)
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setErrors({})
    setSubmitError(undefined)

    try {
      const result = await submitQuoteRequest(input)

      if (result.status === 'success' && result.reference) {
        // Only now: the server has confirmed the lead exists. No PII.
        trackEvent('quote_submitted', {
          has_product: Boolean(productContext?.productSlug),
          product_slug: productContext?.productSlug,
          has_configuration: selectedGroupCount > 0,
          selected_group_count: selectedGroupCount,
          design_source: parsed.data.designSource,
        })
        router.push(`/demande-de-devis/merci?reference=${encodeURIComponent(result.reference)}`)
        return
      }

      if (result.errors) {
        setErrors(result.errors)
        focusFirstError(result.errors)
      }
      setSubmitError(result.message || (result.errors ? undefined : 'Une erreur est survenue. Merci de réessayer.'))
    } catch {
      setSubmitError('Une erreur est survenue. Merci de réessayer.')
    }
    submittingRef.current = false
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10" aria-busy={isSubmitting}>
      <QuoteRequestSummary items={summaryItems} editHref={editHref} />

      <FormErrorSummary errors={errors} />
      {submitError ? (
        <p role="alert" className="pc-text-body-small text-error">
          {submitError}
        </p>
      ) : null}

      {/* Honeypot: invisible to people and assistive tech, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <section aria-labelledby="contact-title" className="flex flex-col gap-6">
        <h2 id="contact-title" className="text-[1.0625rem] font-semibold text-primary">
          Vos coordonnées
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Nom complet" htmlFor="fullName" required error={errors['fullName']}>
            <TextInput
              id="fullName"
              name="fullName"
              autoComplete="name"
              aria-required="true"
              aria-describedby={describedBy('fullName')}
              invalid={Boolean(errors['fullName'])}
              value={state.fullName}
              onChange={(e) => update('fullName', e.target.value)}
            />
          </FormField>
          <FormField label="Entreprise" htmlFor="company" error={errors['company']}>
            <TextInput
              id="company"
              name="company"
              autoComplete="organization"
              aria-describedby={describedBy('company')}
              invalid={Boolean(errors['company'])}
              value={state.company}
              onChange={(e) => update('company', e.target.value)}
            />
          </FormField>
          <FormField label="Téléphone" htmlFor="phone" required error={errors['phone']}>
            <TextInput
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-required="true"
              aria-describedby={describedBy('phone')}
              invalid={Boolean(errors['phone'])}
              value={state.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </FormField>
          <FormField label="E-mail" htmlFor="email" required error={errors['email']}>
            <TextInput
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-required="true"
              aria-describedby={describedBy('email')}
              invalid={Boolean(errors['email'])}
              value={state.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </FormField>
        </div>
      </section>

      <DesignSourceSelector
        value={state.designSource}
        onChange={(value) => update('designSource', value)}
        error={errors['designSource']}
      />

      <FormField label="Commentaire" htmlFor="comments" description="Facultatif" error={errors['comments']}>
        <TextArea
          id="comments"
          name="comments"
          rows={4}
          aria-describedby={errors['comments'] ? 'comments-description comments-error' : 'comments-description'}
          invalid={Boolean(errors['comments'])}
          value={state.comments}
          onChange={(e) => update('comments', e.target.value)}
        />
      </FormField>

      <div className="flex flex-col gap-6 border-t border-(--pc-color-border-subtle) pt-8">
        <ConsentField
          error={errors['consentConfirmed']}
          checked={state.consentConfirmed}
          onChange={(checked) => update('consentConfirmed', checked)}
        />

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            size="large"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:self-start"
            iconAfter={
              isSubmitting ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
                />
              ) : null
            }
          >
            Obtenir mon devis
          </Button>
          <p className="pc-text-footnote text-tertiary">
            Notre équipe vous contactera pour confirmer les détails, le prix et le délai.
          </p>
          <p role="status" className="sr-only">
            {isSubmitting ? 'Envoi de votre demande en cours…' : ''}
          </p>
        </div>
      </div>
    </form>
  )
}
