import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_quote_requests_configuration_orientation" ADD VALUE 'square';
  ALTER TABLE "quote_requests" ADD COLUMN "configuration_page_count_label" varchar;
  ALTER TABLE "quote_requests" ADD COLUMN "configuration_quantity_label" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quote_requests" ALTER COLUMN "configuration_orientation" SET DATA TYPE text;
  DROP TYPE "public"."enum_quote_requests_configuration_orientation";
  CREATE TYPE "public"."enum_quote_requests_configuration_orientation" AS ENUM('portrait', 'landscape');
  ALTER TABLE "quote_requests" ALTER COLUMN "configuration_orientation" SET DATA TYPE "public"."enum_quote_requests_configuration_orientation" USING "configuration_orientation"::"public"."enum_quote_requests_configuration_orientation";
  ALTER TABLE "quote_requests" DROP COLUMN "configuration_page_count_label";
  ALTER TABLE "quote_requests" DROP COLUMN "configuration_quantity_label";`)
}
