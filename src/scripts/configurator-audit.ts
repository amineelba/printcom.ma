/**
 * pnpm configurator:audit [--master <path>] [--out data/configurator]
 *
 * Read-only. Audits every product against its authoritative dimension
 * source and writes the audit + review queue (JSON for tools, Markdown for
 * people). No secrets, no customer data, no timestamps (stable output).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { auditProducts, collectReviewItems, renderAuditMarkdown, renderReviewMarkdown } from '../lib/configurator-schema/audit'
import { planProducts } from '../lib/configurator-schema/backfillPlan'
import { OUTPUT_DIR_DEFAULT, describeDatabaseTarget, parseArgs, resolveMasterContentPath, writeOutput } from '../lib/configurator-schema/cli'
import { loadData } from '../lib/configurator-schema/db'
import { parseMasterContent } from '../lib/configurator-schema/sources'
import fs from 'node:fs'

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const outDir = args.values.get('out') ?? OUTPUT_DIR_DEFAULT
  const masterPath = resolveMasterContentPath(args)
  const master = masterPath ? parseMasterContent(fs.readFileSync(masterPath, 'utf8')) : undefined

  const payload = await getPayload({ config })
  const data = await loadData(payload)
  const plans = planProducts(data.snapshots, { master })
  const audit = auditProducts(data.snapshots, plans)
  const review = collectReviewItems(plans)

  const files = [
    writeOutput(outDir, 'product-audit.json', JSON.stringify(audit, null, 2)),
    writeOutput(outDir, 'product-audit.md', renderAuditMarkdown(audit)),
    writeOutput(outDir, 'review-required.json', JSON.stringify(review, null, 2)),
    writeOutput(outDir, 'review-required.md', renderReviewMarkdown(review)),
  ]

  const target = describeDatabaseTarget()
  const { summary } = audit
  console.log(`Database: ${target.host}/${target.database}${masterPath ? `  (master content: ${masterPath})` : ''}`)
  console.log(`Total products:                              ${summary.total}`)
  console.log(`Products with authoritative dimension source: ${summary.withAuthoritativeSource}`)
  console.log(`Products with complete usable configurator:   ${summary.completeUsableConfigurator}`)
  console.log(`Products partially backfilled:                ${summary.partiallyBackfilled}`)
  console.log(`Products requiring review:                    ${summary.requiringReview}`)
  console.log(`Products with no source:                      ${summary.withoutSource}`)
  console.log('\nPer category:')
  for (const [category, counts] of Object.entries(audit.categories)) {
    console.log(`  ${category}: ${counts.total} products, ${counts.withAuthoritativeSource} with source, ${counts.requiringReview} to review, ${counts.withoutSource} without source`)
  }
  console.log(`\nReview items: ${review.length}`)
  for (const file of files) console.log(`Wrote ${file}`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
