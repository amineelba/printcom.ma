import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

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
  ],
})
