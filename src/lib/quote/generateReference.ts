import type { Payload } from 'payload'

/** Pure formatting logic, unit-testable without a database. */
export function formatReference(year: number, sequence: number): string {
  return `PC-DEVIS-${year}-${String(sequence).padStart(6, '0')}`
}

export function referencePrefix(year: number): string {
  return `PC-DEVIS-${year}-`
}

/**
 * Generates the next PC-DEVIS-YYYY-000001 reference for the current year.
 * Counts existing references for the year rather than using a dedicated
 * sequence table; callers should retry generateReference + create on a
 * unique-constraint conflict (rare, only under concurrent submissions in
 * the same instant) — see submitQuoteRequest.
 */
export async function generateReference(payload: Payload): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = referencePrefix(year)

  const result = await payload.find({
    collection: 'quote-requests',
    where: { reference: { like: prefix } },
    limit: 0,
    depth: 0,
  })

  return formatReference(year, result.totalDocs + 1)
}
