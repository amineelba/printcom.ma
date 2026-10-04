import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import {
  DIMENSION_GROUPS,
  DIMENSION_KEY_PATTERN,
  DIMENSION_OPTION_SOURCES,
  DIMENSION_VALUE_TYPES,
} from '@/lib/configurator-schema/constants'

/**
 * Technical Dimension Registry (Sprint 5). One document per kind of technical
 * decision a product can ask the customer about ("Format", "Fenêtre",
 * "Adhésif"…). A dimension defines *what is asked*, never *which values are
 * available* — values live in `configurator-options` (shared) or in each
 * product's own `configurationSchema` allowlist.
 */
export const ConfiguratorDimensions: CollectionConfig = {
  slug: 'configurator-dimensions',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'key', 'group', 'valueType', 'status'],
    description:
      'Registre des dimensions techniques (format, fenêtre, adhésif…). Une dimension décrit une question posée au client ; les valeurs autorisées sont définies produit par produit.',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (value: string | null | undefined) =>
        value && DIMENSION_KEY_PATTERN.test(value) ? true : 'Clé en minuscules, chiffres et tirets (ex. « page-count »).',
      admin: { description: 'Identifiant stable (utilisé par l’import, les liens et les devis). Ne pas modifier après usage.' },
    },
    { name: 'label', type: 'text', required: true, label: 'Libellé public (français)' },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'other',
      options: DIMENSION_GROUPS.map((value) => ({ label: value, value })),
    },
    {
      name: 'valueType',
      type: 'select',
      required: true,
      defaultValue: 'single-choice',
      options: DIMENSION_VALUE_TYPES.map((value) => ({ label: value, value })),
      admin: {
        description:
          'single/multi-choice : liste de valeurs autorisées. dimensions / number / text : saisie du client, uniquement si le produit l’autorise. boolean : oui/non.',
      },
    },
    {
      name: 'optionSource',
      type: 'select',
      required: true,
      defaultValue: 'catalog',
      options: DIMENSION_OPTION_SOURCES.map((value) => ({ label: value, value })),
      admin: {
        description:
          'catalog : valeurs du catalogue d’options. materials / finishes : collections Supports / Finitions. enum : valeurs fixes (orientation, recto-verso, couleur). custom : saisie libre.',
      },
    },
    { name: 'unit', type: 'text', admin: { description: 'Unité affichée pour une valeur numérique (ex. « mm »).' } },
    { name: 'publicHelpText', type: 'text', maxLength: 160, label: 'Aide publique' },
    { name: 'sortOrder', type: 'number', defaultValue: 100 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publié', value: 'published' },
      ],
      admin: { position: 'sidebar', description: 'Une dimension en brouillon n’apparaît dans aucun configurateur.' },
    },
    { name: 'notes', type: 'textarea', admin: { description: 'Notes internes (jamais publiques).' } },
  ],
}
