import { CORE_DIMENSION_KEYS } from '@/lib/configurator/types'
import type { DimensionGroup, DimensionOptionSource, DimensionValueType } from './constants'

/**
 * Canonical technical dimensions and the reviewed mapping from the raw
 * wording of the Printcom master content ("À configurer : format, support,
 * recto-verso…") to registry keys.
 *
 * Mapping policy (never naive string substitution):
 *  - a raw term maps to a *core* dimension only through the reviewed
 *    synonym table below;
 *  - a term that overlaps several concepts (`papier`, `carton`, `matière`,
 *    `impression`, `couleur`…) keeps its **own** key and is flagged
 *    `ambiguous` — a human decides whether it equals a core dimension;
 *  - every other term becomes its own specialized dimension, keyed by the
 *    French slug of the term itself — a pure transcription, no translation
 *    and no semantic guess;
 *  - terms that bundle alternatives ("carton ou rigide", "intérieur/extérieur",
 *    "braille éventuel") are flagged `ambiguous` as well.
 */

export type MappingConfidence = 'mapped' | 'exact' | 'ambiguous'

export interface DimensionDefinition {
  key: string
  label: string
  group: DimensionGroup
  valueType: DimensionValueType
  optionSource: DimensionOptionSource
  unit?: string
  sortOrder: number
}

export interface CanonicalDimension {
  raw: string
  definition: DimensionDefinition
  confidence: MappingConfidence
  /** Why a term was flagged / how it was mapped. */
  note?: string
}

/** The nine core dimensions — the only ones that also fill the historical quote fields. */
export const CORE_DIMENSIONS: Record<string, DimensionDefinition> = {
  [CORE_DIMENSION_KEYS.format]: { key: 'format', label: 'Format', group: 'size', valueType: 'single-choice', optionSource: 'catalog', sortOrder: 10 },
  [CORE_DIMENSION_KEYS.orientation]: { key: 'orientation', label: 'Orientation', group: 'size', valueType: 'single-choice', optionSource: 'enum', sortOrder: 20 },
  [CORE_DIMENSION_KEYS.pageCount]: { key: 'page-count', label: 'Nombre de pages', group: 'construction', valueType: 'single-choice', optionSource: 'catalog', sortOrder: 30 },
  [CORE_DIMENSION_KEYS.printSides]: { key: 'print-sides', label: 'Impression', group: 'print', valueType: 'single-choice', optionSource: 'enum', sortOrder: 40 },
  [CORE_DIMENSION_KEYS.colorMode]: { key: 'color-mode', label: 'Couleur', group: 'print', valueType: 'single-choice', optionSource: 'enum', sortOrder: 50 },
  [CORE_DIMENSION_KEYS.material]: { key: 'material', label: 'Support', group: 'material', valueType: 'single-choice', optionSource: 'materials', sortOrder: 60 },
  [CORE_DIMENSION_KEYS.grammage]: { key: 'grammage', label: 'Grammage', group: 'material', valueType: 'single-choice', optionSource: 'catalog', sortOrder: 70 },
  [CORE_DIMENSION_KEYS.finish]: { key: 'finish', label: 'Finition', group: 'finishing', valueType: 'multi-choice', optionSource: 'finishes', sortOrder: 80 },
  [CORE_DIMENSION_KEYS.quantity]: { key: 'quantity', label: 'Quantité', group: 'quantity', valueType: 'single-choice', optionSource: 'catalog', sortOrder: 90 },
}

/** Physical dimensions typed by the customer — a kind of answer, not a value list. */
const DIMENSIONS_DEFINITION: DimensionDefinition = {
  key: 'dimensions',
  label: 'Dimensions',
  group: 'size',
  valueType: 'dimensions',
  optionSource: 'custom',
  sortOrder: 15,
}

export function normalizeTerm(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.:;,\s]+$/g, '')
    .trim()
}

