import { z } from 'zod'

export const DESIGN_SOURCES = ['client', 'printcom'] as const
export type DesignSource = (typeof DESIGN_SOURCES)[number]

/** Readable French labels, shared by the form, emails and admin-facing output. */
export const DESIGN_SOURCE_LABELS: Record<DesignSource, string> = {
  client: 'Le client fournit son design',
  printcom: 'Printcom réalise le design',
}

/** Empty/whitespace-only optional text is treated as "not provided". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, 'Texte trop long.')
    .optional()
    .transform((value) => (value ? value : undefined))

/**
 * Optional page context carried over from the product page via query params
 * (`?produit=`, `?support=`, `?finition=`). Slugs only — the server action
 * re-resolves them against published catalogue documents, so nothing here is
 * trusted as an ID or a label.
 */
export const quoteCheckoutContextSchema = z.object({
  productSlug: z.string().trim().max(200).optional(),
  materialSlug: z.string().trim().max(200).optional(),
  finishSlug: z.string().trim().max(200).optional(),
})

/**
 * Product + configuration hand-off from the product page (Sprint 4). Both
 * values are untrusted: the server action re-resolves the product against
 * published documents and canonicalizes the transport against its options.
 */
export const quoteProductContextSchema = z.object({
  productSlug: z.string().trim().max(200).optional(),
  configurationTransport: z.string().trim().max(2000).optional(),
})

/**
 * What the public `/demande-de-devis` checkout actually collects (Sprint 1).
 * Deliberately NOT the persisted quote-request shape — see
 * `mapCheckoutToQuoteRequest` for how this is normalized into the Payload
 * collection's legacy structured groups.
 */
export const quoteCheckoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Indiquez votre nom complet.')
    .max(200, 'Nom trop long.'),
  company: optionalText(200),
  phone: z
    .string()
    .trim()
    .min(6, 'Indiquez un numéro de téléphone valide.')
    .max(40, 'Numéro de téléphone trop long.'),
  email: z.string().trim().max(254, 'Adresse e-mail trop longue.').email('Adresse e-mail invalide.'),
  designSource: z.enum(DESIGN_SOURCES, {
    errorMap: () => ({ message: 'Indiquez qui fournit le design.' }),
  }),
  comments: optionalText(2000),
  consentConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'Le consentement est requis pour traiter votre demande.' }),
  }),
  context: quoteCheckoutContextSchema.optional(),
  productContext: quoteProductContextSchema.optional(),
  honeypot: z.string().optional(),
  idempotencyKey: z.string().min(1).max(100),
})

/** Parsed (server-validated) checkout data. */
export type QuoteCheckoutData = z.output<typeof quoteCheckoutSchema>

/**
 * Raw checkout input as sent by the client: `consentConfirmed` / `designSource`
 * are loosened because the form starts with nothing chosen and
 * `quoteCheckoutSchema` is what enforces them.
 */
export type QuoteCheckoutInput = z.input<typeof quoteCheckoutSchema>
