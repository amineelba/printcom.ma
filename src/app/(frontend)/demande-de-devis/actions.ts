'use server'

import { headers } from 'next/headers'
import { getPayload } from '@/lib/payload/client'
import { quoteRequestSchema, type QuoteRequestInput } from '@/lib/validation/quote'
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
 * Called eagerly as each file is added in step 4, ahead of final submit, so
 * the wizard can show per-file success/failure without blocking the rest
 * of the form.
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

export async function submitQuoteRequest(input: QuoteRequestInput): Promise<SubmitQuoteResult> {
  if (input.honeypot && input.honeypot.trim().length > 0) {
    // Pretend success to bots without writing anything.
    return { status: 'success', reference: 'PC-DEVIS-0000-000000' }
  }

  const parsed = quoteRequestSchema.safeParse(input)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      errors[issue.path.join('.')] = issue.message
    }
    return { status: 'error', errors }
  }

  const existing = getIdempotentResult(parsed.data.idempotencyKey)
  if (existing) {
    return { status: 'success', reference: existing }
  }

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
  if (isRateLimited(`quote:${ip}`, { windowMs: 60_000, max: 3 })) {
    return { status: 'error', message: 'Trop de tentatives. Merci de réessayer dans quelques instants.' }
  }

  const payload = await getPayload()
  const { need, configuration, productionAndDelivery, files, contact } = parsed.data

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
        data: {
          reference,
          need: {
            requestType: need.requestType,
            desiredProduct: need.desiredProduct ? Number(need.desiredProduct) : undefined,
            category: need.category ? Number(need.category) : undefined,
            description: need.description,
            usage: need.usage,
            sector: need.sector ? Number(need.sector) : undefined,
          },
          configuration: {
            format: configuration.format,
            customFormatWidth: configuration.customFormatWidth,
            customFormatHeight: configuration.customFormatHeight,
            customFormatUnit: configuration.customFormatUnit,
            orientation: configuration.orientation,
            pageCount: configuration.pageCount,
            printSides: configuration.printSides,
            color: configuration.color,
            material: configuration.material ? Number(configuration.material) : undefined,
            grammage: configuration.grammage,
            finish: configuration.finish?.map(Number),
            binding: configuration.binding,
            quantity: configuration.quantity,
            versionsCount: configuration.versionsCount,
            variablePersonalization: configuration.variablePersonalization,
          },
          productionAndDelivery: {
            desiredDate: productionAndDelivery.desiredDate,
            urgencyLevel: productionAndDelivery.urgencyLevel,
            city: productionAndDelivery.city,
            addressOrZone: productionAndDelivery.addressOrZone,
            multiSiteDelivery: productionAndDelivery.multiSiteDelivery,
            destinationsCount: productionAndDelivery.destinationsCount,
            installationRequired: productionAndDelivery.installationRequired,
            logisticsComments: productionAndDelivery.logisticsComments,
          },
          files: {
            filesReady: files.filesReady,
            needsFileCheck: files.needsFileCheck,
            needsGraphicDesign: files.needsGraphicDesign,
            uploadedFiles: files.uploadedFileIds,
            externalLink: files.externalLink,
            comments: files.comments,
          },
          contact: {
            company: contact.company,
            fullName: contact.fullName,
            jobTitle: contact.jobTitle,
            email: contact.email,
            phone: contact.phone,
            city: contact.city,
            preferredContactMethod: contact.preferredContactMethod,
            comments: contact.comments,
            consentConfirmed: true,
            consentTimestamp: new Date().toISOString(),
          },
          workflow: {
            status: 'new',
            priority: 'normal',
            source: 'website-quote-form',
          },
        },
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

  storeIdempotentResult(parsed.data.idempotencyKey, doc.reference)

  // Link uploaded files back to this quote request for admin traceability.
  if (files.uploadedFileIds?.length) {
    await Promise.all(
      files.uploadedFileIds.map((fileId) =>
        payload
          .update({
            collection: 'private-quote-files',
            id: fileId,
            data: { quoteRequest: doc.id },
            overrideAccess: true,
          })
          .catch(() => undefined),
      ),
    )
  }

  const quoteSettings = await payload.findGlobal({ slug: 'quote-settings', depth: 0 })
  const recipients = (quoteSettings.notificationRecipients || process.env.PRINTCOM_QUOTE_RECIPIENTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (recipients.length) {
    await sendEmail({
      to: recipients,
      subject: `Nouvelle demande de devis ${doc.reference} — ${contact.company}`,
      html: `<p><strong>${doc.reference}</strong></p>
             <p>${contact.fullName} — ${contact.company}</p>
             <p>${contact.email} — ${contact.phone}</p>
             <p>${need.description}</p>`,
    })
  }

  await sendEmail({
    to: contact.email,
    subject: quoteSettings.confirmationSubject || 'Votre demande de devis Printcom a bien été reçue',
    html: `<p>Bonjour ${contact.fullName},</p>
           <p>Votre demande de devis a bien été enregistrée sous la référence <strong>${doc.reference}</strong>.</p>
           <p>Notre équipe l’étudie et revient vers vous dans les meilleurs délais.</p>
           <p>L’équipe Printcom</p>`,
  })

  return { status: 'success', reference: doc.reference }
}
