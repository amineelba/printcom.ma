import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_quote_requests_files_design_source" AS ENUM('client', 'printcom');
  ALTER TABLE "quote_requests" ALTER COLUMN "contact_company" DROP NOT NULL;
  ALTER TABLE "quote_requests" ADD COLUMN "files_design_source" "enum_quote_requests_files_design_source";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- Rows created by the optional-company checkout have NULL here; backfill
  -- with an empty string so the NOT NULL constraint can be restored.
  UPDATE "quote_requests" SET "contact_company" = '' WHERE "contact_company" IS NULL;
  ALTER TABLE "quote_requests" ALTER COLUMN "contact_company" SET NOT NULL;
  ALTER TABLE "quote_requests" DROP COLUMN "files_design_source";
  DROP TYPE "public"."enum_quote_requests_files_design_source";`)
}
