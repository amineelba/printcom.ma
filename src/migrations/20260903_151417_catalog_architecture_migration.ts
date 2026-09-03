import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { GOODIES_PRODUCTS } from '../lib/seed/content/goodiesProducts'
import { PRODUCT_CATEGORIES } from '../lib/seed/content/productCategories'

/**
 * Known legacy identifiers for the 15 "Goodies & objets publicitaires"
 * items that previously existed as `product-categories` documents (children
 * of the "goodies-objets-publicitaires" category), before this migration's
 * architecture change: Goodies items are ordinary Products, not a second
 * taxonomy level. See the architecture migration this file is part of.
 */
const LEGACY_GOODIES_CHILD_SLUGS = GOODIES_PRODUCTS.map((p) => p.slug)

/** The flat target state: exactly these 9 top-level families should remain. */
const CANONICAL_CATEGORY_SLUGS = new Set(PRODUCT_CATEGORIES.map((c) => c.slug))

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ---------------------------------------------------------------------
  // 1. Purely additive schema: product_collections table, Products.collections
  //    relation column, Homepage.collectionBoard columns, MCP plugin
  //    per-collection permission columns. Safe regardless of existing data.
  // ---------------------------------------------------------------------
  await db.execute(sql`
   CREATE TYPE "public"."enum_product_collections_status" AS ENUM('draft', 'active', 'archived');
  CREATE TABLE "product_collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"status" "enum_product_collections_status" DEFAULT 'draft' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "products_rels" ADD COLUMN "product_collections_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "product_collections_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "product_collections_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "product_collections_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "product_collections_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "product_collections_id" integer;
  ALTER TABLE "homepage" ADD COLUMN "collection_board_enabled" boolean DEFAULT false;
  ALTER TABLE "homepage" ADD COLUMN "collection_board_title" varchar DEFAULT 'Collections';
  ALTER TABLE "homepage_rels" ADD COLUMN "product_collections_id" integer;
  CREATE UNIQUE INDEX "product_collections_key_idx" ON "product_collections" USING btree ("key");
  CREATE INDEX "product_collections_updated_at_idx" ON "product_collections" USING btree ("updated_at");
  CREATE INDEX "product_collections_created_at_idx" ON "product_collections" USING btree ("created_at");
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_product_collections_fk" FOREIGN KEY ("product_collections_id") REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_collections_fk" FOREIGN KEY ("product_collections_id") REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_product_collections_fk" FOREIGN KEY ("product_collections_id") REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_rels_product_collections_id_idx" ON "products_rels" USING btree ("product_collections_id");
  CREATE INDEX "payload_locked_documents_rels_product_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("product_collections_id");
  CREATE INDEX "homepage_rels_product_collections_id_idx" ON "homepage_rels" USING btree ("product_collections_id");`)

  // ---------------------------------------------------------------------
  // 2. Legacy Goodies data migration (brief: safe migration order —
  //    resolve parent, detect known children, upsert equivalent Products,
  //    then delete only the known legacy category records). Runs BEFORE
  //    the parent_id/secondaryCategories columns are dropped below, and is
  //    a no-op (not an error) on an environment that never had this legacy
  //    shape — e.g. a fresh database seeded directly with the new model.
  // ---------------------------------------------------------------------
  const { docs: goodiesCategoryDocs } = await payload.find({
    collection: 'product-categories',
    where: { slug: { equals: 'goodies-objets-publicitaires' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const goodiesCategory = goodiesCategoryDocs[0] as { id: number } | undefined

  if (goodiesCategory) {
    for (const slug of LEGACY_GOODIES_CHILD_SLUGS) {
      const { docs: legacyDocs } = await payload.find({
        collection: 'product-categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const legacyCategory = legacyDocs[0] as { id: number } | undefined
      if (!legacyCategory) continue // never existed on this environment — nothing to migrate for this slug

      const productSeed = GOODIES_PRODUCTS.find((p) => p.slug === slug)
      if (!productSeed) {
        // Should be unreachable — LEGACY_GOODIES_CHILD_SLUGS is derived from
        // GOODIES_PRODUCTS itself — but fail loudly rather than silently
        // dropping a legacy record we don't know how to migrate.
        throw new Error(`Legacy Goodies category "${slug}" has no matching Product seed entry — aborting migration.`)
      }

      const { docs: existingProductDocs } = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const existingProduct = existingProductDocs[0] as { id: number } | undefined

      const productData = {
        slug: productSeed.slug,
        title: productSeed.title,
        primaryCategory: goodiesCategory.id,
        shortDescription: productSeed.shortDescription,
        longDescription: productSeed.longDescription,
        filePreparationInstructions: productSeed.filePreparationInstructions,
        seo: productSeed.seo,
        status: productSeed.status,
        quoteOnly: productSeed.quoteOnly,
        indicativePriceEnabled: productSeed.indicativePriceEnabled,
      }

      if (existingProduct) {
        await payload.update({ collection: 'products', id: existingProduct.id, data: productData, overrideAccess: true, req })
      } else {
        await payload.create({ collection: 'products', data: productData, overrideAccess: true, req })
      }

      await payload.delete({ collection: 'product-categories', id: legacyCategory.id, overrideAccess: true, req })
      payload.logger.info(`[catalog-architecture-migration] Migrated legacy Goodies category "${slug}" to a Product.`)
    }
  }

  // ---------------------------------------------------------------------
  // 2b. Generic legacy child-category sweep. Some environments carry child
  //    `product-categories` documents under every top-level family, not
  //    just Goodies — an older two-level taxonomy that predates the
  //    `products.ts` seed, superseded once each item got its own real
  //    `products` document with a different slug. Verified directly
  //    against production before writing this: every non-canonical
  //    category row has an exact title match in `products` and is
  //    referenced nowhere (not a primaryCategory, not in any
  //    secondaryCategories/homepage/collection relation) — safe to delete.
  //    Anything that *doesn't* match is left alone and logged instead of
  //    guessed at (brief §44: fail safely, don't silently drop the
  //    unexpected) — it will surface as an extra top-level-looking
  //    category after the parent_id column is dropped below, which is
  //    visibly wrong rather than silently lossy.
  // ---------------------------------------------------------------------
  const { docs: allCategories } = await payload.find({
    collection: 'product-categories',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const legacyChildCategories = (allCategories as { id: number; slug: string; title: string }[]).filter(
    (c) => !CANONICAL_CATEGORY_SLUGS.has(c.slug),
  )

  for (const legacyCategory of legacyChildCategories) {
    const { docs: matchingProductDocs } = await payload.find({
      collection: 'products',
      where: { title: { equals: legacyCategory.title } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (matchingProductDocs.length === 0) {
      payload.logger.warn(
        `[catalog-architecture-migration] Legacy category "${legacyCategory.slug}" (title "${legacyCategory.title}") has no matching Product by title — left in place, not deleted. Needs manual review.`,
      )
      continue
    }

    await payload.delete({ collection: 'product-categories', id: legacyCategory.id, overrideAccess: true, req })
    payload.logger.info(
      `[catalog-architecture-migration] Removed legacy category "${legacyCategory.slug}" — superseded by existing Product "${matchingProductDocs[0].slug}".`,
    )
  }

  // ---------------------------------------------------------------------
  // 3. Now safe to remove the old hierarchy/secondary-category schema —
  //    every row that depended on it has been migrated or never existed.
  // ---------------------------------------------------------------------
  await db.execute(sql`
   ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_parent_id_product_categories_id_fk";

  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_product_categories_fk";

  DROP INDEX "product_categories_parent_idx";
  DROP INDEX "products_rels_product_categories_id_idx";
  ALTER TABLE "product_categories" DROP COLUMN "parent_id";
  ALTER TABLE "products_rels" DROP COLUMN "product_categories_id";`)
}

/**
 * Schema-only rollback. Restores the parent_id/secondaryCategories columns
 * and the product_collections/collectionBoard additions, but does NOT
 * reverse the data migration in `up()` (recreating the 15 deleted legacy
 * category rows and deleting the Products created from them) — that
 * direction is not meaningfully "safe to automate" per the same principle
 * that made the forward migration require explicit, bounded, known-slug
 * handling rather than a generic reversal. Re-run `pnpm seed` after a
 * rollback if the legacy category rows are needed again.
 */
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "product_collections" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "product_collections" CASCADE;
  DROP INDEX "products_rels_product_collections_id_idx";
  DROP INDEX "payload_locked_documents_rels_product_collections_id_idx";
  DROP INDEX "homepage_rels_product_collections_id_idx";
  ALTER TABLE "product_categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "products_rels" ADD COLUMN "product_categories_id" integer;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "product_categories_parent_idx" ON "product_categories" USING btree ("parent_id");
  CREATE INDEX "products_rels_product_categories_id_idx" ON "products_rels" USING btree ("product_categories_id");
  ALTER TABLE "products_rels" DROP COLUMN "product_collections_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "product_collections_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "product_collections_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "product_collections_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "product_collections_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "product_collections_id";
  ALTER TABLE "homepage" DROP COLUMN "collection_board_enabled";
  ALTER TABLE "homepage" DROP COLUMN "collection_board_title";
  ALTER TABLE "homepage_rels" DROP COLUMN "product_collections_id";
  DROP TYPE "public"."enum_product_collections_status";`)
}
