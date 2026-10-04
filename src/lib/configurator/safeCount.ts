const MAX_COUNT = 10_000_000

/**
 * Reads a whole-number count out of a CMS option label — but only when the
 * label *says* it is a count: bare digits, optionally grouped with spaces
 * ("1 000"), optionally followed by an explicit unit ("500 ex.", "16 pages").
 * Anything else ("500–1000", "A4", "sur devis", "1.000,5") yields `undefined`
 * so the caller keeps the label instead of inventing a number.
 */
const COUNT_PATTERN =
  /^(\d{1,3}(?:[\s  ]\d{3})+|\d+)(?:[\s  ]*(?:ex\.?|exemplaires?|pages?|pp?\.?|pcs|pi[eè]ces?|unit[eé]s?))?$/i

export function parseExplicitCount(label: string | null | undefined): number | undefined {
  if (!label) return undefined
  const match = COUNT_PATTERN.exec(label.trim())
  if (!match) return undefined
  const count = Number(match[1].replace(/[\s  ]/g, ''))
  return Number.isSafeInteger(count) && count > 0 && count <= MAX_COUNT ? count : undefined
}

/** Dimension typed by the visitor: positive decimal, "," or "." as separator. */
export function parseDimension(input: string | null | undefined): number | undefined {
  if (!input) return undefined
  const trimmed = input.trim()
  if (!/^\d+(?:[.,]\d+)?$/.test(trimmed)) return undefined
  const value = Number(trimmed.replace(',', '.'))
  return Number.isFinite(value) && value > 0 && value <= 100_000 ? value : undefined
}
