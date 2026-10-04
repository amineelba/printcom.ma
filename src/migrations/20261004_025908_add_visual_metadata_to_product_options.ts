import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_available_formats" ADD COLUMN "description" varchar;
  ALTER TABLE "products_available_formats" ADD COLUMN "image_id" integer;
  ALTER TABLE "products_available_formats" ADD COLUMN "preview_image_id" integer;
  ALTER TABLE "products_page_count_options" ADD COLUMN "description" varchar;
  ALTER TABLE "products_page_count_options" ADD COLUMN "image_id" integer;
  ALTER TABLE "products_page_count_options" ADD COLUMN "preview_image_id" integer;
  ALTER TABLE "products_grammages" ADD COLUMN "description" varchar;
  ALTER TABLE "products_grammages" ADD COLUMN "image_id" integer;
  ALTER TABLE "products_grammages" ADD COLUMN "preview_image_id" integer;
  ALTER TABLE "products_quantities" ADD COLUMN "description" varchar;
  ALTER TABLE "products_quantities" ADD COLUMN "image_id" integer;
  ALTER TABLE "products_quantities" ADD COLUMN "preview_image_id" integer;
  ALTER TABLE "products_available_formats" ADD CONSTRAINT "products_available_formats_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_available_formats" ADD CONSTRAINT "products_available_formats_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_page_count_options" ADD CONSTRAINT "products_page_count_options_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_page_count_options" ADD CONSTRAINT "products_page_count_options_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_grammages" ADD CONSTRAINT "products_grammages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_grammages" ADD CONSTRAINT "products_grammages_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_quantities" ADD CONSTRAINT "products_quantities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_quantities" ADD CONSTRAINT "products_quantities_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_available_formats_image_idx" ON "products_available_formats" USING btree ("image_id");
  CREATE INDEX "products_available_formats_preview_image_idx" ON "products_available_formats" USING btree ("preview_image_id");
  CREATE INDEX "products_page_count_options_image_idx" ON "products_page_count_options" USING btree ("image_id");
  CREATE INDEX "products_page_count_options_preview_image_idx" ON "products_page_count_options" USING btree ("preview_image_id");
  CREATE INDEX "products_grammages_image_idx" ON "products_grammages" USING btree ("image_id");
  CREATE INDEX "products_grammages_preview_image_idx" ON "products_grammages" USING btree ("preview_image_id");
  CREATE INDEX "products_quantities_image_idx" ON "products_quantities" USING btree ("image_id");
  CREATE INDEX "products_quantities_preview_image_idx" ON "products_quantities" USING btree ("preview_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_available_formats" DROP CONSTRAINT "products_available_formats_image_id_media_id_fk";
  
  ALTER TABLE "products_available_formats" DROP CONSTRAINT "products_available_formats_preview_image_id_media_id_fk";
  
  ALTER TABLE "products_page_count_options" DROP CONSTRAINT "products_page_count_options_image_id_media_id_fk";
  
  ALTER TABLE "products_page_count_options" DROP CONSTRAINT "products_page_count_options_preview_image_id_media_id_fk";
  
  ALTER TABLE "products_grammages" DROP CONSTRAINT "products_grammages_image_id_media_id_fk";
  
  ALTER TABLE "products_grammages" DROP CONSTRAINT "products_grammages_preview_image_id_media_id_fk";
  
  ALTER TABLE "products_quantities" DROP CONSTRAINT "products_quantities_image_id_media_id_fk";
  
  ALTER TABLE "products_quantities" DROP CONSTRAINT "products_quantities_preview_image_id_media_id_fk";
  
  DROP INDEX "products_available_formats_image_idx";
  DROP INDEX "products_available_formats_preview_image_idx";
  DROP INDEX "products_page_count_options_image_idx";
  DROP INDEX "products_page_count_options_preview_image_idx";
  DROP INDEX "products_grammages_image_idx";
  DROP INDEX "products_grammages_preview_image_idx";
  DROP INDEX "products_quantities_image_idx";
  DROP INDEX "products_quantities_preview_image_idx";
  ALTER TABLE "products_available_formats" DROP COLUMN "description";
  ALTER TABLE "products_available_formats" DROP COLUMN "image_id";
  ALTER TABLE "products_available_formats" DROP COLUMN "preview_image_id";
  ALTER TABLE "products_page_count_options" DROP COLUMN "description";
  ALTER TABLE "products_page_count_options" DROP COLUMN "image_id";
  ALTER TABLE "products_page_count_options" DROP COLUMN "preview_image_id";
  ALTER TABLE "products_grammages" DROP COLUMN "description";
  ALTER TABLE "products_grammages" DROP COLUMN "image_id";
  ALTER TABLE "products_grammages" DROP COLUMN "preview_image_id";
  ALTER TABLE "products_quantities" DROP COLUMN "description";
  ALTER TABLE "products_quantities" DROP COLUMN "image_id";
  ALTER TABLE "products_quantities" DROP COLUMN "preview_image_id";`)
}
