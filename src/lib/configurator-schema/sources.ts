import { PRODUCT_SOURCES, slugify } from '@/lib/seed/content/products'
import { normalizeTerm } from './dimensionCatalog'
import type { Provenance } from './constants'

/**
 * Authoritative product-dimension sources, in priority order:
 *
 *  1. `master-content` — a PRINTCOM master content markdown file, when one
 *     is supplied (`--master <path>`). Not committed to this repository.
 *  2. `seed-source` — the transcription of the master content §7–8 kept in
 *     `src/lib/seed/content/products.ts` (`À configurer` lists).
 *  3. `existing-cms` — the "À configurer : …" line already stored in a
 *     product's long description.
 *
 * A source only tells *which technical dimensions structure the project* —
 * "Product technical characteristics describe configuration dimensions, not
 * guaranteed availability". It never supplies option values.
 */

export type SourceKind = Extract<Provenance, 'master-content' | 'seed-source' | 'existing-cms'>

export interface ProductSource {
  title: string
  slug: string
  /** Raw dimension wording, in source order. */
  dimensions: string[]
  kind: SourceKind
}

/** Labels that introduce a dimension list in the master content. */
const LIST_LABELS = ['les choix qui structurent le projet', 'a configurer'] as const
/** Listed for completeness: CMS data to display *if confirmed* — informational, never a dimension list. */
const CMS_DATA_LABEL = 'donnees cms a afficher si confirmees'

/** Splits a comma/semicolon list, ignoring separators inside parentheses. */
export function splitList(text: string): string[] {
  const items: string[] = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '(') depth += 1
    if (char === ')') depth = Math.max(0, depth - 1)
    if ((char === ',' || char === ';') && depth === 0) {
      items.push(current)
      current = ''
    } else current += char
  }
  items.push(current)
  return items
    .map((item) => item.replace(/\.+$/, '').replace(/^[-*•\s]+/, '').trim())
    .filter(Boolean)
}

/** "À configurer : a, b, c." → ['a','b','c']; `undefined` when the line is not one. */
export function parseConfigureLine(line: string): string[] | undefined {
  const match = /^\s*(?:[-*•]\s*)?(?:\*\*|__)?\s*([^:*_]+?)\s*(?:\*\*|__)?\s*:\s*(?:\*\*|__)?\s*(.*)$/.exec(line)
  if (!match) return undefined
  const label = normalizeTerm(match[1])
  if (!(LIST_LABELS as readonly string[]).includes(label)) return undefined
  const items = splitList(match[2].replace(/(\*\*|__)/g, ''))
  return items.length ? items : undefined
}

/**
 * Parses a master-content markdown document. A product is the nearest
 * heading above a dimension list that is not itself a list label. The list
 * is a line `À configurer : a, b, c` (or `Les choix qui structurent le
 * projet : …`), optionally bulleted/bold; or the same label on its own line
 * (or as a heading) followed by a bullet list. The `Données CMS à afficher
 * si confirmées` block is recognised and ignored. Deterministic: the first
 * list found under a product wins, and a list never leaks into the next
 * product.
 */
