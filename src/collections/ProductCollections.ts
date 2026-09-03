import type { Access, CollectionConfig } from 'payload'
import { isAdminOrContentManager, isStaffUser } from '@/lib/payload/access'

/**
 * Transversal semantic merchandising groupings (e.g. "Ramadan",
 * "Événementiel") — a curated context in which existing Products may be
 * surfaced, independent of their catalogue ownership (`primaryCategory`).
 *
 * Deliberately NOT a public page/route: no `seoFields`, no slug field
 * implying a URL (`key` is an internal machine-readable identifier only —
 * never used to build a frontend path), no rich body. See CLAUDE.md /
 * the architecture migration doc for why: a Product's canonical URL is
 * always `/produits/<slug>`, never `/collections/<key>/<slug>`.
 *
 * Lifecycle (`status`) is intentionally its own draft/active/archived
 * scale, independent of whether the Homepage composition layer
 * (`Homepage.collectionBoard.collections`) currently chooses to surface a
 * given collection — an "active" collection is simply eligible to be
 * curated somewhere; nothing here decides where.
 */
const publicReadActive: Access = ({ req }) => {
  if (isStaffUser(req)) return true
  return { status: { equals: 'active' } }
}

export const ProductCollections: CollectionConfig = {
  slug: 'product-collections',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'key', 'status', 'order'],
    description: 'Regroupements transversaux de produits (campagnes, thèmes) — jamais une page publique.',
  },
  access: {
    read: publicReadActive,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Identifiant technique interne (ex. "ramadan"). Ne génère aucune URL publique — un produit reste uniquement accessible via /produits/<slug>.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archivée', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Cycle de vie de ce regroupement — indépendant de sa mise en avant sur une page donnée.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
