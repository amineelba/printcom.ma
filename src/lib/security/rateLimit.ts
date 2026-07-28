/**
 * Minimal in-memory rate limiter for form submission endpoints.
 *
 * Works per server instance/process — sufficient for a single Node/Vercel
 * function instance under normal traffic, but not durable across multiple
 * concurrent instances. If Printcom's traffic profile requires distributed
 * rate limiting, replace this with a shared store (Vercel KV/Redis) — see
 * docs/security.md.
 */
const hits = new Map<string, number[]>()

export function isRateLimited(key: string, { windowMs, max }: { windowMs: number; max: number }): boolean {
  const now = Date.now()
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  timestamps.push(now)
  hits.set(key, timestamps)
  return timestamps.length > max
}
