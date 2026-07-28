'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/client'
import { contactFormSchema } from '@/lib/validation/contact'
import { isHoneypotTripped } from '@/lib/security/honeypot'
import { isRateLimited } from '@/lib/security/rateLimit'
import { sendEmail } from '@/lib/email/sendEmail'

export interface ContactFormState {
  status: 'idle' | 'error' | 'success'
  errors?: Record<string, string>
  message?: string
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = Object.fromEntries(formData.entries())

  // Bots that fill every field trip the honeypot; pretend success so they
  // don't learn anything from the response, but never write to the DB.
  if (isHoneypotTripped(raw.website)) {
    return { status: 'success' }
  }

  const parsed = contactFormSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      if (!errors[key]) errors[key] = issue.message
    }
    return { status: 'error', errors }
  }

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'

  if (isRateLimited(`contact:${ip}`, { windowMs: 60_000, max: 5 })) {
    return { status: 'error', message: 'Trop de tentatives. Merci de réessayer dans quelques instants.' }
  }

  const payload = await getPayload()

  await payload.create({
    collection: 'contact-requests',
    data: {
      fullName: parsed.data.fullName,
      company: parsed.data.company,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
      consentConfirmed: true,
      consentTimestamp: new Date().toISOString(),
      source: 'website-contact-form',
    },
    overrideAccess: true,
  })

  const contactSettings = await payload.findGlobal({ slug: 'contact-settings', depth: 0 })
  const recipients = (contactSettings.notificationRecipients || process.env.PRINTCOM_CONTACT_RECIPIENTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (recipients.length) {
    await sendEmail({
      to: recipients,
      subject: `Nouvelle demande de contact — ${parsed.data.fullName}`,
      html: `<p><strong>${parsed.data.fullName}</strong> (${parsed.data.company || 'société non renseignée'})</p>
             <p>${parsed.data.email} — ${parsed.data.phone || ''}</p>
             <p>${parsed.data.subject || ''}</p>
             <p>${parsed.data.message}</p>`,
    })
  }

  await sendEmail({
    to: parsed.data.email,
    subject: contactSettings.autoReplySubject || 'Votre message a bien été reçu — Printcom',
    html: `<p>Bonjour ${parsed.data.fullName},</p><p>Votre message a bien été reçu. Notre équipe vous répondra dans les meilleurs délais.</p><p>L’équipe Printcom</p>`,
  })

  redirect('/contact/merci')
}