export function slugifyTerm(raw: string): string {
  return normalizeTerm(raw)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Reviewed synonyms → core dimension key. Keys are `normalizeTerm` output. */
const CORE_SYNONYMS: Record<string, string> = {
  format: CORE_DIMENSION_KEYS.format,
  formats: CORE_DIMENSION_KEYS.format,
  orientation: CORE_DIMENSION_KEYS.orientation,
  'nombre de pages': CORE_DIMENSION_KEYS.pageCount,
  pagination: CORE_DIMENSION_KEYS.pageCount,
  'recto-verso': CORE_DIMENSION_KEYS.printSides,
  'recto verso': CORE_DIMENSION_KEYS.printSides,
  support: CORE_DIMENSION_KEYS.material,
  supports: CORE_DIMENSION_KEYS.material,
  grammage: CORE_DIMENSION_KEYS.grammage,
  finition: CORE_DIMENSION_KEYS.finish,
  finitions: CORE_DIMENSION_KEYS.finish,
  quantite: CORE_DIMENSION_KEYS.quantity,
}

/** Terms that overlap several concepts: kept separate and sent to review. */
const AMBIGUOUS_TERMS: Record<string, string> = {
  papier: 'Peut désigner le support (dimension « Support ») ou un papier intérieur : à confirmer.',
  carton: 'Peut désigner le support (dimension « Support ») ou la structure d’un emballage : à confirmer.',
  matiere: 'Recoupe « Support » sans être garantie équivalente : à confirmer.',
  materiaux: 'Recoupe « Support » sans être garantie équivalente : à confirmer.',
  matieres: 'Recoupe « Support » sans être garantie équivalente : à confirmer.',
  impression: 'Peut désigner le recto-verso, le mode d’impression ou la couleur : à confirmer.',
  couleur: 'Peut désigner le mode colorimétrique ou les couleurs d’un produit : à confirmer.',
  couleurs: 'Peut désigner le mode colorimétrique ou les couleurs d’un produit : à confirmer.',
  mesures: 'Recoupe « Dimensions » sans être garantie équivalente : à confirmer.',
  surface: 'Recoupe « Dimensions » ou « Support » : à confirmer.',
}

/** Terms whose meaning is exactly "typed physical dimensions". */
const DIMENSIONS_TERMS = new Set(['dimensions'])

const GROUP_KEYWORDS: [DimensionGroup, RegExp][] = [
  ['quantity', /(quantite|tirage|volume)/],
  ['finishing', /(finition|pelliculage|vernis|dorure|gaufrage|coins)/],
  ['application', /(pose|adhesif|fixation|montage|installation|retrait|exposition|environnement|usage|transport|accroche|eclairage)/],
  ['construction', /(reliure|couverture|pagination|pages|feuille|feuillet|pli|dos\b|collage|rabat|encoche|decoupe|perforation|agrafage|soufflet|poignee|fond\b|renfort|structure|assemblage|chapitres|onglets|intercalaires|elastique|fermeture|fenetre|volets|calage|montage)/],
  ['material', /(support|papier|carton|matiere|materiau|grammage|vinyle|barriere|laminage|transparence|adhesif)/],
  ['print', /(impression|couleur|recto|orientation|rendu|numerotation|variables|personnalisation|code)/],
  ['size', /(format|dimension|largeur|hauteur|laize|mesure|forme|surface|taille)/],
]

/** Keyword → group; deterministic, defaults to `other`. Group is only a filter, never a value. */
export function inferGroup(slug: string): DimensionGroup {
  for (const [group, pattern] of GROUP_KEYWORDS) if (pattern.test(slug)) return group
  return 'other'
}

function capitalize(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

/**
 * Raw master-content term → canonical dimension. See the policy at the top
 * of this file.
 */
export function canonicalizeDimension(raw: string): CanonicalDimension {
  const term = normalizeTerm(raw)

  const coreKey = CORE_SYNONYMS[term]
  if (coreKey) {
    return { raw, definition: CORE_DIMENSIONS[coreKey], confidence: 'mapped', note: `Synonyme révisé de « ${CORE_DIMENSIONS[coreKey].label} ».` }
  }
  if (DIMENSIONS_TERMS.has(term)) return { raw, definition: DIMENSIONS_DEFINITION, confidence: 'mapped' }

  const slug = slugifyTerm(raw)
  const definition: DimensionDefinition = {
    key: slug,
    label: capitalize(raw),
    group: inferGroup(slug),
    valueType: 'single-choice',
    optionSource: 'catalog',
    sortOrder: 200,
  }

  const ambiguousNote = AMBIGUOUS_TERMS[term]
  if (ambiguousNote) return { raw, definition, confidence: 'ambiguous', note: ambiguousNote }
  if (/[/()]| ou /.test(raw)) {
    return { raw, definition, confidence: 'ambiguous', note: 'Le terme regroupe plusieurs notions : à scinder ou confirmer.' }
  }
  return { raw, definition, confidence: 'exact' }
}

/** Every dimension the tooling may create without human input: the core ones + `dimensions`. */
export const BUILT_IN_DEFINITIONS: DimensionDefinition[] = [...Object.values(CORE_DIMENSIONS), DIMENSIONS_DEFINITION]

export function isCoreKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(CORE_DIMENSIONS, key)
}
