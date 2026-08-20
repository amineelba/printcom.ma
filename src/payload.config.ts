import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import type { Config } from 'payload'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { builtInTemplates, invoicePdf } from 'payload-invoicepdf'

import { isAdmin, isAdminOrContentManager, isAdminOrSalesManager } from './lib/payload/access'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { PrivateQuoteFiles } from './collections/PrivateQuoteFiles'

import { ProductCategories } from './collections/ProductCategories'
import { Products } from './collections/Products'
import { Services } from './collections/Services'
import { Solutions } from './collections/Solutions'
import { Sectors } from './collections/Sectors'
import { Technologies } from './collections/Technologies'
import { Materials } from './collections/Materials'
import { Finishes } from './collections/Finishes'

import { Resources } from './collections/Resources'
import { FAQs } from './collections/FAQs'
import { Testimonials } from './collections/Testimonials'
import { Clients } from './collections/Clients'
import { ProductionSites } from './collections/ProductionSites'
import { Machines } from './collections/Machines'

import { QuoteRequests } from './collections/QuoteRequests'
import { ContactRequests } from './collections/ContactRequests'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'

import { LegalDocuments } from './collections/LegalDocuments'
import { Redirects } from './collections/Redirects'

import { SiteSettings } from './globals/SiteSettings'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { Homepage } from './globals/Homepage'
import { ContactSettings } from './globals/ContactSettings'
import { QuoteSettings } from './globals/QuoteSettings'
import { SEODefaults } from './globals/SEODefaults'
import { SocialLinks } from './globals/SocialLinks'
import { DesignSettings } from './globals/DesignSettings'

import { importExportPlugin } from '@payloadcms/plugin-import-export'
import type { CollectionSlug } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

// Structural/catalogue content only — deliberately excludes quote-requests,
// contact-requests, newsletter-subscribers, private-quote-files and users,
// so bulk CSV/JSON import-export never touches PII or commercial data.
const importExportSlugs: CollectionSlug[] = [
  'media',
  'products',
  'services',
  'solutions',
  'sectors',
  'technologies',
  'materials',
  'finishes',
  'resources',
  'faqs',
  'testimonials',
  'clients',
  'machines',
  'redirects',
]

/**
 * @payloadcms/plugin-import-export adds `imports`/`exports` collections
 * with only `access.update: () => false` set — `read`/`create`/`delete`
 * are left at Payload's default (public), which would let an anonymous
 * caller upload a CSV via the `imports` collection and have it bulk-write
 * into products/services/etc. Same class of gap as payload-invoicepdf
 * (see secureInvoicePdfAccess below and docs/access-control.md) — locked
 * to content-manager/admin, who are the roles that already manage this
 * catalogue content.
 */
function secureImportExportAccess(config: Config): Config {
  const importExportCollections = new Set(['imports', 'exports'])

  return {
    ...config,
    collections: config.collections?.map((collection) =>
      importExportCollections.has(collection.slug)
        ? {
            ...collection,
            access: {
              ...collection.access,
              read: isAdminOrContentManager,
              create: isAdminOrContentManager,
              delete: isAdminOrContentManager,
            },
          }
        : collection,
    ),
  }
}

/**
 * payload-invoicepdf ships its `invoices`/`quotes` collections and
 * `shop-info` global with no `access` config of their own, which means
 * Payload's default (public read/write) would apply — unacceptable for
 * documents holding client PII, pricing and bank details. This runs as
 * the next plugin in the chain (plugins compose left-to-right) and locks
 * them down to the sales team, matching how quote-requests/contact-requests
 * are treated elsewhere in this config (see docs/access-control.md).
 */
function secureInvoicePdfAccess(config: Config): Config {
  const salesManagedCollections = new Set(['invoices', 'quotes'])

  return {
    ...config,
    collections: config.collections?.map((collection) =>
      salesManagedCollections.has(collection.slug)
        ? {
            ...collection,
            access: {
              read: isAdminOrSalesManager,
              create: isAdminOrSalesManager,
              update: isAdminOrSalesManager,
              delete: isAdmin,
            },
          }
        : collection,
    ),
    globals: config.globals?.map((global) =>
      global.slug === 'shop-info'
        ? { ...global, access: { read: isAdminOrSalesManager, update: isAdmin } }
        : global,
    ),
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Printcom Admin',
    },
  },
  collections: [
    Users,
    Media,
    PrivateQuoteFiles,

    ProductCategories,
    Products,
    Services,
    Solutions,
    Sectors,
    Technologies,
    Materials,
    Finishes,

    Resources,
    FAQs,
    Testimonials,
    Clients,
    ProductionSites,
    Machines,

    QuoteRequests,
    ContactRequests,
    NewsletterSubscribers,

    LegalDocuments,
    Redirects,
  ],
  globals: [
    SiteSettings,
    Header,
    Footer,
    Homepage,
    ContactSettings,
    QuoteSettings,
    SEODefaults,
    SocialLinks,
    DesignSettings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI,
    },
    // Always migration-driven, even in dev: schema changes are applied via
    // explicit `payload migrate` runs (see docs/deployment.md), never via
    // implicit dev-mode schema push. This keeps local/staging/production
    // parity and avoids drift between formal migrations and an
    // auto-synced schema.
    push: false,
  }),
  sharp,
  // Single-language (French) content model — Payload localization is not
  // engaged since no bilingual requirement exists in the brief.
  plugins: [
    // Only registers the remote storage adapter when a token is configured;
    // otherwise Payload keeps local-disk storage for local development.
    ...(blobToken
      ? [
          vercelBlobStorage({
            enabled: true,
            collections: {
              media: true,
            },
            token: blobToken,
          }),
        ]
      : []),
    importExportPlugin({
      collections: importExportSlugs.map((slug) => ({ slug })),
    }),
    secureImportExportAccess,
    // Internal back-office invoicing/quoting tool for the sales team — adds
    // `invoices`, `quotes` (collections) and `shop-info` (global). This is
    // staff-facing PDF generation for real client invoices after a
    // quote-request has been studied; it does not add pricing, checkout or
    // e-commerce to the public site, and nothing it produces is exposed on
    // the public frontend. `productFieldMapping.price` points at
    // `products.indicativePrice`, the existing admin-only field that is
    // empty/disabled unless a human deliberately fills it in per product —
    // no price is invented or auto-populated (see CLAUDE.md: no automatic
    // or final pricing).
    invoicePdf({
      productCollection: 'products',
      productFieldMapping: {
        name: 'title',
        price: 'indicativePrice',
        description: 'shortDescription',
        image: 'primaryImage',
      },
      templates: builtInTemplates,
      currency: 'MAD',
      invoiceNumberPrefix: 'PC-FACT',
      quoteNumberPrefix: 'PC-DEVISPDF',
    }),
    secureInvoicePdfAccess,
  ],
})
