/**
 * Vocabulary shared by the Payload collections, the audit/backfill/import
 * tooling and the frontend normalizer.
 */

export const DIMENSION_GROUPS = [
  'size',
  'print',
  'material',
  'construction',
  'finishing',
  'application',
  'quantity',
  'other',
] as const
export type DimensionGroup = (typeof DIMENSION_GROUPS)[number]

export const DIMENSION_VALUE_TYPES = ['single-choice', 'multi-choice', 'dimensions', 'number', 'text', 'boolean'] as const
export type DimensionValueType = (typeof DIMENSION_VALUE_TYPES)[number]

export const DIMENSION_OPTION_SOURCES = ['catalog', 'materials', 'finishes', 'enum', 'custom'] as const
export type DimensionOptionSource = (typeof DIMENSION_OPTION_SOURCES)[number]

export const DIMENSION_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Review state of one dimension on one product. Never conflate with "not applicable". */
export const DATA_STATUSES = ['confirmed', 'needs-review', 'unsupported'] as const
export type DataStatus = (typeof DATA_STATUSES)[number]

/** Where a dimension row / value came from. */
export const PROVENANCE_TYPES = [
  'existing-cms',
  'existing-product-field',
  'master-content',
  'seed-source',
  'shared-material',
  'shared-finish',
  'existing-enum',
  'manual',
  'import',
] as const
export type Provenance = (typeof PROVENANCE_TYPES)[number]

/** Every enum value a product-specific `enumOptions` list may contain. */
export const ENUM_OPTION_VALUES = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Paysage' },
  { value: 'square', label: 'Carré' },
  { value: 'single', label: 'Recto' },
  { value: 'double', label: 'Recto-verso' },
  { value: 'cmyk', label: 'Quadrichromie (CMJN)' },
  { value: 'bw', label: 'Noir et blanc' },
  { value: 'pantone', label: 'Pantone' },
] as const
