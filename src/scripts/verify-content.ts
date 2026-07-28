/**
 * Content integrity checks (section 6 rules of truth + section 4
 * forbidden taxonomy). Run in CI or before a deploy. Exits non-zero if a
 * violation is found.
 *
 * This does not replace editorial review — it catches mechanical
 * violations: forbidden collection slugs, "[À confirmer]" leaking into
 * published content, and testimonials/clients published without a
 * recorded consent/authorization flag.
 */
import 'dotenv/config'
import { getPayload as getPayloadInstance } from 'payload'
import config from '../payload.config'

const FORBIDDEN_SLUGS = ['realisations', 'projects', 'portfolio', 'case-studies', 'work']

async function main() {
  const payload = await getPayloadInstance({ config })
  const problems: string[] = []

  const resolvedConfig = await config
  const collectionSlugs: string[] = resolvedConfig.collections.map((c) => c.slug)
  for (const forbidden of FORBIDDEN_SLUGS) {
    if (collectionSlugs.includes(forbidden)) {
      problems.push(`Forbidden collection present in config: "${forbidden}".`)
    }
  }

  const textCollections: Array<{ slug: string; fields: string[] }> = [
    { slug: 'products', fields: ['title', 'shortDescription'] },
    { slug: 'services', fields: ['title', 'shortDescription'] },
    { slug: 'solutions', fields: ['title', 'shortDescription'] },
    { slug: 'sectors', fields: ['title', 'shortDescription'] },
    { slug: 'resources', fields: ['title', 'introduction'] },
    { slug: 'technologies', fields: ['title', 'shortDescription'] },
  ]

  for (const { slug, fields } of textCollections) {
    const result = await payload.find({
      collection: slug as never,
      where: { status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
    })

    for (const doc of result.docs as Array<{ id: number } & Record<string, unknown>>) {
      for (const field of fields) {
        const value = doc[field]
        if (typeof value === 'string' && value.includes('[À confirmer]')) {
          problems.push(`${slug}#${doc.id} field "${field}" contains "[À confirmer]" while published.`)
        }
      }
    }
  }

  const testimonials = await payload.find({
    collection: 'testimonials',
    where: { status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
  })
  for (const doc of testimonials.docs) {
    if (!doc.consentConfirmed) {
      problems.push(`testimonials#${doc.id} is published without consentConfirmed.`)
    }
  }

  const clients = await payload.find({
    collection: 'clients',
    where: { status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
  })
  for (const doc of clients.docs) {
    if (!doc.authorizationConfirmed) {
      problems.push(`clients#${doc.id} is published without authorizationConfirmed.`)
    }
  }

  const technologies = await payload.find({
    collection: 'technologies',
    where: { status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
  })
  for (const doc of technologies.docs) {
    if (doc.verificationStatus !== 'confirmed') {
      problems.push(`technologies#${doc.id} is published but verificationStatus is "${doc.verificationStatus}" (frontend hides it, but this indicates a data-hygiene issue).`)
    }
  }

  if (problems.length) {
    console.error(`Content verification failed with ${problems.length} issue(s):\n`)
    for (const problem of problems) console.error(` - ${problem}`)
    process.exit(1)
  }

  payload.logger.info('Content verification passed — no violations found.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
