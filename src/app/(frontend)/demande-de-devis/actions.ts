'use server'

import { headers } from 'next/headers'
import { getPayload } from '@/lib/payload/client'
import { quoteCheckoutSchema, type QuoteCheckoutInput } from '@/lib/validation/quote'
import { resolveQuoteContext } from '@/lib/quote/resolveQuoteContext'
import { mapCheckoutToQuoteRequest } from '@/lib/quote/mapCheckoutToQuoteRequest'
import { buildQuoteConfirmationEmail, buildQuoteNotificationEmail } from '@/lib/quote/quoteEmails'
import { generateReference } from '@/lib/quote/generateReference'
import { isRateLimited } from '@/lib/security/rateLimit'
import { getIdempotentResult, storeIdempotentResult } from '@/lib/security/idempotency'
import { sendEmail } from '@/lib/email/sendEmail'

const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp', 'ai', 'eps', 'indd', 'zip']
const MAX_FILE_SIZE_BYTES = Number(process.env.FILE_UPLOAD_MAX_SIZE || 15 * 1024 * 1024)

export interface UploadFileResult {
  status: 'success' | 'error'
  id?: number
  filename?: string
  message?: string
}

/**
 * Uploads one client-selected file into the private-quote-files collection.
 * Not exposed by the public quote checkout (Sprint 1 no longer collects
 * artwork) — kept as backend infrastructure for a later file-exchange flow.
 */
export async function uploadQuoteFile(formData: FormData): Promise<UploadFileResult> {
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { status: 'error', message: 'Fichier invalide.' }
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
    return { status: 'error', message: `Format non accepté (${extension || 'inconnu'}).` }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { status: 'error', message: 'Fichier trop volumineux.' }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Strip anything but safe filename characters before persisting.
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-180)

  const payload = await getPayload()
  const doc = await payload.create({
    collection: 'private-quote-files',
    data: { originalFilename: file.name },
    file: {
      data: buffer,
      mimetype: file.type || 'application/octet-stream',
      name: cleanName,
      size: file.size,
    },
    overrideAccess: true,
  })

  return { status: 'success', id: doc.id, filename: file.name }
}

export interface SubmitQuoteResult {
  status: 'success' | 'error'
  reference?: string
  errors?: Record<string, string>
  message?: string
}

/**
 * Submission boundary for the public quote checkout. Everything the browser
 * sends is re-validated here — client-side validation is a convenience only.
 */
export async function submitQuoteRequest(input: QuoteCheckoutInput): Promise<SubmitQuoteResult> {
  if (typeof input?.honeypot === 'string' && input.honeypot.trim().length > 0) {
    // Pretend success to bots without writing anything.
    return { status: 'success', reference: 'PC-DEVIS-0000-000000' }
  }

  const parsed = quoteCheckoutSchema.safeParse(input)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      errors[issue.path.join('.') || 'form'] = issue.message
    }
    return { status: 'error', errors }
  }
  const data = parsed.data

  const existing = getIdempotentResult(data.idempotencyKey)
  if (existing) {
    return { status: 'success', reference: existing }
  }

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
  if (isRateLimited(`quote:${ip}`, { windowMs: 60_000, max: 3 })) {
    return { status: 'error', message: 'Trop de tentatives. Merci de réessayer dans quelques instants.' }
  }

  const payload = await getPayload()
  // Everything the browser sent about the product is re-resolved here against
  // published documents: the transport is canonicalized, never trusted.
  const context = await resolveQuoteContext(payload, {
    ...data.context,
    productSlug: data.productContext?.productSlug ?? data.context?.productSlug,
    configurationTransport: data.productContext?.configurationTransport,
  })

  let doc
  let attempts = 0
  // Retry on the rare race where two submissions in the same instant
  // compute the same next reference number.
  while (true) {
    attempts += 1
    const reference = await generateReference(payload)
    try {
      doc = await payload.create({
        collection: 'quote-requests',
        data: mapCheckoutToQuoteRequest(reference, data, context),
        overrideAccess: true,
      })
      break
    } catch (error) {
      const isUniqueViolation =
        error instanceof Error && 'code' in error && (error as { code?: string }).code === '23505'
      if (isUniqueViolation && attempts < 5) continue
      throw error
    }
  }

  storeIdempotentResult(data.idempotencyKey, doc.reference)

  // The lead is already saved: a mail failure must not turn a successful
  // submission into an error the customer would retry.
  try {
    const quoteSettings = await payload.findGlobal({ slug: 'quote-settings', depth: 0 })
    const recipients = (quoteSettings.notificationRecipients || process.env.PRINTCOM_QUOTE_RECIPIENTS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (recipients.length) {
      const notification = buildQuoteNotificationEmail(doc.reference, data, context)
      await sendEmail({ to: recipients, subject: notification.subject, html: notification.html })
    }

    const confirmation = buildQuoteConfirmationEmail(doc.reference, data)
    await sendEmail({
      to: data.email,
      subject: quoteSettings.confirmationSubject || 'Votre demande de devis Printcom a bien été reçue',
      html: confirmation.html,
    })
  } catch (error) {
    console.error(`[quote] ${doc.reference} saved but email delivery failed`, error)
  }

  return { status: 'success', reference: doc.reference }
}
