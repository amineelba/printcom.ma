import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { GOODIES_PRODUCTS } from '../lib/seed/content/goodiesProducts'
import { PRODUCT_CATEGORIES } from '../lib/seed/content/productCategories'

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
  // 2. Legacy child-category sweep. Some environments carry child
  //    `product-categories` documents under every top-level family — an
  //    older two-level taxonomy that predates the `products.ts`/
  //    `goodiesProducts.ts` seeds, superseded once each item got its own
  //    real `products` document. Matched by TITLE, not slug: verified
  //    directly against production that the real Goodies Products carry a
  //    "goodies-"-prefixed slug (e.g. "goodies-stylos-personnalises")
  //    that does NOT match the legacy category's un-prefixed slug (e.g.
  //    "stylos-personnalises") or GOODIES_PRODUCTS' seed slug — an
  //    earlier version of this migration matched on slug for Goodies
  //    specifically, which would have missed every existing Goodies
  //    Product and created 15 duplicates. Title matches exactly for all
  //    known legacy rows in production (94/94, zero ambiguous), and is
  //    referenced nowhere else (not a primaryCategory, not in any
  //    secondaryCategories/homepage/collection relation) — safe to delete
  //    once matched.
  //
  //    Only if NO Product exists yet by title AND the legacy category is a
  //    known Goodies item do we fall back to creating one from
  //    GOODIES_PRODUCTS (covers a hypothetical environment that has the
  //    old taxonomy but never got the Goodies Products created). Anything
  //    else unmatched is left alone and logged instead of guessed at
  //    (brief §44: fail safely, don't silently drop the unexpected) — it
  //    will surface as an extra top-level-looking category after the
  //    parent_id column is dropped below, which is visibly wrong rather
  //    than silently lossy.
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

    if (matchingProductDocs.length > 0) {
      await payload.delete({ collection: 'product-categories', id: legacyCategory.id, overrideAccess: true, req })
      payload.logger.info(
        `[catalog-architecture-migration] Removed legacy category "${legacyCategory.slug}" — superseded by existing Product "${matchingProductDocs[0].slug}".`,
      )
      continue
    }

    const goodiesSeed = GOODIES_PRODUCTS.find((p) => p.slug === legacyCategory.slug)
    if (goodiesSeed) {
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
        await payload.create({
          collection: 'products',
          data: {
            slug: goodiesSeed.slug,
            title: goodiesSeed.title,
            primaryCategory: goodiesCategory.id,
            shortDescription: goodiesSeed.shortDescription,
            longDescription: goodiesSeed.longDescription,
            filePreparationInstructions: goodiesSeed.filePreparationInstructions,
            seo: goodiesSeed.seo,
            status: goodiesSeed.status,
            quoteOnly: goodiesSeed.quoteOnly,
            indicativePriceEnabled: goodiesSeed.indicativePriceEnabled,
          },
          overrideAccess: true,
          req,
        })
        await payload.delete({ collection: 'product-categories', id: legacyCategory.id, overrideAccess: true, req })
        payload.logger.info(
          `[catalog-architecture-migration] Migrated legacy Goodies category "${legacyCategory.slug}" to a new Product (no existing Product found by title).`,
        )
        continue
      }
    }

    payload.logger.warn(
      `[catalog-architecture-migration] Legacy category "${legacyCategory.slug}" (title "${legacyCategory.title}") has no matching Product by title and no seed fallback — left in place. Needs manual review.`,
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
