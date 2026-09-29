import { z } from 'zod';
import { db } from '../../db/index.js';
import { evidence, companyIntelligence, companies } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { aiExtract } from '../../ai/ai.service.js';
import { logger } from '../../utils/logger.js';

const flexibleString = (defaultVal = 'Unknown') =>
  z.union([
    z.string(),
    z.number().transform((n) => String(n)),
    z.array(z.unknown()).transform((arr) =>
      arr.map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item))).join(', ')
    ),
    z.record(z.unknown()).transform((obj) =>
      Object.entries(obj)
        .map(([k, v]) => `${k}: ${typeof v === 'object' && v !== null ? JSON.stringify(v) : v}`)
        .join(', ')
    ),
  ]).optional().default(defaultVal);

const stringOrArray = z.union([
  z.array(z.unknown()).transform((arr) =>
    arr.map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)))
  ),
  z.string().transform((s) => (s ? [s] : [])),
  z.record(z.unknown()).transform((obj) =>
    Object.entries(obj).map(([k, v]) => `${k}: ${typeof v === 'object' && v !== null ? JSON.stringify(v) : v}`)
  ),
]).optional().default([]);

const confidenceSchema = z.union([z.string(), z.number()]).transform((val): 'high' | 'medium' | 'low' | 'unknown' => {
  if (typeof val === 'number') {
    if (val >= 0.7) return 'high';
    if (val >= 0.4) return 'medium';
    return 'low';
  }
  const l = String(val).toLowerCase();
  if (l === 'high' || l === 'medium' || l === 'low') return l;
  return 'unknown';
}).default('unknown');

const intelligenceSchema = z.object({
  companyName: flexibleString('Unknown Company'),
  summary: flexibleString(''),
  industry: flexibleString('Unknown'),
  productsServices: stringOrArray,
  businessModel: flexibleString('Unknown'),
  targetCustomers: flexibleString('Unknown'),
  geographies: stringOrArray,
  companySizeIndicators: flexibleString('Unknown'),
  growthSignals: stringOrArray,
  recentDevelopments: stringOrArray,
  partnershipSignals: stringOrArray,
  hiringSignals: stringOrArray,
  leadershipSignals: stringOrArray,
  potentialOpportunity: flexibleString('Insufficient evidence'),
  potentialRisks: stringOrArray,
  keyEvidence: z.array(z.union([
    z.object({
      fact: z.union([z.string(), z.unknown().transform(String)]),
      source: z.union([z.string(), z.unknown().transform(String)]).optional(),
    }),
    z.string().transform((s) => ({ fact: s, source: 'website' })),
  ])).optional().default([]),
  confidence: confidenceSchema,
});

export type CompanyIntelligenceData = z.infer<typeof intelligenceSchema>;

export async function extractIntelligence(companyId: string) {
  // Gather all evidence
  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.companyId, companyId));

  if (evidenceRows.length === 0) {
    logger.warn('No evidence for intelligence extraction', { companyId });
    return null;
  }

  const evidenceSummary = evidenceRows
    .map((e) => `[Source: ${e.sourceType} — ${e.sourceUrl}]\nTitle: ${e.title}\n${e.content.slice(0, 3000)}`)
    .join('\n\n---\n\n')
    .slice(0, 15000);

  const result = await aiExtract({
    operation: 'extract_intelligence',
    schema: intelligenceSchema,
    messages: [
      {
        role: 'system',
        content: `You are a company research analyst. Extract structured intelligence from the provided evidence.

RULES:
- Only state facts that are directly supported by the evidence provided.
- If information is not available, use "Unknown" or "Insufficient evidence".
- NEVER invent facts, people, metrics, or partnerships.
- For confidence: "high" = multiple corroborating sources, "medium" = single reliable source, "low" = inferred/uncertain.
- Be concise and factual.

Return a JSON object with the following fields:
companyName, summary, industry, productsServices (array), businessModel, targetCustomers, geographies (array), companySizeIndicators, growthSignals (array), recentDevelopments (array), partnershipSignals (array), hiringSignals (array), leadershipSignals (array), potentialOpportunity, potentialRisks (array), keyEvidence (array of {fact, source}), confidence.`,
      },
      {
        role: 'user',
        content: `Analyze this company based on the following evidence:\n\n${evidenceSummary}`,
      },
    ],
  });

  // Update company name if we found it
  if (result.companyName && result.companyName !== 'Unknown') {
    await db
      .update(companies)
      .set({ name: result.companyName, industry: result.industry, summary: result.summary, updatedAt: new Date() })
      .where(eq(companies.id, companyId));
  }

  // Store intelligence
  const [intel] = await db
    .insert(companyIntelligence)
    .values({
      companyId,
      data: result,
      confidence: (result.confidence as 'high' | 'medium' | 'low' | 'unknown') || 'unknown',
    })
    .returning();

  logger.info('Intelligence extracted', { companyId, confidence: result.confidence });
  return intel;
}

export async function getIntelligenceForCompany(companyId: string) {
  const [latest] = await db
    .select()
    .from(companyIntelligence)
    .where(eq(companyIntelligence.companyId, companyId))
    .orderBy(desc(companyIntelligence.generatedAt))
    .limit(1);
  return latest ?? null;
}
