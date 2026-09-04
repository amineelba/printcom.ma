import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_hero_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"label" varchar
  );
  
  ALTER TABLE "homepage" ADD COLUMN "hero_slider_enabled" boolean DEFAULT false;
  ALTER TABLE "homepage_rels" ADD COLUMN "materials_id" integer;
  ALTER TABLE "homepage_rels" ADD COLUMN "finishes_id" integer;
  ALTER TABLE "homepage_hero_slider_slides" ADD CONSTRAINT "homepage_hero_slider_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_slider_slides" ADD CONSTRAINT "homepage_hero_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_hero_slider_slides_order_idx" ON "homepage_hero_slider_slides" USING btree ("_order");
  CREATE INDEX "homepage_hero_slider_slides_parent_id_idx" ON "homepage_hero_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_slider_slides_media_idx" ON "homepage_hero_slider_slides" USING btree ("media_id");
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_finishes_fk" FOREIGN KEY ("finishes_id") REFERENCES "public"."finishes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_rels_materials_id_idx" ON "homepage_rels" USING btree ("materials_id");
  CREATE INDEX "homepage_rels_finishes_id_idx" ON "homepage_rels" USING btree ("finishes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_hero_slider_slides" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homepage_hero_slider_slides" CASCADE;
  ALTER TABLE "homepage_rels" DROP CONSTRAINT "homepage_rels_materials_fk";
  
  ALTER TABLE "homepage_rels" DROP CONSTRAINT "homepage_rels_finishes_fk";
  
  DROP INDEX "homepage_rels_materials_id_idx";
  DROP INDEX "homepage_rels_finishes_id_idx";
  ALTER TABLE "homepage" DROP COLUMN "hero_slider_enabled";
  ALTER TABLE "homepage_rels" DROP COLUMN "materials_id";
  ALTER TABLE "homepage_rels" DROP COLUMN "finishes_id";`)
}
