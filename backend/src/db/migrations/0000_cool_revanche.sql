CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."research_status" AS ENUM('pending', 'in_progress', 'completed', 'partial', 'failed');--> statement-breakpoint
CREATE TYPE "public"."signal_type" AS ENUM('HIRING', 'FUNDING', 'EXPANSION', 'LEADERSHIP_CHANGE', 'PARTNERSHIP', 'PRODUCT_LAUNCH', 'MARKET_ENTRY', 'ACQUISITION', 'CUSTOMER_GROWTH', 'TECHNOLOGY_CHANGE', 'STRATEGIC_CHANGE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."source_authority" AS ENUM('first_party', 'official_announcement', 'established_publication', 'third_party_database', 'unverified');--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"operation" varchar(100) NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"latency_ms" integer,
	"estimated_cost" real,
	"success" boolean DEFAULT true NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"previous_snapshot_id" uuid,
	"current_snapshot_id" uuid,
	"change_type" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"significance" varchar(50),
	"actionability" varchar(50),
	"recommended_action" text,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(500),
	"domain" varchar(500) NOT NULL,
	"url" text NOT NULL,
	"industry" varchar(255),
	"summary" text,
	"last_researched_at" timestamp with time zone,
	"research_status" "research_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_intelligence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"snapshot_id" uuid,
	"data" jsonb NOT NULL,
	"confidence" "confidence_level" DEFAULT 'unknown' NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"source_url" text NOT NULL,
	"source_type" varchar(100) NOT NULL,
	"title" varchar(1000),
	"content" text NOT NULL,
	"authority" "source_authority" DEFAULT 'unverified' NOT NULL,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid,
	"rating" varchar(50) NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"snapshot_id" uuid,
	"total_score" real DEFAULT 0 NOT NULL,
	"strategic_fit" real DEFAULT 0 NOT NULL,
	"recent_trigger" real DEFAULT 0 NOT NULL,
	"growth_signal" real DEFAULT 0 NOT NULL,
	"reachability" real DEFAULT 0 NOT NULL,
	"evidence_confidence" real DEFAULT 0 NOT NULL,
	"why_now" text,
	"explanation" text,
	"confidence" "confidence_level" DEFAULT 'unknown' NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"person_id" uuid,
	"message" text NOT NULL,
	"context" text,
	"evidence_used" jsonb DEFAULT '[]'::jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(500) NOT NULL,
	"role" varchar(500),
	"profile_url" text,
	"why_relevant" text,
	"relevance_score" real DEFAULT 0,
	"persona" varchar(255),
	"evidence_ids" jsonb DEFAULT '[]'::jsonb,
	"confidence" "confidence_level" DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"status" "research_status" DEFAULT 'pending' NOT NULL,
	"progress" jsonb DEFAULT '{}'::jsonb,
	"sources_attempted" integer DEFAULT 0,
	"sources_succeeded" integer DEFAULT 0,
	"sources_failed" integer DEFAULT 0,
	"error" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"snapshot_id" uuid,
	"type" "signal_type" NOT NULL,
	"description" text NOT NULL,
	"meaning" text,
	"actionability" text,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb,
	"confidence" "confidence_level" DEFAULT 'unknown' NOT NULL,
	"potential_impact" varchar(50),
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"intelligence_data" jsonb,
	"signals_data" jsonb,
	"opportunity_data" jsonb,
	"people_data" jsonb,
	"evidence_count" integer DEFAULT 0,
	"snapshot_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_previous_snapshot_id_snapshots_id_fk" FOREIGN KEY ("previous_snapshot_id") REFERENCES "public"."snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_current_snapshot_id_snapshots_id_fk" FOREIGN KEY ("current_snapshot_id") REFERENCES "public"."snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_intelligence" ADD CONSTRAINT "company_intelligence_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_jobs" ADD CONSTRAINT "research_jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_created_at_idx" ON "ai_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "changes_company_id_idx" ON "changes" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "companies_user_id_idx" ON "companies" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_user_domain_idx" ON "companies" USING btree ("user_id","domain");--> statement-breakpoint
CREATE INDEX "intelligence_company_id_idx" ON "company_intelligence" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "evidence_company_id_idx" ON "evidence" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "opportunities_company_id_idx" ON "opportunities" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "opportunities_score_idx" ON "opportunities" USING btree ("total_score");--> statement-breakpoint
CREATE INDEX "outreach_company_id_idx" ON "outreach_drafts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "people_company_id_idx" ON "people" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "research_jobs_company_id_idx" ON "research_jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "signals_company_id_idx" ON "signals" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "snapshots_company_id_idx" ON "snapshots" USING btree ("company_id");