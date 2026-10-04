/**
 * pnpm configurator:export-review [--format csv|json] [--out data/configurator]
 *
 * Read-only. Exports the bulk review dataset: one row per allowed value, one
 * empty-value row per dimension still awaiting values. Edit it in a
 * spreadsheet, then load it with configurator:import-review.
 */
import 'dotenv/config'
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../payload.config'
import { planProducts } from '../lib/configurator-schema/backfillPlan'
import { OUTPUT_DIR_DEFAULT, parseArgs, resolveMasterContentPath, writeOutput } from '../lib/configurator-schema/cli'
import { loadData } from '../lib/configurator-schema/db'
import { buildExportRows, toCsv } from '../lib/configurator-schema/reviewWorkflow'
import { parseMasterContent } from '../lib/configurator-schema/sources'

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const format = args.values.get('format') === 'json' ? 'json' : 'csv'
  const outDir = args.values.get('out') ?? OUTPUT_DIR_DEFAULT
  const masterPath = resolveMasterContentPath(args)
  const master = masterPath ? parseMasterContent(fs.readFileSync(masterPath, 'utf8')) : undefined

  const payload = await getPayload({ config })
  const data = await loadData(payload)
  const plans = planProducts(data.snapshots, { master })

  const dimensionLabels = new Map([...data.registry.dimensionsByKey.values()].map((dimension) => [dimension.key, dimension.label]))
  const optionLabels = new Map([...data.registry.options.entries()].map(([key, option]) => [key, option.label]))
  // Dimensions a backfill would create are labelled from the plans.
  for (const plan of plans) for (const row of plan.rows) if (!dimensionLabels.has(row.dimension.key)) dimensionLabels.set(row.dimension.key, row.dimension.label)

  const rows = buildExportRows(data.snapshots, plans, data.lookup, dimensionLabels, optionLabels)
  const file = writeOutput(outDir, `review-export.${format}`, format === 'json' ? JSON.stringify(rows, null, 2) : toCsv(rows))
  console.log(`Exported ${rows.length} rows for ${data.snapshots.length} products → ${file}`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
