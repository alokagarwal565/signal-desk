import { z } from 'zod';
import { db } from '../../db/index.js';
import {
  opportunities,
  companyIntelligence,
  signals,
  evidence,
} from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { aiExtract, aiComplete } from '../../ai/ai.service.js';
import { logger } from '../../utils/logger.js';

// ─── Scoring Weights ─────────────────────────────────
// ponytail: Configurable scoring weights. Move to DB/config if users need per-user customization.
export const WEIGHTS = {
  strategicFit: 30,
  recentTrigger: 25,
  growthSignal: 20,
  reachability: 15,
  evidenceConfidence: 10,
} as const;

export interface ScoreAttributes {
  strategicFit: number;
  recentTrigger: number;
  growthSignal: number;
  reachability: number;
  evidenceConfidence: number;
}

export function computeOpportunityScore(attributes: ScoreAttributes) {
  const strategicFit = Math.round(attributes.strategicFit * WEIGHTS.strategicFit);
  const recentTrigger = Math.round(attributes.recentTrigger * WEIGHTS.recentTrigger);
  const growthSignal = Math.round(attributes.growthSignal * WEIGHTS.growthSignal);
  const reachability = Math.round(attributes.reachability * WEIGHTS.reachability);
  const evidenceConfidence = Math.round(attributes.evidenceConfidence * WEIGHTS.evidenceConfidence);
  const totalScore = strategicFit + recentTrigger + growthSignal + reachability + evidenceConfidence;
  return { strategicFit, recentTrigger, growthSignal, reachability, evidenceConfidence, totalScore };
}

// AI extracts attributes on a 0-1 scale, then the deterministic engine applies weights.
const attributeSchema = z.object({
  strategicFit: z.coerce.number().min(0).max(1).default(0.5),
  recentTrigger: z.coerce.number().min(0).max(1).default(0.5),
  growthSignal: z.coerce.number().min(0).max(1).default(0.5),
  reachability: z.coerce.number().min(0).max(1).default(0.5),
  evidenceConfidence: z.coerce.number().min(0).max(1).default(0.5),
  reasoning: z.object({
    strategicFit: z.string().default(''),
    recentTrigger: z.string().default(''),
    growthSignal: z.string().default(''),
    reachability: z.string().default(''),
    evidenceConfidence: z.string().default(''),
  }).optional().default({}),
  confidence: z.union([z.string(), z.number()]).transform((val): 'high' | 'medium' | 'low' | 'unknown' => {
    if (typeof val === 'number') {
      if (val >= 0.7) return 'high';
      if (val >= 0.4) return 'medium';
      return 'low';
    }
    const l = String(val).toLowerCase();
    if (l === 'high' || l === 'medium' || l === 'low') return l;
    return 'unknown';
  }).default('unknown'),
});

export async function calculateOpportunity(companyId: string) {
  // Gather inputs
  const [latestIntel] = await db
    .select()
    .from(companyIntelligence)
    .where(eq(companyIntelligence.companyId, companyId))
    .orderBy(desc(companyIntelligence.generatedAt))
    .limit(1);

  const companySignals = await db
    .select()
    .from(signals)
    .where(eq(signals.companyId, companyId));

  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.companyId, companyId));

  if (!latestIntel) {
    logger.warn('No intelligence for opportunity scoring', { companyId });
    return null;
  }

  const intelData = latestIntel.data as Record<string, unknown>;
  const signalSummary = companySignals
    .map((s) => `[${s.type}] ${s.description}`)
    .join('\n');

  // Step 1: AI extracts structured attributes (0-1 scale)
  const attributes = await aiExtract({
    operation: 'score_opportunity_attributes',
    schema: attributeSchema,
    messages: [
      {
        role: 'system',
        content: `You are an opportunity scoring analyst. Evaluate a company as a business development opportunity.

Score each dimension from 0 to 1 (decimal):
- strategicFit: How well does this company align with typical B2B partnership/sales opportunities? (0 = no fit, 1 = perfect fit)
- recentTrigger: Is there a recent event or change that creates urgency? (0 = no recent trigger, 1 = strong recent trigger)
- growthSignal: Are there indicators of growth? (0 = no growth signals, 1 = strong growth)
- reachability: How easy is it to identify and reach decision makers? (0 = impossible, 1 = very reachable)
- evidenceConfidence: How confident are you in the evidence quality? (0 = very uncertain, 1 = very confident)

For each, provide brief reasoning.

Be honest — do not inflate scores. If evidence is insufficient, score low.
Return JSON with the schema: { strategicFit, recentTrigger, growthSignal, reachability, evidenceConfidence, reasoning: { strategicFit, recentTrigger, growthSignal, reachability, evidenceConfidence }, confidence }`,
      },
      {
        role: 'user',
        content: `Company intelligence:\n${JSON.stringify(intelData, null, 2).slice(0, 5000)}\n\nSignals:\n${signalSummary}\n\nEvidence sources: ${evidenceRows.length}`,
      },
    ],
  });

  // Step 2: Deterministic scoring engine
  const { strategicFit, recentTrigger, growthSignal, reachability, evidenceConfidence, totalScore } =
    computeOpportunityScore(attributes);

  // Step 3: Generate "Why Now" explanation
  const whyNow = await aiComplete(
    [
      {
        role: 'system',
        content: 'Write a concise 1-2 sentence "Why Now" explanation for why a business development professional should act on this company TODAY. Ground it in specific evidence. Do not be generic. Do not say "I came across your amazing company."',
      },
      {
        role: 'user',
        content: `Company: ${(intelData as Record<string, unknown>).companyName}\nSignals: ${signalSummary}\nScore: ${totalScore}/100\nTop scoring factor: ${Object.entries({ strategicFit, recentTrigger, growthSignal, reachability, evidenceConfidence }).sort(([, a], [, b]) => b - a)[0]?.[0]}`,
      },
    ],
    'generate_why_now',
  );

  // Build explanation
  const explanation = Object.entries(attributes.reasoning)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  // Store
  const [opp] = await db
    .insert(opportunities)
    .values({
      companyId,
      totalScore,
      strategicFit,
      recentTrigger,
      growthSignal,
      reachability,
      evidenceConfidence,
      whyNow,
      explanation,
      confidence: (attributes.confidence as 'high' | 'medium' | 'low' | 'unknown') || 'unknown',
    })
    .returning();

  logger.info('Opportunity scored', { companyId, totalScore });
  return opp;
}

export async function getOpportunityForCompany(companyId: string) {
  const [latest] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.companyId, companyId))
    .orderBy(desc(opportunities.calculatedAt))
    .limit(1);
  return latest ?? null;
}
