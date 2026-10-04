import type { ConfiguratorGroupKey } from './types'

/** Public French titles for each configurator group. */
export const GROUP_LABELS: Record<ConfiguratorGroupKey, string> = {
  format: 'Format',
  orientation: 'Orientation',
  pageCount: 'Nombre de pages',
  printSides: 'Impression',
  colorMode: 'Couleur',
  material: 'Support',
  grammage: 'Grammage',
  finish: 'Finition',
  quantity: 'Quantité',
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
