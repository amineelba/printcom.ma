import { DESIGN_SOURCE_LABELS, type QuoteCheckoutData } from '@/lib/validation/quote'
import type { ResolvedQuoteContext } from './resolveQuoteContext'

/** Customer-supplied text is interpolated into HTML emails — always escape it. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function row(label: string, value: string | undefined): string {
  return value ? `<p><strong>${escapeHtml(label)} :</strong> ${escapeHtml(value)}</p>` : ''
}

export function buildQuoteNotificationEmail(
  reference: string,
  data: QuoteCheckoutData,
  context: ResolvedQuoteContext,
): { subject: string; html: string } {
  // Company only when present; otherwise fall back to the person's name so the
  // subject never ends with a dangling "—".
  const who = data.company ? `${data.fullName} (${data.company})` : data.fullName

  // Same canonical rows as the checkout summary: selected values only. Without
  // a canonical configuration (generic quote, legacy links) fall back to the
  // plain material/finish lookup.
  const configurationRows = context.configuration
    ? context.configuration.rows.map((item) => row(item.label, item.value))
    : [row('Support', context.material?.title), row('Finition', context.finish?.title)]
  const requestLines = [row('Produit', context.product?.title), ...configurationRows].join('')

  const html = [
    `<p><strong>${escapeHtml(reference)}</strong></p>`,
    row('Nom', data.fullName),
    row('Entreprise', data.company),
    row('E-mail', data.email),
    row('Téléphone', data.phone),
    requestLines ? `<p><u>Demande</u></p>${requestLines}` : '',
    row('Design', DESIGN_SOURCE_LABELS[data.designSource]),
    row('Commentaire', data.comments),
  ].join('')

  return { subject: `Nouvelle demande de devis ${reference} — ${who}`, html }
}

export function buildQuoteConfirmationEmail(
  reference: string,
  data: QuoteCheckoutData,
): { html: string } {
  return {
    html: `<p>Bonjour ${escapeHtml(data.fullName)},</p>
           <p>Votre demande de devis a bien été enregistrée sous la référence <strong>${escapeHtml(reference)}</strong>.</p>
           <p>Notre équipe l’étudie et vous contactera pour confirmer les détails.</p>
           <p>L’équipe Printcom</p>`,
  }
}
