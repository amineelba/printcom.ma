import { describe, it, expect } from 'vitest'
import { buildQuoteConfirmationEmail, buildQuoteNotificationEmail, escapeHtml } from '@/lib/quote/quoteEmails'
import { mapCheckoutToQuoteRequest } from '@/lib/quote/mapCheckoutToQuoteRequest'
import type { QuoteCheckoutData } from '@/lib/validation/quote'

const base: QuoteCheckoutData = {
  fullName: 'Amine Test',
  phone: '+212600000000',
  email: 'amine@example.com',
  designSource: 'client',
  consentConfirmed: true,
  idempotencyKey: 'k',
}

describe('quote emails', () => {
  it('never renders "undefined" or a dangling separator when company is absent', () => {
    const { subject, html } = buildQuoteNotificationEmail('PC-DEVIS-2026-000001', base, {})
    expect(subject).toBe('Nouvelle demande de devis PC-DEVIS-2026-000001 — Amine Test')
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('Entreprise')
    expect(html).not.toContain('Commentaire')
    expect(html).not.toContain('Demande</u>')
  })

  it('includes company, product context, design source and comment when present', () => {
    const { subject, html } = buildQuoteNotificationEmail(
      'PC-DEVIS-2026-000002',
      { ...base, company: 'ACME', designSource: 'printcom', comments: 'Merci' },
      { product: { id: 1, slug: 'flyers', title: 'Flyers' }, finish: { id: 2, slug: 'vernis-uv', title: 'Vernis UV' } },
    )
    expect(subject).toContain('Amine Test (ACME)')
    expect(html).toContain('Entreprise :</strong> ACME')
    expect(html).toContain('Produit :</strong> Flyers')
    expect(html).toContain('Finition :</strong> Vernis UV')
    expect(html).not.toContain('Support')
    expect(html).toContain('Printcom réalise le design')
    expect(html).toContain('Commentaire :</strong> Merci')
  })

  it('escapes customer-supplied HTML', () => {
    const { html } = buildQuoteNotificationEmail('R', { ...base, fullName: '<script>x</script>', comments: '"><img src=x>' }, {})
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(escapeHtml(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
  })

  it('keeps the confirmation concise and makes no price or deadline promise', () => {
    const { html } = buildQuoteConfirmationEmail('PC-DEVIS-2026-000003', base)
    expect(html).toContain('PC-DEVIS-2026-000003')
    expect(html).toContain('contactera pour confirmer les détails')
    expect(html).not.toMatch(/PDF|24 ?h|48 ?h|délais/i)
  })
})

describe('mapCheckoutToQuoteRequest', () => {
  const now = new Date('2026-10-04T10:00:00.000Z')

  it('maps a generic request without inventing values', () => {
    const doc = mapCheckoutToQuoteRequest('PC-DEVIS-2026-000001', base, {}, now)
    expect(doc.need).toEqual({ requestType: 'other', desiredProduct: undefined })
    expect(doc.need.description).toBeUndefined()
    expect(doc.contact.company).toBeUndefined()
    expect(doc.files).toEqual({ designSource: 'client', needsGraphicDesign: false })
    expect(doc.contact.consentTimestamp).toBe(now.toISOString())
    expect(doc.workflow).toEqual({ status: 'new', priority: 'normal', source: 'website-quote-form' })
  })

  it('flags graphic design for printcom and attaches resolved context', () => {
    const doc = mapCheckoutToQuoteRequest(
      'R',
      { ...base, designSource: 'printcom' },
      { product: { id: 7, slug: 'p', title: 'P' }, material: { id: 8, slug: 'm', title: 'M' }, finish: { id: 9, slug: 'f', title: 'F' } },
      now,
    )
    expect(doc.files).toEqual({ designSource: 'printcom', needsGraphicDesign: true })
    expect(doc.need.requestType).toBe('product-printing')
    expect(doc.need.desiredProduct).toBe(7)
    expect(doc.configuration).toEqual({ material: 8, finish: [9] })
  })
})
