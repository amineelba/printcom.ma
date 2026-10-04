import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_configuration_schema_enum_options" AS ENUM('portrait', 'landscape', 'square', 'single', 'double', 'cmyk', 'bw', 'pantone');
  CREATE TYPE "public"."enum_products_configuration_schema_data_status" AS ENUM('confirmed', 'needs-review', 'unsupported');
  CREATE TYPE "public"."enum_products_configuration_schema_source" AS ENUM('existing-cms', 'existing-product-field', 'master-content', 'seed-source', 'shared-material', 'shared-finish', 'existing-enum', 'manual', 'import');
  CREATE TYPE "public"."enum_configurator_dimensions_group" AS ENUM('size', 'print', 'material', 'construction', 'finishing', 'application', 'quantity', 'other');
  CREATE TYPE "public"."enum_configurator_dimensions_value_type" AS ENUM('single-choice', 'multi-choice', 'dimensions', 'number', 'text', 'boolean');
  CREATE TYPE "public"."enum_configurator_dimensions_option_source" AS ENUM('catalog', 'materials', 'finishes', 'enum', 'custom');
  CREATE TYPE "public"."enum_configurator_dimensions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_configurator_options_verification_status" AS ENUM('unverified', 'confirmed', 'unavailable');
  CREATE TYPE "public"."enum_configurator_options_status" AS ENUM('draft', 'published');
  CREATE TABLE "products_configuration_schema_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option_id" integer NOT NULL,
  	"description_override" varchar,
  	"image_override_id" integer,
  	"preview_image_id" integer
  );
  
  CREATE TABLE "products_configuration_schema_enum_options" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_products_configuration_schema_enum_options",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_configuration_schema" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"dimension_id" integer NOT NULL,
  	"label_override" varchar,
  	"help_text_override" varchar,
  	"data_status" "enum_products_configuration_schema_data_status" DEFAULT 'needs-review' NOT NULL,
  	"source" "enum_products_configuration_schema_source",
  	"allow_custom_value" boolean DEFAULT false,
  	"required_for_configuration" boolean DEFAULT false
  );
  
  CREATE TABLE "configurator_dimensions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"group" "enum_configurator_dimensions_group" DEFAULT 'other' NOT NULL,
  	"value_type" "enum_configurator_dimensions_value_type" DEFAULT 'single-choice' NOT NULL,
  	"option_source" "enum_configurator_dimensions_option_source" DEFAULT 'catalog' NOT NULL,
  	"unit" varchar,
  	"public_help_text" varchar,
  	"sort_order" numeric DEFAULT 100,
  	"status" "enum_configurator_dimensions_status" DEFAULT 'draft' NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "configurator_options" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"dimension_id" integer NOT NULL,
  	"label" varchar NOT NULL,
  	"machine_value" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"verification_status" "enum_configurator_options_verification_status" DEFAULT 'unverified' NOT NULL,
  	"status" "enum_configurator_options_status" DEFAULT 'draft' NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quote_requests_configuration_technical_selections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"value_label" varchar NOT NULL,
  	"numeric_value" numeric,
  	"unit" varchar
  );
  
  CREATE TABLE "quote_requests_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "configurator_dimensions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "configurator_options_id" integer;
  ALTER TABLE "products_configuration_schema_options" ADD CONSTRAINT "products_configuration_schema_options_option_id_configurator_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."configurator_options"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_configuration_schema_options" ADD CONSTRAINT "products_configuration_schema_options_image_override_id_media_id_fk" FOREIGN KEY ("image_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_configuration_schema_options" ADD CONSTRAINT "products_configuration_schema_options_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_configuration_schema_options" ADD CONSTRAINT "products_configuration_schema_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_configuration_schema"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_configuration_schema_enum_options" ADD CONSTRAINT "products_configuration_schema_enum_options_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products_configuration_schema"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_configuration_schema" ADD CONSTRAINT "products_configuration_schema_dimension_id_configurator_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."configurator_dimensions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_configuration_schema" ADD CONSTRAINT "products_configuration_schema_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_options" ADD CONSTRAINT "configurator_options_dimension_id_configurator_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."configurator_dimensions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "configurator_options" ADD CONSTRAINT "configurator_options_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests_configuration_technical_selections" ADD CONSTRAINT "quote_requests_configuration_technical_selections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_requests_texts" ADD CONSTRAINT "quote_requests_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_configuration_schema_options_order_idx" ON "products_configuration_schema_options" USING btree ("_order");
  CREATE INDEX "products_configuration_schema_options_parent_id_idx" ON "products_configuration_schema_options" USING btree ("_parent_id");
  CREATE INDEX "products_configuration_schema_options_option_idx" ON "products_configuration_schema_options" USING btree ("option_id");
  CREATE INDEX "products_configuration_schema_options_image_override_idx" ON "products_configuration_schema_options" USING btree ("image_override_id");
  CREATE INDEX "products_configuration_schema_options_preview_image_idx" ON "products_configuration_schema_options" USING btree ("preview_image_id");
  CREATE INDEX "products_configuration_schema_enum_options_order_idx" ON "products_configuration_schema_enum_options" USING btree ("order");
  CREATE INDEX "products_configuration_schema_enum_options_parent_idx" ON "products_configuration_schema_enum_options" USING btree ("parent_id");
  CREATE INDEX "products_configuration_schema_order_idx" ON "products_configuration_schema" USING btree ("_order");
  CREATE INDEX "products_configuration_schema_parent_id_idx" ON "products_configuration_schema" USING btree ("_parent_id");
  CREATE INDEX "products_configuration_schema_dimension_idx" ON "products_configuration_schema" USING btree ("dimension_id");
  CREATE UNIQUE INDEX "configurator_dimensions_key_idx" ON "configurator_dimensions" USING btree ("key");
  CREATE INDEX "configurator_dimensions_updated_at_idx" ON "configurator_dimensions" USING btree ("updated_at");
  CREATE INDEX "configurator_dimensions_created_at_idx" ON "configurator_dimensions" USING btree ("created_at");
  CREATE INDEX "configurator_options_dimension_idx" ON "configurator_options" USING btree ("dimension_id");
  CREATE INDEX "configurator_options_machine_value_idx" ON "configurator_options" USING btree ("machine_value");
  CREATE INDEX "configurator_options_image_idx" ON "configurator_options" USING btree ("image_id");
  CREATE INDEX "configurator_options_updated_at_idx" ON "configurator_options" USING btree ("updated_at");
  CREATE INDEX "configurator_options_created_at_idx" ON "configurator_options" USING btree ("created_at");
  CREATE INDEX "quote_requests_configuration_technical_selections_order_idx" ON "quote_requests_configuration_technical_selections" USING btree ("_order");
  CREATE INDEX "quote_requests_configuration_technical_selections_parent_id_idx" ON "quote_requests_configuration_technical_selections" USING btree ("_parent_id");
  CREATE INDEX "quote_requests_texts_order_parent" ON "quote_requests_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_configurator_dimensions_fk" FOREIGN KEY ("configurator_dimensions_id") REFERENCES "public"."configurator_dimensions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_configurator_options_fk" FOREIGN KEY ("configurator_options_id") REFERENCES "public"."configurator_options"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_configurator_dimensions_id_idx" ON "payload_locked_documents_rels" USING btree ("configurator_dimensions_id");
  CREATE INDEX "payload_locked_documents_rels_configurator_options_id_idx" ON "payload_locked_documents_rels" USING btree ("configurator_options_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_configuration_schema_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_configuration_schema_enum_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_configuration_schema" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_dimensions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quote_requests_configuration_technical_selections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quote_requests_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_configuration_schema_options" CASCADE;
  DROP TABLE "products_configuration_schema_enum_options" CASCADE;
  DROP TABLE "products_configuration_schema" CASCADE;
  DROP TABLE "configurator_dimensions" CASCADE;
  DROP TABLE "configurator_options" CASCADE;
  DROP TABLE "quote_requests_configuration_technical_selections" CASCADE;
  DROP TABLE "quote_requests_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_configurator_dimensions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_configurator_options_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_configurator_dimensions_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_configurator_options_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "configurator_dimensions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "configurator_options_id";
  DROP TYPE "public"."enum_products_configuration_schema_enum_options";
  DROP TYPE "public"."enum_products_configuration_schema_data_status";
  DROP TYPE "public"."enum_products_configuration_schema_source";
  DROP TYPE "public"."enum_configurator_dimensions_group";
  DROP TYPE "public"."enum_configurator_dimensions_value_type";
  DROP TYPE "public"."enum_configurator_dimensions_option_source";
  DROP TYPE "public"."enum_configurator_dimensions_status";
  DROP TYPE "public"."enum_configurator_options_verification_status";
  DROP TYPE "public"."enum_configurator_options_status";`)
}
