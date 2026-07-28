/**
 * Guards against double-submission of the same form (double-click, retried
 * network request) using a client-generated key. In-memory per instance —
 * same durability caveat as rateLimit.ts.
 */
const seen = new Map<string, { reference: string; expiresAt: number }>()
const TTL_MS = 10 * 60 * 1000

export function getIdempotentResult(key: string): string | undefined {
  const entry = seen.get(key)
  if (!entry) return undefined
  if (entry.expiresAt < Date.now()) {
    seen.delete(key)
    return undefined
  }
  return entry.reference
}

export function storeIdempotentResult(key: string, reference: string): void {
  seen.set(key, { reference, expiresAt: Date.now() + TTL_MS })
}
