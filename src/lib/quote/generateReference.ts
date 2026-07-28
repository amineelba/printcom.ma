import type { Payload } from 'payload'

/**
 * Generates the next PC-DEVIS-YYYY-000001 reference for the current year.
 * Counts existing references for the year rather than using a dedicated
 * sequence table; callers should retry generateReference + create on a
 * unique-constraint conflict (rare, only under concurrent submissions in
 * the same instant) — see submitQuoteRequest.
 */
export async function generateReference(payload: Payload): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PC-DEVIS-${year}-`

  const result = await payload.find({
    collection: 'quote-requests',
    where: { reference: { like: prefix } },
    limit: 0,
    depth: 0,
  })

  const next = result.totalDocs + 1
  return `${prefix}${String(next).padStart(6, '0')}`
}
