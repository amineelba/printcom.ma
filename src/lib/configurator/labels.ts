import { CORE_DIMENSION_KEYS } from './types'

/** Public French titles of the core dimensions (other dimensions bring their own label). */
export const GROUP_LABELS: Record<string, string> = {
  [CORE_DIMENSION_KEYS.format]: 'Format',
  [CORE_DIMENSION_KEYS.orientation]: 'Orientation',
  [CORE_DIMENSION_KEYS.pageCount]: 'Nombre de pages',
  [CORE_DIMENSION_KEYS.printSides]: 'Impression',
  [CORE_DIMENSION_KEYS.colorMode]: 'Couleur',
  [CORE_DIMENSION_KEYS.material]: 'Support',
  [CORE_DIMENSION_KEYS.grammage]: 'Grammage',
  [CORE_DIMENSION_KEYS.finish]: 'Finition',
  [CORE_DIMENSION_KEYS.quantity]: 'Quantité',
}

/**
 * French labels for the select-type fields of `Products`. Mirrors the
 * option labels declared in src/collections/Products.ts (a unit test keeps
 * the two in sync) so the machine values stay the stable identity.
 */
export const ORIENTATION_LABELS: Record<string, string> = {
  portrait: 'Portrait',
  landscape: 'Paysage',
  square: 'Carré',
}

export const PRINT_SIDES_LABELS: Record<string, string> = {
  single: 'Recto',
  double: 'Recto-verso',
}

export const COLOR_MODE_LABELS: Record<string, string> = {
  cmyk: 'Quadrichromie (CMJN)',
  bw: 'Noir et blanc',
  pantone: 'Pantone',
}

export const CUSTOM_FORMAT_LABEL = 'Sur mesure'
export const CUSTOM_FORMAT_HELPER = 'La faisabilité du format sera confirmée par notre équipe.'
export const MULTIPLE_CHOICE_HINT = 'Plusieurs choix possibles'

/**
 * Label maps of the dimensions whose options are fixed enums, by dimension
 * key. A product schema row of one of these dimensions lists enum *values*;
 * the French label always comes from here.
 */
export const ENUM_LABELS_BY_DIMENSION: Record<string, Record<string, string>> = {
  [CORE_DIMENSION_KEYS.orientation]: ORIENTATION_LABELS,
  [CORE_DIMENSION_KEYS.printSides]: PRINT_SIDES_LABELS,
  [CORE_DIMENSION_KEYS.colorMode]: COLOR_MODE_LABELS,
}

export const BOOLEAN_YES_LABEL = 'Oui'
export const MEASURE_HELPER = 'Les dimensions exactes seront confirmées par notre équipe.'