export function parseMasterContent(markdown: string): ProductSource[] {
  const lines = markdown.split(/\r?\n/)
  const sources: ProductSource[] = []
  let current: { title: string; dimensions?: string[] } | undefined
  const finish = () => {
    if (current?.dimensions?.length) {
      sources.push({ title: current.title, slug: slugify(current.title), dimensions: current.dimensions, kind: 'master-content' })
    }
  }

  const bareLabel = (line: string) => {
    const match = /^\s*(?:[-*•]\s*)?(?:\*\*|__)?\s*([^:*_]+?)\s*(?:\*\*|__)?\s*:?\s*$/.exec(line)
    return match ? normalizeTerm(match[1]) : ''
  }
  const bulletsFrom = (start: number): string[] => {
    const items: string[] = []
    for (let next = start; next < lines.length; next += 1) {
      const bullet = /^\s*[-*•]\s+(.+)$/.exec(lines[next])
      if (bullet) items.push(...splitList(bullet[1]))
      else if (lines[next].trim() === '' && items.length === 0) continue
      else break
    }
    return items
  }

  lines.forEach((line, index) => {
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (heading) {
      const text = heading[2].replace(/[*_`]/g, '').trim()
      const label = normalizeTerm(text)
      if ((LIST_LABELS as readonly string[]).includes(label)) {
        if (current && !current.dimensions) {
          const items = bulletsFrom(index + 1)
          if (items.length) current.dimensions = items
        }
        return
      }
      finish()
      current = { title: text }
      return
    }
    if (!current || current.dimensions) return

    const inline = parseConfigureLine(line)
    if (inline) {
      current.dimensions = inline
      return
    }
    const label = bareLabel(line)
    if (label === CMS_DATA_LABEL) return
    if ((LIST_LABELS as readonly string[]).includes(label)) {
      const items = bulletsFrom(index + 1)
      if (items.length) current.dimensions = items
    }
  })
  finish()
  return sources
}

/** The seed transcription of the master content (priority 2). */
export function seedSources(): ProductSource[] {
  return PRODUCT_SOURCES.map((source) => ({
    title: source.title,
    slug: slugify(source.title),
    dimensions: [...source.configure],
    kind: 'seed-source' as const,
  }))
}

/** Plain text lines of a Lexical rich-text value (paragraphs / list items / headings). */
export function richTextLines(value: unknown): string[] {
  const lines: string[] = []
  const walk = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    const record = node as { text?: unknown; children?: unknown; type?: unknown; root?: unknown }
    if (record.root) return walk(record.root)
    const text = typeof record.text === 'string' ? record.text : ''
    const children = Array.isArray(record.children) ? record.children : []
    const inner = children.map(walk).join('')
    const own = text + inner
    if (['paragraph', 'listitem', 'heading', 'quote'].includes(String(record.type)) && own.trim()) {
      lines.push(own.trim())
      return ''
    }
    return own
  }
  walk(value)
  return lines
}

/** Priority 3: the "À configurer : …" line already stored in a long description. */
export function sourceFromLongDescription(value: unknown): string[] | undefined {
  for (const line of richTextLines(value)) {
    const items = parseConfigureLine(line)
    if (items) return items
  }
  return undefined
}

const sameSet = (a: string[], b: string[]) => {
  const left = a.map(normalizeTerm).sort()
  const right = b.map(normalizeTerm).sort()
  return left.length === right.length && left.every((term, index) => term === right[index])
}

export interface ResolvedProductSource {
  source?: ProductSource
  /** A lower-priority source that disagrees with the chosen one. */
  conflict?: { kind: SourceKind; dimensions: string[] }
}

/**
 * Picks the highest-priority source for a product and reports a
 * disagreement with a lower one (conflicting-source review item).
 */
export function resolveProductSource(args: {
  slug: string
  title: string
  description?: unknown
  master?: ProductSource[]
  seed?: ProductSource[]
}): ResolvedProductSource {
  const find = (list: ProductSource[] | undefined) =>
    list?.find((entry) => entry.slug === args.slug || normalizeTerm(entry.title) === normalizeTerm(args.title))

  const candidates: ProductSource[] = []
  const master = find(args.master)
  if (master) candidates.push(master)
  const seed = find(args.seed ?? seedSources())
  if (seed) candidates.push(seed)
  const described = sourceFromLongDescription(args.description)
  if (described) candidates.push({ title: args.title, slug: args.slug, dimensions: described, kind: 'existing-cms' })

  const [chosen, ...rest] = candidates
  if (!chosen) return {}
  const disagreeing = rest.find((candidate) => !sameSet(candidate.dimensions, chosen.dimensions))
  return { source: chosen, conflict: disagreeing && { kind: disagreeing.kind, dimensions: disagreeing.dimensions } }
}
