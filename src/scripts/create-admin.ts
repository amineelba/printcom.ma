/**
 * Bootstraps the first admin user from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Safe to re-run: no-ops if a user with that email already exists.
 */
import 'dotenv/config'
import { getPayload as getPayloadInstance } from 'payload'
import config from '../payload.config'

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment before running this script.')
    process.exit(1)
  }

  const payload = await getPayloadInstance({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.docs.length) {
    payload.logger.info(`Admin user ${email} already exists — nothing to do.`)
    process.exit(0)
  }

  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name: 'Administrateur Printcom',
      role: 'admin',
    },
  })

  payload.logger.info(`Admin user ${email} created.`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
