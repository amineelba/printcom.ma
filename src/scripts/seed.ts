/**
 * CLI entrypoint for the seed. See src/lib/seed/runSeed.ts for the actual
 * (idempotent, unit-testable) seeding logic.
 */
import 'dotenv/config'
import { getPayload as getPayloadInstance } from 'payload'
import config from '../payload.config'
import { runSeed } from '../lib/seed/runSeed'

async function main() {
  const payload = await getPayloadInstance({ config })
  await runSeed(payload)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
