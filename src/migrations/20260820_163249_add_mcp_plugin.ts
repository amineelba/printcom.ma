import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"product_categories_find" boolean DEFAULT false,
  	"product_categories_create" boolean DEFAULT false,
  	"product_categories_update" boolean DEFAULT false,
  	"product_categories_delete" boolean DEFAULT false,
  	"products_find" boolean DEFAULT false,
  	"products_create" boolean DEFAULT false,
  	"products_update" boolean DEFAULT false,
  	"products_delete" boolean DEFAULT false,
  	"services_find" boolean DEFAULT false,
  	"services_create" boolean DEFAULT false,
  	"services_update" boolean DEFAULT false,
  	"services_delete" boolean DEFAULT false,
  	"solutions_find" boolean DEFAULT false,
  	"solutions_create" boolean DEFAULT false,
  	"solutions_update" boolean DEFAULT false,
  	"solutions_delete" boolean DEFAULT false,
  	"sectors_find" boolean DEFAULT false,
  	"sectors_create" boolean DEFAULT false,
  	"sectors_update" boolean DEFAULT false,
  	"sectors_delete" boolean DEFAULT false,
  	"technologies_find" boolean DEFAULT false,
  	"technologies_create" boolean DEFAULT false,
  	"technologies_update" boolean DEFAULT false,
  	"technologies_delete" boolean DEFAULT false,
  	"materials_find" boolean DEFAULT false,
  	"materials_create" boolean DEFAULT false,
  	"materials_update" boolean DEFAULT false,
  	"materials_delete" boolean DEFAULT false,
  	"finishes_find" boolean DEFAULT false,
  	"finishes_create" boolean DEFAULT false,
  	"finishes_update" boolean DEFAULT false,
  	"finishes_delete" boolean DEFAULT false,
  	"resources_find" boolean DEFAULT false,
  	"resources_create" boolean DEFAULT false,
  	"resources_update" boolean DEFAULT false,
  	"resources_delete" boolean DEFAULT false,
  	"faqs_find" boolean DEFAULT false,
  	"faqs_create" boolean DEFAULT false,
  	"faqs_update" boolean DEFAULT false,
  	"faqs_delete" boolean DEFAULT false,
  	"testimonials_find" boolean DEFAULT false,
  	"testimonials_create" boolean DEFAULT false,
  	"testimonials_update" boolean DEFAULT false,
  	"testimonials_delete" boolean DEFAULT false,
  	"clients_find" boolean DEFAULT false,
  	"clients_create" boolean DEFAULT false,
  	"clients_update" boolean DEFAULT false,
  	"clients_delete" boolean DEFAULT false,
  	"production_sites_find" boolean DEFAULT false,
  	"production_sites_create" boolean DEFAULT false,
  	"production_sites_update" boolean DEFAULT false,
  	"production_sites_delete" boolean DEFAULT false,
  	"machines_find" boolean DEFAULT false,
  	"machines_create" boolean DEFAULT false,
  	"machines_update" boolean DEFAULT false,
  	"machines_delete" boolean DEFAULT false,
  	"legal_documents_find" boolean DEFAULT false,
  	"legal_documents_create" boolean DEFAULT false,
  	"legal_documents_update" boolean DEFAULT false,
  	"legal_documents_delete" boolean DEFAULT false,
  	"redirects_find" boolean DEFAULT false,
  	"redirects_create" boolean DEFAULT false,
  	"redirects_update" boolean DEFAULT false,
  	"redirects_delete" boolean DEFAULT false,
  	"media_find" boolean DEFAULT false,
  	"media_create" boolean DEFAULT false,
  	"media_update" boolean DEFAULT false,
  	"media_delete" boolean DEFAULT false,
  	"site_settings_find" boolean DEFAULT false,
  	"site_settings_update" boolean DEFAULT false,
  	"header_find" boolean DEFAULT false,
  	"header_update" boolean DEFAULT false,
  	"footer_find" boolean DEFAULT false,
  	"footer_update" boolean DEFAULT false,
  	"homepage_find" boolean DEFAULT false,
  	"homepage_update" boolean DEFAULT false,
  	"contact_settings_find" boolean DEFAULT false,
  	"contact_settings_update" boolean DEFAULT false,
  	"quote_settings_find" boolean DEFAULT false,
  	"quote_settings_update" boolean DEFAULT false,
  	"seo_defaults_find" boolean DEFAULT false,
  	"seo_defaults_update" boolean DEFAULT false,
  	"social_links_find" boolean DEFAULT false,
  	"social_links_update" boolean DEFAULT false,
  	"design_settings_find" boolean DEFAULT false,
  	"design_settings_update" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk";
  
  DROP INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";
  DROP INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";`)
}
