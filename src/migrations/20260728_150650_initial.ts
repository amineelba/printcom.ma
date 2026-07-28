import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'content-manager', 'sales-manager', 'sales-agent');
  CREATE TYPE "public"."enum_product_categories_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_products_orientations" AS ENUM('portrait', 'landscape', 'square');
  CREATE TYPE "public"."enum_products_print_sides" AS ENUM('single', 'double');
  CREATE TYPE "public"."enum_products_color_modes" AS ENUM('cmyk', 'bw', 'pantone');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_solutions_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_sectors_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_technologies_verification_status" AS ENUM('unverified', 'confirmed', 'unavailable');
  CREATE TYPE "public"."enum_technologies_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_materials_group" AS ENUM('papier', 'carton', 'supports-souples', 'supports-rigides');
  CREATE TYPE "public"."enum_materials_indoor_outdoor" AS ENUM('indoor', 'outdoor', 'both');
  CREATE TYPE "public"."enum_materials_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_finishes_group" AS ENUM('pelliculage', 'vernis', 'ennoblissement', 'decoupe', 'reliure');
  CREATE TYPE "public"."enum_finishes_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_resources_category" AS ENUM('guide', 'file-prep', 'materials', 'trends', 'use-case');
  CREATE TYPE "public"."enum_resources_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('quote', 'production', 'files', 'delivery', 'general');
  CREATE TYPE "public"."enum_faqs_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_testimonials_verification_status" AS ENUM('unverified', 'confirmed', 'unavailable');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_clients_verification_status" AS ENUM('unverified', 'confirmed', 'unavailable');
  CREATE TYPE "public"."enum_clients_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_production_sites_verification_status" AS ENUM('unverified', 'confirmed', 'unavailable');
  CREATE TYPE "public"."enum_production_sites_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_machines_verification_status" AS ENUM('unverified', 'confirmed', 'unavailable');
  CREATE TYPE "public"."enum_machines_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_quote_requests_need_request_type" AS ENUM('product-printing', 'advisory', 'custom-packaging', 'large-format', 'multi-site-campaign', 'other');
  CREATE TYPE "public"."enum_quote_requests_configuration_custom_format_unit" AS ENUM('mm', 'cm');
  CREATE TYPE "public"."enum_quote_requests_configuration_orientation" AS ENUM('portrait', 'landscape');
  CREATE TYPE "public"."enum_quote_requests_configuration_print_sides" AS ENUM('single', 'double');
  CREATE TYPE "public"."enum_quote_requests_production_and_delivery_urgency_level" AS ENUM('standard', 'urgent');
  CREATE TYPE "public"."enum_quote_requests_contact_preferred_contact_method" AS ENUM('email', 'phone');
  CREATE TYPE "public"."enum_quote_requests_workflow_status" AS ENUM('new', 'reviewing', 'information-required', 'qualified', 'quotation-preparation', 'quotation-sent', 'negotiation', 'won', 'lost', 'archived', 'spam');
  CREATE TYPE "public"."enum_quote_requests_workflow_priority" AS ENUM('low', 'normal', 'high');
  CREATE TYPE "public"."enum_contact_requests_workflow_status" AS ENUM('new', 'in-progress', 'resolved', 'spam');
  CREATE TYPE "public"."enum_legal_documents_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_social_links_links_platform" AS ENUM('linkedin', 'instagram', 'facebook', 'youtube');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'content-manager' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_listing_url" varchar,
  	"sizes_listing_width" numeric,
  	"sizes_listing_height" numeric,
  	"sizes_listing_mime_type" varchar,
  	"sizes_listing_filesize" numeric,
  	"sizes_listing_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_open_graph_url" varchar,
  	"sizes_open_graph_width" numeric,
  	"sizes_open_graph_height" numeric,
  	"sizes_open_graph_mime_type" varchar,
  	"sizes_open_graph_filesize" numeric,
  	"sizes_open_graph_filename" varchar
  );
  
  CREATE TABLE "private_quote_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"original_filename" varchar NOT NULL,
  	"quote_request_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "product_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"short_description" varchar,
  	"icon_id" integer,
  	"image_id" integer,
  	"order" numeric DEFAULT 0,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_product_categories_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_available_formats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "products_orientations" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_orientations",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_page_count_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "products_print_sides" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_print_sides",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_color_modes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_color_modes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_grammages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "products_quantities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "products_accepted_file_formats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"internal_reference" varchar,
  	"short_description" varchar NOT NULL,
  	"long_description" jsonb,
  	"featured" boolean DEFAULT false,
  	"primary_image_id" integer,
  	"primary_category_id" integer NOT NULL,
  	"custom_format_available" boolean DEFAULT false,
  	"minimum_quantity" numeric,
  	"standard_lead_time" varchar,
  	"express_available" boolean DEFAULT false,
  	"proof_required" boolean DEFAULT true,
  	"production_notes" varchar,
  	"bleed_requirements" varchar,
  	"recommended_resolution" varchar,
  	"color_profile" varchar,
  	"template_file_id" integer,
  	"file_preparation_instructions" jsonb,
  	"quote_only" boolean DEFAULT true,
  	"indicative_price" varchar DEFAULT '',
  	"indicative_price_enabled" boolean DEFAULT false,
  	"delivery_available" boolean DEFAULT true,
  	"installation_available" boolean DEFAULT false,
  	"commercial_notes" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_products_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"product_categories_id" integer,
  	"solutions_id" integer,
  	"sectors_id" integer,
  	"products_id" integer,
  	"services_id" integer,
  	"materials_id" integer,
  	"finishes_id" integer,
  	"technologies_id" integer
  );
  
  CREATE TABLE "services_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "services_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"short_description" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"order" numeric DEFAULT 0,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_services_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "solutions_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "solutions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"short_description" varchar,
  	"problem" varchar,
  	"desired_outcome" varchar,
  	"quote_c_t_a" varchar DEFAULT 'Demander un devis',
  	"image_id" integer,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_solutions_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "solutions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"services_id" integer,
  	"technologies_id" integer,
  	"materials_id" integer,
  	"finishes_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "sectors_challenges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_printing_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "sectors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"short_description" varchar,
  	"constraints" varchar,
  	"image_id" integer,
  	"neutral_positioning_note" varchar DEFAULT 'Printcom étudie les contraintes d’impression propres à ce secteur.',
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_sectors_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sectors_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_categories_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "technologies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"short_description" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"verification_status" "enum_technologies_verification_status" DEFAULT 'unverified' NOT NULL,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_technologies_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "materials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"group" "enum_materials_group" NOT NULL,
  	"short_description" varchar,
  	"image_id" integer,
  	"indoor_outdoor" "enum_materials_indoor_outdoor",
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_materials_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "finishes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"group" "enum_finishes_group" NOT NULL,
  	"short_description" varchar,
  	"image_id" integer,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_finishes_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" "enum_resources_category",
  	"introduction" varchar NOT NULL,
  	"body" jsonb NOT NULL,
  	"cover_image_id" integer,
  	"download_file_id" integer,
  	"publish_date" timestamp(3) with time zone,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"seo_structured_data_enabled" boolean DEFAULT true,
  	"status" "enum_resources_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"services_id" integer,
  	"resources_id" integer
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL,
  	"category" "enum_faqs_category",
  	"order" numeric DEFAULT 0,
  	"status" "enum_faqs_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author_name" varchar NOT NULL,
  	"author_role" varchar,
  	"company" varchar,
  	"photo_id" integer,
  	"consent_confirmed" boolean DEFAULT false,
  	"verification_status" "enum_testimonials_verification_status" DEFAULT 'unverified' NOT NULL,
  	"status" "enum_testimonials_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"website" varchar,
  	"authorization_confirmed" boolean DEFAULT false,
  	"verification_status" "enum_clients_verification_status" DEFAULT 'unverified' NOT NULL,
  	"status" "enum_clients_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "production_sites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"city" varchar,
  	"address" varchar,
  	"description" varchar,
  	"verification_status" "enum_production_sites_verification_status" DEFAULT 'unverified' NOT NULL,
  	"status" "enum_production_sites_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "machines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"technology_id" integer,
  	"max_format" varchar,
  	"production_site_id" integer,
  	"description" varchar,
  	"image_id" integer,
  	"verification_status" "enum_machines_verification_status" DEFAULT 'unverified' NOT NULL,
  	"status" "enum_machines_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quote_requests_workflow_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar,
  	"changed_at" timestamp(3) with time zone,
  	"changed_by_id" integer
  );
  
  CREATE TABLE "quote_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"need_request_type" "enum_quote_requests_need_request_type" NOT NULL,
  	"need_desired_product_id" integer,
  	"need_category_id" integer,
  	"need_description" varchar,
  	"need_usage" varchar,
  	"need_sector_id" integer,
  	"configuration_format" varchar,
  	"configuration_custom_format_width" numeric,
  	"configuration_custom_format_height" numeric,
  	"configuration_custom_format_unit" "enum_quote_requests_configuration_custom_format_unit" DEFAULT 'mm',
  	"configuration_orientation" "enum_quote_requests_configuration_orientation",
  	"configuration_page_count" numeric,
  	"configuration_print_sides" "enum_quote_requests_configuration_print_sides",
  	"configuration_color" varchar,
  	"configuration_material_id" integer,
  	"configuration_grammage" varchar,
  	"configuration_binding" varchar,
  	"configuration_quantity" numeric,
  	"configuration_versions_count" numeric,
  	"configuration_variable_personalization" boolean DEFAULT false,
  	"production_and_delivery_desired_date" timestamp(3) with time zone,
  	"production_and_delivery_urgency_level" "enum_quote_requests_production_and_delivery_urgency_level" DEFAULT 'standard',
  	"production_and_delivery_city" varchar,
  	"production_and_delivery_address_or_zone" varchar,
  	"production_and_delivery_multi_site_delivery" boolean DEFAULT false,
  	"production_and_delivery_destinations_count" numeric,
  	"production_and_delivery_installation_required" boolean DEFAULT false,
  	"production_and_delivery_logistics_comments" varchar,
  	"files_files_ready" boolean DEFAULT false,
  	"files_needs_file_check" boolean DEFAULT false,
  	"files_needs_graphic_design" boolean DEFAULT false,
  	"files_external_link" varchar,
  	"files_comments" varchar,
  	"contact_company" varchar NOT NULL,
  	"contact_full_name" varchar NOT NULL,
  	"contact_job_title" varchar,
  	"contact_email" varchar NOT NULL,
  	"contact_phone" varchar NOT NULL,
  	"contact_city" varchar,
  	"contact_preferred_contact_method" "enum_quote_requests_contact_preferred_contact_method",
  	"contact_comments" varchar,
  	"contact_consent_confirmed" boolean DEFAULT false NOT NULL,
  	"contact_consent_timestamp" timestamp(3) with time zone,
  	"workflow_status" "enum_quote_requests_workflow_status" DEFAULT 'new' NOT NULL,
  	"workflow_assigned_to_id" integer,
  	"workflow_internal_notes" varchar,
  	"workflow_estimated_value" numeric,
  	"workflow_priority" "enum_quote_requests_workflow_priority" DEFAULT 'normal',
  	"workflow_follow_up_date" timestamp(3) with time zone,
  	"workflow_source" varchar,
  	"workflow_utm_source" varchar,
  	"workflow_utm_medium" varchar,
  	"workflow_utm_campaign" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quote_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"finishes_id" integer,
  	"private_quote_files_id" integer
  );
  
  CREATE TABLE "contact_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"company" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"subject" varchar,
  	"message" varchar NOT NULL,
  	"consent_confirmed" boolean DEFAULT false NOT NULL,
  	"consent_timestamp" timestamp(3) with time zone,
  	"source" varchar,
  	"workflow_status" "enum_contact_requests_workflow_status" DEFAULT 'new',
  	"workflow_assigned_to_id" integer,
  	"workflow_internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"consent_confirmed" boolean DEFAULT false NOT NULL,
  	"consent_timestamp" timestamp(3) with time zone,
  	"source" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "legal_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"body" jsonb NOT NULL,
  	"last_updated" timestamp(3) with time zone,
  	"status" "enum_legal_documents_status" DEFAULT 'draft' NOT NULL,
  	"owner_id" integer,
  	"reviewer_id" integer,
  	"review_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"type" "enum_redirects_type" DEFAULT '301',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"private_quote_files_id" integer,
  	"product_categories_id" integer,
  	"products_id" integer,
  	"services_id" integer,
  	"solutions_id" integer,
  	"sectors_id" integer,
  	"technologies_id" integer,
  	"materials_id" integer,
  	"finishes_id" integer,
  	"resources_id" integer,
  	"faqs_id" integer,
  	"testimonials_id" integer,
  	"clients_id" integer,
  	"production_sites_id" integer,
  	"machines_id" integer,
  	"quote_requests_id" integer,
  	"contact_requests_id" integer,
  	"newsletter_subscribers_id" integer,
  	"legal_documents_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_business_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Printcom',
  	"tagline" varchar,
  	"logo_id" integer,
  	"logo_mark_id" integer,
  	"legal_company_name" varchar,
  	"founding_year" varchar,
  	"address" varchar,
  	"city" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"feature_flags_show_parc_machines" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_menus_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "header_menus_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar
  );
  
  CREATE TABLE "header_menus" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote_c_t_a_label" varchar DEFAULT 'Demander un devis',
  	"quote_c_t_a_href" varchar DEFAULT '/demande-de-devis',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"copyright_notice" varchar DEFAULT '© Printcom. Tous droits réservés.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_value_proposition_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "homepage_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_title" varchar DEFAULT 'Vos supports imprimés, structurés autour de vos objectifs commerciaux.',
  	"hero_description" varchar DEFAULT 'Printcom accompagne les entreprises dans la préparation, la production et le déploiement de leurs supports imprimés.',
  	"hero_primary_cta_label" varchar DEFAULT 'Demander un devis',
  	"hero_primary_cta_href" varchar DEFAULT '/demande-de-devis',
  	"hero_secondary_cta_label" varchar DEFAULT 'Explorer les produits',
  	"hero_secondary_cta_href" varchar DEFAULT '/produits',
  	"hero_media_id" integer,
  	"value_proposition_title" varchar,
  	"process_title" varchar DEFAULT 'Le processus Printcom',
  	"final_c_t_a_title" varchar DEFAULT 'Prêt à démarrer votre projet ?',
  	"final_c_t_a_description" varchar,
  	"final_c_t_a_cta_label" varchar DEFAULT 'Demander un devis',
  	"final_c_t_a_cta_href" varchar DEFAULT '/demande-de-devis',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_categories_id" integer,
  	"solutions_id" integer,
  	"services_id" integer,
  	"sectors_id" integer,
  	"resources_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "contact_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_intro" varchar,
  	"notification_recipients" varchar,
  	"auto_reply_subject" varchar DEFAULT 'Votre message a bien été reçu — Printcom',
  	"auto_reply_body" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "quote_settings_accepted_file_extensions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"extension" varchar NOT NULL
  );
  
  CREATE TABLE "quote_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference_prefix" varchar DEFAULT 'PC-DEVIS',
  	"notification_recipients" varchar,
  	"confirmation_subject" varchar DEFAULT 'Votre demande de devis Printcom a bien été reçue',
  	"confirmation_body" jsonb,
  	"max_file_size_m_b" numeric DEFAULT 15,
  	"date_disclaimer_note" varchar DEFAULT 'La date demandée sera étudiée et confirmée par l’équipe Printcom.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_meta_title" varchar DEFAULT 'Printcom — Impression commerciale B2B au Maroc',
  	"default_meta_description" varchar,
  	"default_open_graph_image_id" integer,
  	"title_template" varchar DEFAULT '%s — Printcom',
  	"robots_indexing_enabled" boolean DEFAULT true,
  	"organization_json_ld" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "social_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_social_links_links_platform",
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "social_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "design_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_color_confirmed" boolean DEFAULT false,
  	"brand_color_hex" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "private_quote_files" ADD CONSTRAINT "private_quote_files_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_available_formats" ADD CONSTRAINT "products_available_formats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_orientations" ADD CONSTRAINT "products_orientations_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_page_count_options" ADD CONSTRAINT "products_page_count_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_print_sides" ADD CONSTRAINT "products_print_sides_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_color_modes" ADD CONSTRAINT "products_color_modes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_grammages" ADD CONSTRAINT "products_grammages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_quantities" ADD CONSTRAINT "products_quantities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_accepted_file_formats" ADD CONSTRAINT "products_accepted_file_formats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_primary_image_id_media_id_fk" FOREIGN KEY ("primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_primary_category_id_product_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_template_file_id_media_id_fk" FOREIGN KEY ("template_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_finishes_fk" FOREIGN KEY ("finishes_id") REFERENCES "public"."finishes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_steps" ADD CONSTRAINT "services_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_deliverables" ADD CONSTRAINT "services_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_process" ADD CONSTRAINT "solutions_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_finishes_fk" FOREIGN KEY ("finishes_id") REFERENCES "public"."finishes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_challenges" ADD CONSTRAINT "sectors_challenges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_printing_needs" ADD CONSTRAINT "sectors_printing_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technologies" ADD CONSTRAINT "technologies_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technologies" ADD CONSTRAINT "technologies_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technologies" ADD CONSTRAINT "technologies_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technologies" ADD CONSTRAINT "technologies_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finishes" ADD CONSTRAINT "finishes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finishes" ADD CONSTRAINT "finishes_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finishes" ADD CONSTRAINT "finishes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finishes" ADD CONSTRAINT "finishes_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_download_file_id_media_id_fk" FOREIGN KEY ("download_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "production_sites" ADD CONSTRAINT "production_sites_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "production_sites" ADD CONSTRAINT "production_sites_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_production_site_id_production_sites_id_fk" FOREIGN KEY ("production_site_id") REFERENCES "public"."production_sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests_workflow_status_history" ADD CONSTRAINT "quote_requests_workflow_status_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests_workflow_status_history" ADD CONSTRAINT "quote_requests_workflow_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_need_desired_product_id_products_id_fk" FOREIGN KEY ("need_desired_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_need_category_id_product_categories_id_fk" FOREIGN KEY ("need_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_need_sector_id_sectors_id_fk" FOREIGN KEY ("need_sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_configuration_material_id_materials_id_fk" FOREIGN KEY ("configuration_material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_workflow_assigned_to_id_users_id_fk" FOREIGN KEY ("workflow_assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_requests_rels" ADD CONSTRAINT "quote_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_requests_rels" ADD CONSTRAINT "quote_requests_rels_finishes_fk" FOREIGN KEY ("finishes_id") REFERENCES "public"."finishes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_requests_rels" ADD CONSTRAINT "quote_requests_rels_private_quote_files_fk" FOREIGN KEY ("private_quote_files_id") REFERENCES "public"."private_quote_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_workflow_assigned_to_id_users_id_fk" FOREIGN KEY ("workflow_assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_private_quote_files_fk" FOREIGN KEY ("private_quote_files_id") REFERENCES "public"."private_quote_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_finishes_fk" FOREIGN KEY ("finishes_id") REFERENCES "public"."finishes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_production_sites_fk" FOREIGN KEY ("production_sites_id") REFERENCES "public"."production_sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machines_fk" FOREIGN KEY ("machines_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quote_requests_fk" FOREIGN KEY ("quote_requests_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_requests_fk" FOREIGN KEY ("contact_requests_id") REFERENCES "public"."contact_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_business_hours" ADD CONSTRAINT "site_settings_business_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_mark_id_media_id_fk" FOREIGN KEY ("logo_mark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_menus_columns_links" ADD CONSTRAINT "header_menus_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_menus_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menus_columns" ADD CONSTRAINT "header_menus_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menus" ADD CONSTRAINT "header_menus_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_value_proposition_points" ADD CONSTRAINT "homepage_value_proposition_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_process_steps" ADD CONSTRAINT "homepage_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quote_settings_accepted_file_extensions" ADD CONSTRAINT "quote_settings_accepted_file_extensions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_default_open_graph_image_id_media_id_fk" FOREIGN KEY ("default_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_links_links" ADD CONSTRAINT "social_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_listing_sizes_listing_filename_idx" ON "media" USING btree ("sizes_listing_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_open_graph_sizes_open_graph_filename_idx" ON "media" USING btree ("sizes_open_graph_filename");
  CREATE INDEX "private_quote_files_quote_request_idx" ON "private_quote_files" USING btree ("quote_request_id");
  CREATE INDEX "private_quote_files_updated_at_idx" ON "private_quote_files" USING btree ("updated_at");
  CREATE INDEX "private_quote_files_created_at_idx" ON "private_quote_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "private_quote_files_filename_idx" ON "private_quote_files" USING btree ("filename");
  CREATE UNIQUE INDEX "product_categories_slug_idx" ON "product_categories" USING btree ("slug");
  CREATE INDEX "product_categories_parent_idx" ON "product_categories" USING btree ("parent_id");
  CREATE INDEX "product_categories_icon_idx" ON "product_categories" USING btree ("icon_id");
  CREATE INDEX "product_categories_image_idx" ON "product_categories" USING btree ("image_id");
  CREATE INDEX "product_categories_seo_seo_open_graph_image_idx" ON "product_categories" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "product_categories_owner_idx" ON "product_categories" USING btree ("owner_id");
  CREATE INDEX "product_categories_reviewer_idx" ON "product_categories" USING btree ("reviewer_id");
  CREATE INDEX "product_categories_updated_at_idx" ON "product_categories" USING btree ("updated_at");
  CREATE INDEX "product_categories_created_at_idx" ON "product_categories" USING btree ("created_at");
  CREATE INDEX "products_available_formats_order_idx" ON "products_available_formats" USING btree ("_order");
  CREATE INDEX "products_available_formats_parent_id_idx" ON "products_available_formats" USING btree ("_parent_id");
  CREATE INDEX "products_orientations_order_idx" ON "products_orientations" USING btree ("order");
  CREATE INDEX "products_orientations_parent_idx" ON "products_orientations" USING btree ("parent_id");
  CREATE INDEX "products_page_count_options_order_idx" ON "products_page_count_options" USING btree ("_order");
  CREATE INDEX "products_page_count_options_parent_id_idx" ON "products_page_count_options" USING btree ("_parent_id");
  CREATE INDEX "products_print_sides_order_idx" ON "products_print_sides" USING btree ("order");
  CREATE INDEX "products_print_sides_parent_idx" ON "products_print_sides" USING btree ("parent_id");
  CREATE INDEX "products_color_modes_order_idx" ON "products_color_modes" USING btree ("order");
  CREATE INDEX "products_color_modes_parent_idx" ON "products_color_modes" USING btree ("parent_id");
  CREATE INDEX "products_grammages_order_idx" ON "products_grammages" USING btree ("_order");
  CREATE INDEX "products_grammages_parent_id_idx" ON "products_grammages" USING btree ("_parent_id");
  CREATE INDEX "products_quantities_order_idx" ON "products_quantities" USING btree ("_order");
  CREATE INDEX "products_quantities_parent_id_idx" ON "products_quantities" USING btree ("_parent_id");
  CREATE INDEX "products_accepted_file_formats_order_idx" ON "products_accepted_file_formats" USING btree ("_order");
  CREATE INDEX "products_accepted_file_formats_parent_id_idx" ON "products_accepted_file_formats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_primary_image_idx" ON "products" USING btree ("primary_image_id");
  CREATE INDEX "products_primary_category_idx" ON "products" USING btree ("primary_category_id");
  CREATE INDEX "products_template_file_idx" ON "products" USING btree ("template_file_id");
  CREATE INDEX "products_seo_seo_open_graph_image_idx" ON "products" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "products_owner_idx" ON "products" USING btree ("owner_id");
  CREATE INDEX "products_reviewer_idx" ON "products" USING btree ("reviewer_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "products_rels_product_categories_id_idx" ON "products_rels" USING btree ("product_categories_id");
  CREATE INDEX "products_rels_solutions_id_idx" ON "products_rels" USING btree ("solutions_id");
  CREATE INDEX "products_rels_sectors_id_idx" ON "products_rels" USING btree ("sectors_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "products_rels_services_id_idx" ON "products_rels" USING btree ("services_id");
  CREATE INDEX "products_rels_materials_id_idx" ON "products_rels" USING btree ("materials_id");
  CREATE INDEX "products_rels_finishes_id_idx" ON "products_rels" USING btree ("finishes_id");
  CREATE INDEX "products_rels_technologies_id_idx" ON "products_rels" USING btree ("technologies_id");
  CREATE INDEX "services_steps_order_idx" ON "services_steps" USING btree ("_order");
  CREATE INDEX "services_steps_parent_id_idx" ON "services_steps" USING btree ("_parent_id");
  CREATE INDEX "services_deliverables_order_idx" ON "services_deliverables" USING btree ("_order");
  CREATE INDEX "services_deliverables_parent_id_idx" ON "services_deliverables" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_parent_idx" ON "services" USING btree ("parent_id");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE INDEX "services_seo_seo_open_graph_image_idx" ON "services" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "services_owner_idx" ON "services" USING btree ("owner_id");
  CREATE INDEX "services_reviewer_idx" ON "services" USING btree ("reviewer_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_products_id_idx" ON "services_rels" USING btree ("products_id");
  CREATE INDEX "services_rels_faqs_id_idx" ON "services_rels" USING btree ("faqs_id");
  CREATE INDEX "solutions_process_order_idx" ON "solutions_process" USING btree ("_order");
  CREATE INDEX "solutions_process_parent_id_idx" ON "solutions_process" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "solutions_slug_idx" ON "solutions" USING btree ("slug");
  CREATE INDEX "solutions_image_idx" ON "solutions" USING btree ("image_id");
  CREATE INDEX "solutions_seo_seo_open_graph_image_idx" ON "solutions" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "solutions_owner_idx" ON "solutions" USING btree ("owner_id");
  CREATE INDEX "solutions_reviewer_idx" ON "solutions" USING btree ("reviewer_id");
  CREATE INDEX "solutions_updated_at_idx" ON "solutions" USING btree ("updated_at");
  CREATE INDEX "solutions_created_at_idx" ON "solutions" USING btree ("created_at");
  CREATE INDEX "solutions_rels_order_idx" ON "solutions_rels" USING btree ("order");
  CREATE INDEX "solutions_rels_parent_idx" ON "solutions_rels" USING btree ("parent_id");
  CREATE INDEX "solutions_rels_path_idx" ON "solutions_rels" USING btree ("path");
  CREATE INDEX "solutions_rels_products_id_idx" ON "solutions_rels" USING btree ("products_id");
  CREATE INDEX "solutions_rels_services_id_idx" ON "solutions_rels" USING btree ("services_id");
  CREATE INDEX "solutions_rels_technologies_id_idx" ON "solutions_rels" USING btree ("technologies_id");
  CREATE INDEX "solutions_rels_materials_id_idx" ON "solutions_rels" USING btree ("materials_id");
  CREATE INDEX "solutions_rels_finishes_id_idx" ON "solutions_rels" USING btree ("finishes_id");
  CREATE INDEX "solutions_rels_faqs_id_idx" ON "solutions_rels" USING btree ("faqs_id");
  CREATE INDEX "sectors_challenges_order_idx" ON "sectors_challenges" USING btree ("_order");
  CREATE INDEX "sectors_challenges_parent_id_idx" ON "sectors_challenges" USING btree ("_parent_id");
  CREATE INDEX "sectors_printing_needs_order_idx" ON "sectors_printing_needs" USING btree ("_order");
  CREATE INDEX "sectors_printing_needs_parent_id_idx" ON "sectors_printing_needs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sectors_slug_idx" ON "sectors" USING btree ("slug");
  CREATE INDEX "sectors_image_idx" ON "sectors" USING btree ("image_id");
  CREATE INDEX "sectors_seo_seo_open_graph_image_idx" ON "sectors" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "sectors_owner_idx" ON "sectors" USING btree ("owner_id");
  CREATE INDEX "sectors_reviewer_idx" ON "sectors" USING btree ("reviewer_id");
  CREATE INDEX "sectors_updated_at_idx" ON "sectors" USING btree ("updated_at");
  CREATE INDEX "sectors_created_at_idx" ON "sectors" USING btree ("created_at");
  CREATE INDEX "sectors_rels_order_idx" ON "sectors_rels" USING btree ("order");
  CREATE INDEX "sectors_rels_parent_idx" ON "sectors_rels" USING btree ("parent_id");
  CREATE INDEX "sectors_rels_path_idx" ON "sectors_rels" USING btree ("path");
  CREATE INDEX "sectors_rels_product_categories_id_idx" ON "sectors_rels" USING btree ("product_categories_id");
  CREATE INDEX "sectors_rels_faqs_id_idx" ON "sectors_rels" USING btree ("faqs_id");
  CREATE UNIQUE INDEX "technologies_slug_idx" ON "technologies" USING btree ("slug");
  CREATE INDEX "technologies_image_idx" ON "technologies" USING btree ("image_id");
  CREATE INDEX "technologies_seo_seo_open_graph_image_idx" ON "technologies" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "technologies_owner_idx" ON "technologies" USING btree ("owner_id");
  CREATE INDEX "technologies_reviewer_idx" ON "technologies" USING btree ("reviewer_id");
  CREATE INDEX "technologies_updated_at_idx" ON "technologies" USING btree ("updated_at");
  CREATE INDEX "technologies_created_at_idx" ON "technologies" USING btree ("created_at");
  CREATE UNIQUE INDEX "materials_slug_idx" ON "materials" USING btree ("slug");
  CREATE INDEX "materials_image_idx" ON "materials" USING btree ("image_id");
  CREATE INDEX "materials_seo_seo_open_graph_image_idx" ON "materials" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "materials_owner_idx" ON "materials" USING btree ("owner_id");
  CREATE INDEX "materials_reviewer_idx" ON "materials" USING btree ("reviewer_id");
  CREATE INDEX "materials_updated_at_idx" ON "materials" USING btree ("updated_at");
  CREATE INDEX "materials_created_at_idx" ON "materials" USING btree ("created_at");
  CREATE UNIQUE INDEX "finishes_slug_idx" ON "finishes" USING btree ("slug");
  CREATE INDEX "finishes_image_idx" ON "finishes" USING btree ("image_id");
  CREATE INDEX "finishes_seo_seo_open_graph_image_idx" ON "finishes" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "finishes_owner_idx" ON "finishes" USING btree ("owner_id");
  CREATE INDEX "finishes_reviewer_idx" ON "finishes" USING btree ("reviewer_id");
  CREATE INDEX "finishes_updated_at_idx" ON "finishes" USING btree ("updated_at");
  CREATE INDEX "finishes_created_at_idx" ON "finishes" USING btree ("created_at");
  CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");
  CREATE INDEX "resources_cover_image_idx" ON "resources" USING btree ("cover_image_id");
  CREATE INDEX "resources_download_file_idx" ON "resources" USING btree ("download_file_id");
  CREATE INDEX "resources_seo_seo_open_graph_image_idx" ON "resources" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "resources_owner_idx" ON "resources" USING btree ("owner_id");
  CREATE INDEX "resources_reviewer_idx" ON "resources" USING btree ("reviewer_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "resources_rels_order_idx" ON "resources_rels" USING btree ("order");
  CREATE INDEX "resources_rels_parent_idx" ON "resources_rels" USING btree ("parent_id");
  CREATE INDEX "resources_rels_path_idx" ON "resources_rels" USING btree ("path");
  CREATE INDEX "resources_rels_products_id_idx" ON "resources_rels" USING btree ("products_id");
  CREATE INDEX "resources_rels_services_id_idx" ON "resources_rels" USING btree ("services_id");
  CREATE INDEX "resources_rels_resources_id_idx" ON "resources_rels" USING btree ("resources_id");
  CREATE INDEX "faqs_owner_idx" ON "faqs" USING btree ("owner_id");
  CREATE INDEX "faqs_reviewer_idx" ON "faqs" USING btree ("reviewer_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_owner_idx" ON "testimonials" USING btree ("owner_id");
  CREATE INDEX "testimonials_reviewer_idx" ON "testimonials" USING btree ("reviewer_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "clients_logo_idx" ON "clients" USING btree ("logo_id");
  CREATE INDEX "clients_owner_idx" ON "clients" USING btree ("owner_id");
  CREATE INDEX "clients_reviewer_idx" ON "clients" USING btree ("reviewer_id");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE INDEX "production_sites_owner_idx" ON "production_sites" USING btree ("owner_id");
  CREATE INDEX "production_sites_reviewer_idx" ON "production_sites" USING btree ("reviewer_id");
  CREATE INDEX "production_sites_updated_at_idx" ON "production_sites" USING btree ("updated_at");
  CREATE INDEX "production_sites_created_at_idx" ON "production_sites" USING btree ("created_at");
  CREATE INDEX "machines_technology_idx" ON "machines" USING btree ("technology_id");
  CREATE INDEX "machines_production_site_idx" ON "machines" USING btree ("production_site_id");
  CREATE INDEX "machines_image_idx" ON "machines" USING btree ("image_id");
  CREATE INDEX "machines_owner_idx" ON "machines" USING btree ("owner_id");
  CREATE INDEX "machines_reviewer_idx" ON "machines" USING btree ("reviewer_id");
  CREATE INDEX "machines_updated_at_idx" ON "machines" USING btree ("updated_at");
  CREATE INDEX "machines_created_at_idx" ON "machines" USING btree ("created_at");
  CREATE INDEX "quote_requests_workflow_status_history_order_idx" ON "quote_requests_workflow_status_history" USING btree ("_order");
  CREATE INDEX "quote_requests_workflow_status_history_parent_id_idx" ON "quote_requests_workflow_status_history" USING btree ("_parent_id");
  CREATE INDEX "quote_requests_workflow_status_history_changed_by_idx" ON "quote_requests_workflow_status_history" USING btree ("changed_by_id");
  CREATE UNIQUE INDEX "quote_requests_reference_idx" ON "quote_requests" USING btree ("reference");
  CREATE INDEX "quote_requests_need_need_desired_product_idx" ON "quote_requests" USING btree ("need_desired_product_id");
  CREATE INDEX "quote_requests_need_need_category_idx" ON "quote_requests" USING btree ("need_category_id");
  CREATE INDEX "quote_requests_need_need_sector_idx" ON "quote_requests" USING btree ("need_sector_id");
  CREATE INDEX "quote_requests_configuration_configuration_material_idx" ON "quote_requests" USING btree ("configuration_material_id");
  CREATE INDEX "quote_requests_workflow_workflow_assigned_to_idx" ON "quote_requests" USING btree ("workflow_assigned_to_id");
  CREATE INDEX "quote_requests_updated_at_idx" ON "quote_requests" USING btree ("updated_at");
  CREATE INDEX "quote_requests_created_at_idx" ON "quote_requests" USING btree ("created_at");
  CREATE INDEX "quote_requests_rels_order_idx" ON "quote_requests_rels" USING btree ("order");
  CREATE INDEX "quote_requests_rels_parent_idx" ON "quote_requests_rels" USING btree ("parent_id");
  CREATE INDEX "quote_requests_rels_path_idx" ON "quote_requests_rels" USING btree ("path");
  CREATE INDEX "quote_requests_rels_finishes_id_idx" ON "quote_requests_rels" USING btree ("finishes_id");
  CREATE INDEX "quote_requests_rels_private_quote_files_id_idx" ON "quote_requests_rels" USING btree ("private_quote_files_id");
  CREATE INDEX "contact_requests_workflow_workflow_assigned_to_idx" ON "contact_requests" USING btree ("workflow_assigned_to_id");
  CREATE INDEX "contact_requests_updated_at_idx" ON "contact_requests" USING btree ("updated_at");
  CREATE INDEX "contact_requests_created_at_idx" ON "contact_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  CREATE UNIQUE INDEX "legal_documents_slug_idx" ON "legal_documents" USING btree ("slug");
  CREATE INDEX "legal_documents_owner_idx" ON "legal_documents" USING btree ("owner_id");
  CREATE INDEX "legal_documents_reviewer_idx" ON "legal_documents" USING btree ("reviewer_id");
  CREATE INDEX "legal_documents_updated_at_idx" ON "legal_documents" USING btree ("updated_at");
  CREATE INDEX "legal_documents_created_at_idx" ON "legal_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_private_quote_files_id_idx" ON "payload_locked_documents_rels" USING btree ("private_quote_files_id");
  CREATE INDEX "payload_locked_documents_rels_product_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("product_categories_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_solutions_id_idx" ON "payload_locked_documents_rels" USING btree ("solutions_id");
  CREATE INDEX "payload_locked_documents_rels_sectors_id_idx" ON "payload_locked_documents_rels" USING btree ("sectors_id");
  CREATE INDEX "payload_locked_documents_rels_technologies_id_idx" ON "payload_locked_documents_rels" USING btree ("technologies_id");
  CREATE INDEX "payload_locked_documents_rels_materials_id_idx" ON "payload_locked_documents_rels" USING btree ("materials_id");
  CREATE INDEX "payload_locked_documents_rels_finishes_id_idx" ON "payload_locked_documents_rels" USING btree ("finishes_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_production_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("production_sites_id");
  CREATE INDEX "payload_locked_documents_rels_machines_id_idx" ON "payload_locked_documents_rels" USING btree ("machines_id");
  CREATE INDEX "payload_locked_documents_rels_quote_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("quote_requests_id");
  CREATE INDEX "payload_locked_documents_rels_contact_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_requests_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_legal_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_documents_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_business_hours_order_idx" ON "site_settings_business_hours" USING btree ("_order");
  CREATE INDEX "site_settings_business_hours_parent_id_idx" ON "site_settings_business_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_mark_idx" ON "site_settings" USING btree ("logo_mark_id");
  CREATE INDEX "header_menus_columns_links_order_idx" ON "header_menus_columns_links" USING btree ("_order");
  CREATE INDEX "header_menus_columns_links_parent_id_idx" ON "header_menus_columns_links" USING btree ("_parent_id");
  CREATE INDEX "header_menus_columns_order_idx" ON "header_menus_columns" USING btree ("_order");
  CREATE INDEX "header_menus_columns_parent_id_idx" ON "header_menus_columns" USING btree ("_parent_id");
  CREATE INDEX "header_menus_order_idx" ON "header_menus" USING btree ("_order");
  CREATE INDEX "header_menus_parent_id_idx" ON "header_menus" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_value_proposition_points_order_idx" ON "homepage_value_proposition_points" USING btree ("_order");
  CREATE INDEX "homepage_value_proposition_points_parent_id_idx" ON "homepage_value_proposition_points" USING btree ("_parent_id");
  CREATE INDEX "homepage_process_steps_order_idx" ON "homepage_process_steps" USING btree ("_order");
  CREATE INDEX "homepage_process_steps_parent_id_idx" ON "homepage_process_steps" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_hero_media_idx" ON "homepage" USING btree ("hero_media_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_product_categories_id_idx" ON "homepage_rels" USING btree ("product_categories_id");
  CREATE INDEX "homepage_rels_solutions_id_idx" ON "homepage_rels" USING btree ("solutions_id");
  CREATE INDEX "homepage_rels_services_id_idx" ON "homepage_rels" USING btree ("services_id");
  CREATE INDEX "homepage_rels_sectors_id_idx" ON "homepage_rels" USING btree ("sectors_id");
  CREATE INDEX "homepage_rels_resources_id_idx" ON "homepage_rels" USING btree ("resources_id");
  CREATE INDEX "homepage_rels_faqs_id_idx" ON "homepage_rels" USING btree ("faqs_id");
  CREATE INDEX "quote_settings_accepted_file_extensions_order_idx" ON "quote_settings_accepted_file_extensions" USING btree ("_order");
  CREATE INDEX "quote_settings_accepted_file_extensions_parent_id_idx" ON "quote_settings_accepted_file_extensions" USING btree ("_parent_id");
  CREATE INDEX "seo_defaults_default_open_graph_image_idx" ON "seo_defaults" USING btree ("default_open_graph_image_id");
  CREATE INDEX "social_links_links_order_idx" ON "social_links_links" USING btree ("_order");
  CREATE INDEX "social_links_links_parent_id_idx" ON "social_links_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "private_quote_files" CASCADE;
  DROP TABLE "product_categories" CASCADE;
  DROP TABLE "products_available_formats" CASCADE;
  DROP TABLE "products_orientations" CASCADE;
  DROP TABLE "products_page_count_options" CASCADE;
  DROP TABLE "products_print_sides" CASCADE;
  DROP TABLE "products_color_modes" CASCADE;
  DROP TABLE "products_grammages" CASCADE;
  DROP TABLE "products_quantities" CASCADE;
  DROP TABLE "products_accepted_file_formats" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "services_steps" CASCADE;
  DROP TABLE "services_deliverables" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "solutions_process" CASCADE;
  DROP TABLE "solutions" CASCADE;
  DROP TABLE "solutions_rels" CASCADE;
  DROP TABLE "sectors_challenges" CASCADE;
  DROP TABLE "sectors_printing_needs" CASCADE;
  DROP TABLE "sectors" CASCADE;
  DROP TABLE "sectors_rels" CASCADE;
  DROP TABLE "technologies" CASCADE;
  DROP TABLE "materials" CASCADE;
  DROP TABLE "finishes" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "resources_rels" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "clients" CASCADE;
  DROP TABLE "production_sites" CASCADE;
  DROP TABLE "machines" CASCADE;
  DROP TABLE "quote_requests_workflow_status_history" CASCADE;
  DROP TABLE "quote_requests" CASCADE;
  DROP TABLE "quote_requests_rels" CASCADE;
  DROP TABLE "contact_requests" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  DROP TABLE "legal_documents" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_business_hours" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "header_menus_columns_links" CASCADE;
  DROP TABLE "header_menus_columns" CASCADE;
  DROP TABLE "header_menus" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "homepage_value_proposition_points" CASCADE;
  DROP TABLE "homepage_process_steps" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "contact_settings" CASCADE;
  DROP TABLE "quote_settings_accepted_file_extensions" CASCADE;
  DROP TABLE "quote_settings" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  DROP TABLE "social_links_links" CASCADE;
  DROP TABLE "social_links" CASCADE;
  DROP TABLE "design_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_product_categories_status";
  DROP TYPE "public"."enum_products_orientations";
  DROP TYPE "public"."enum_products_print_sides";
  DROP TYPE "public"."enum_products_color_modes";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum_solutions_status";
  DROP TYPE "public"."enum_sectors_status";
  DROP TYPE "public"."enum_technologies_verification_status";
  DROP TYPE "public"."enum_technologies_status";
  DROP TYPE "public"."enum_materials_group";
  DROP TYPE "public"."enum_materials_indoor_outdoor";
  DROP TYPE "public"."enum_materials_status";
  DROP TYPE "public"."enum_finishes_group";
  DROP TYPE "public"."enum_finishes_status";
  DROP TYPE "public"."enum_resources_category";
  DROP TYPE "public"."enum_resources_status";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_faqs_status";
  DROP TYPE "public"."enum_testimonials_verification_status";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum_clients_verification_status";
  DROP TYPE "public"."enum_clients_status";
  DROP TYPE "public"."enum_production_sites_verification_status";
  DROP TYPE "public"."enum_production_sites_status";
  DROP TYPE "public"."enum_machines_verification_status";
  DROP TYPE "public"."enum_machines_status";
  DROP TYPE "public"."enum_quote_requests_need_request_type";
  DROP TYPE "public"."enum_quote_requests_configuration_custom_format_unit";
  DROP TYPE "public"."enum_quote_requests_configuration_orientation";
  DROP TYPE "public"."enum_quote_requests_configuration_print_sides";
  DROP TYPE "public"."enum_quote_requests_production_and_delivery_urgency_level";
  DROP TYPE "public"."enum_quote_requests_contact_preferred_contact_method";
  DROP TYPE "public"."enum_quote_requests_workflow_status";
  DROP TYPE "public"."enum_quote_requests_workflow_priority";
  DROP TYPE "public"."enum_contact_requests_workflow_status";
  DROP TYPE "public"."enum_legal_documents_status";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_social_links_links_platform";`)
}
