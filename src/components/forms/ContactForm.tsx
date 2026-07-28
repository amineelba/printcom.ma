'use client'

import { useActionState } from 'react'
import { submitContactForm, type ContactFormState } from '@/app/(frontend)/contact/actions'
import { FormField } from './FormField'
import { FormErrorSummary } from './FormErrorSummary'
import { ConsentField } from './ConsentField'
import { TextInput, TextArea } from './inputs'
import { Button } from '@/components/ui/Button'

const initialState: ContactFormState = { status: 'idle' }

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const errors = state.errors ?? {}

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <FormErrorSummary errors={errors} />
      {state.message ? (
        <p role="alert" className="pc-text-body-small text-error">
          {state.message}
        </p>
      ) : null}

      {/* Honeypot — hidden from sighted users and screen readers alike */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Nom complet" htmlFor="fullName" required error={errors.fullName}>
          <TextInput id="fullName" name="fullName" required invalid={Boolean(errors.fullName)} autoComplete="name" />
        </FormField>
        <FormField label="Entreprise" htmlFor="company" error={errors.company}>
          <TextInput id="company" name="company" autoComplete="organization" />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="E-mail" htmlFor="email" required error={errors.email}>
          <TextInput id="email" name="email" type="email" required invalid={Boolean(errors.email)} autoComplete="email" />
        </FormField>
        <FormField label="Téléphone" htmlFor="phone" error={errors.phone}>
          <TextInput id="phone" name="phone" type="tel" autoComplete="tel" />
        </FormField>
      </div>

      <FormField label="Sujet" htmlFor="subject" error={errors.subject}>
        <TextInput id="subject" name="subject" />
      </FormField>

      <FormField label="Message" htmlFor="message" required error={errors.message}>
        <TextArea id="message" name="message" required invalid={Boolean(errors.message)} rows={6} />
      </FormField>

      <ConsentField error={errors.consentConfirmed} />

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? 'Envoi en cours…' : 'Envoyer le message'}
      </Button>
    </form>
  )
}
