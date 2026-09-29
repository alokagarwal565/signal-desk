import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  jsonb,
  pgEnum,
  real,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────

export const researchStatusEnum = pgEnum('research_status', [
  'pending',
  'in_progress',
  'completed',
  'partial',
  'failed',
]);

export const signalTypeEnum = pgEnum('signal_type', [
  'HIRING',
  'FUNDING',
  'EXPANSION',
  'LEADERSHIP_CHANGE',
  'PARTNERSHIP',
  'PRODUCT_LAUNCH',
  'MARKET_ENTRY',
  'ACQUISITION',
  'CUSTOMER_GROWTH',
  'TECHNOLOGY_CHANGE',
  'STRATEGIC_CHANGE',
  'OTHER',
]);

export const confidenceEnum = pgEnum('confidence_level', [
  'high',
  'medium',
  'low',
  'unknown',
]);

export const sourceAuthorityEnum = pgEnum('source_authority', [
  'first_party',
  'official_announcement',
  'established_publication',
  'third_party_database',
  'unverified',
]);

// ─── Users ───────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Companies ───────────────────────────────────────────────

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    name: varchar('name', { length: 500 }),
    domain: varchar('domain', { length: 500 }).notNull(),
    url: text('url').notNull(),
    industry: varchar('industry', { length: 255 }),
    summary: text('summary'),
    lastResearchedAt: timestamp('last_researched_at', { withTimezone: true }),
    researchStatus: researchStatusEnum('research_status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('companies_user_id_idx').on(t.userId),
    uniqueIndex('companies_user_domain_idx').on(t.userId, t.domain),
  ]
);

// ─── Evidence ────────────────────────────────────────────────

export const evidence = pgTable(
  'evidence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    sourceUrl: text('source_url').notNull(),
    sourceType: varchar('source_type', { length: 100 }).notNull(),
    title: varchar('title', { length: 1000 }),
    content: text('content').notNull(),
    authority: sourceAuthorityEnum('authority').notNull().default('unverified'),
    retrievedAt: timestamp('retrieved_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('evidence_company_id_idx').on(t.companyId)]
);

// ─── Company Intelligence ────────────────────────────────────

export const companyIntelligence = pgTable(
  'company_intelligence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    snapshotId: uuid('snapshot_id'),
    data: jsonb('data').notNull(), // structured intelligence JSON
    confidence: confidenceEnum('confidence').notNull().default('unknown'),
    generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('intelligence_company_id_idx').on(t.companyId)]
);

// ─── Signals ─────────────────────────────────────────────────

export const signals = pgTable(
  'signals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    snapshotId: uuid('snapshot_id'),
    type: signalTypeEnum('type').notNull(),
    description: text('description').notNull(),
    meaning: text('meaning'),
    actionability: text('actionability'),
    evidenceIds: jsonb('evidence_ids').$type<string[]>().default([]),
    confidence: confidenceEnum('confidence').notNull().default('unknown'),
    potentialImpact: varchar('potential_impact', { length: 50 }),
    detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('signals_company_id_idx').on(t.companyId)]
);

// ─── Opportunities ───────────────────────────────────────────

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    snapshotId: uuid('snapshot_id'),
    totalScore: real('total_score').notNull().default(0),
    strategicFit: real('strategic_fit').notNull().default(0),
    recentTrigger: real('recent_trigger').notNull().default(0),
    growthSignal: real('growth_signal').notNull().default(0),
    reachability: real('reachability').notNull().default(0),
    evidenceConfidence: real('evidence_confidence').notNull().default(0),
    whyNow: text('why_now'),
    explanation: text('explanation'),
    confidence: confidenceEnum('confidence').notNull().default('unknown'),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('opportunities_company_id_idx').on(t.companyId),
    index('opportunities_score_idx').on(t.totalScore),
  ]
);

// ─── People ──────────────────────────────────────────────────

export const people = pgTable(
  'people',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 500 }).notNull(),
    role: varchar('role', { length: 500 }),
    profileUrl: text('profile_url'),
    whyRelevant: text('why_relevant'),
    relevanceScore: real('relevance_score').default(0),
    persona: varchar('persona', { length: 255 }),
    evidenceIds: jsonb('evidence_ids').$type<string[]>().default([]),
    confidence: confidenceEnum('confidence').notNull().default('unknown'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('people_company_id_idx').on(t.companyId)]
);

// ─── Outreach Drafts ─────────────────────────────────────────

export const outreachDrafts = pgTable(
  'outreach_drafts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    personId: uuid('person_id').references(() => people.id, { onDelete: 'set null' }),
    message: text('message').notNull(),
    context: text('context'),
    evidenceUsed: jsonb('evidence_used').$type<string[]>().default([]),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('outreach_company_id_idx').on(t.companyId)]
);

// ─── Snapshots ───────────────────────────────────────────────

export const snapshots = pgTable(
  'snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    intelligenceData: jsonb('intelligence_data'),
    signalsData: jsonb('signals_data'),
    opportunityData: jsonb('opportunity_data'),
    peopleData: jsonb('people_data'),
    evidenceCount: integer('evidence_count').default(0),
    snapshotNumber: integer('snapshot_number').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('snapshots_company_id_idx').on(t.companyId)]
);

// ─── Changes (Trigger Detection) ────────────────────────────

export const changes = pgTable(
  'changes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    previousSnapshotId: uuid('previous_snapshot_id').references(() => snapshots.id),
    currentSnapshotId: uuid('current_snapshot_id').references(() => snapshots.id),
    changeType: varchar('change_type', { length: 100 }).notNull(),
    description: text('description').notNull(),
    significance: varchar('significance', { length: 50 }),
    actionability: varchar('actionability', { length: 50 }),
    recommendedAction: text('recommended_action'),
    evidenceIds: jsonb('evidence_ids').$type<string[]>().default([]),
    detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('changes_company_id_idx').on(t.companyId)]
);

// ─── Research Jobs ───────────────────────────────────────────

export const researchJobs = pgTable(
  'research_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    status: researchStatusEnum('status').notNull().default('pending'),
    progress: jsonb('progress').$type<Record<string, string>>().default({}),
    sourcesAttempted: integer('sources_attempted').default(0),
    sourcesSucceeded: integer('sources_succeeded').default(0),
    sourcesFailed: integer('sources_failed').default(0),
    error: text('error'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('research_jobs_company_id_idx').on(t.companyId)]
);

// ─── User Feedback ───────────────────────────────────────────

export const feedback = pgTable(
  'feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    targetType: varchar('target_type', { length: 50 }).notNull(), // 'opportunity', 'signal', 'person', 'outreach'
    targetId: uuid('target_id'),
    rating: varchar('rating', { length: 50 }).notNull(), // 'useful', 'not_useful', 'wrong_signal', 'wrong_person'
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('feedback_user_id_idx').on(t.userId)]
);

// ─── AI Usage Tracking ──────────────────────────────────────

export const aiUsage = pgTable(
  'ai_usage',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: varchar('provider', { length: 50 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
    operation: varchar('operation', { length: 100 }).notNull(),
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    latencyMs: integer('latency_ms'),
    estimatedCost: real('estimated_cost'),
    success: boolean('success').notNull().default(true),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ai_usage_created_at_idx').on(t.createdAt)]
);
