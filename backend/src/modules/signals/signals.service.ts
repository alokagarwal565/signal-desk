import { z } from 'zod';
import { db } from '../../db/index.js';
import { evidence, signals } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { aiExtract } from '../../ai/ai.service.js';
import { logger } from '../../utils/logger.js';

const signalSchema = z.object({
  signals: z.array(z.object({
    type: z.string().transform((val): 'HIRING' | 'FUNDING' | 'EXPANSION' | 'LEADERSHIP_CHANGE' | 'PARTNERSHIP' | 'PRODUCT_LAUNCH' | 'MARKET_ENTRY' | 'ACQUISITION' | 'CUSTOMER_GROWTH' | 'TECHNOLOGY_CHANGE' | 'STRATEGIC_CHANGE' | 'OTHER' => {
      const u = val.toUpperCase().replace(/\s+/g, '_');
      const valid = ['HIRING', 'FUNDING', 'EXPANSION', 'LEADERSHIP_CHANGE', 'PARTNERSHIP', 'PRODUCT_LAUNCH', 'MARKET_ENTRY', 'ACQUISITION', 'CUSTOMER_GROWTH', 'TECHNOLOGY_CHANGE', 'STRATEGIC_CHANGE', 'OTHER'] as const;
      return (valid as readonly string[]).includes(u) ? (u as typeof valid[number]) : 'OTHER';
    }),
    description: z.string().default(''),
    meaning: z.string().default(''),
    actionability: z.string().default(''),
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
    potentialImpact: z.string().optional().transform((val): string | undefined => {
      if (!val) return undefined;
      const l = val.toLowerCase();
      if (l === 'high' || l === 'medium' || l === 'low') return l;
      return undefined;
    }),
    supportingEvidence: z.union([z.array(z.string()), z.string().transform((s) => (s ? [s] : []))]).default([]),
  })).default([]),
});

export async function detectSignals(companyId: string) {
  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.companyId, companyId));

  if (evidenceRows.length === 0) return [];

  const evidenceSummary = evidenceRows
    .map((e, i) => `[Evidence ${i + 1}: ${e.sourceType} — ${e.sourceUrl}]\n${e.content.slice(0, 2000)}`)
    .join('\n\n---\n\n')
    .slice(0, 12000);

  const result = await aiExtract({
    operation: 'detect_signals',
    schema: signalSchema,
    messages: [
      {
        role: 'system',
        content: `You are a business signal detection analyst.

Detect meaningful business signals from the evidence. Only report signals that are ACTUALLY supported by the evidence.

For each signal, provide:
- type: one of HIRING, FUNDING, EXPANSION, LEADERSHIP_CHANGE, PARTNERSHIP, PRODUCT_LAUNCH, MARKET_ENTRY, ACQUISITION, CUSTOMER_GROWTH, TECHNOLOGY_CHANGE, STRATEGIC_CHANGE, OTHER
- description: what happened (factual)
- meaning: why it might matter to a business development professional
- actionability: whether someone should act on this signal
- confidence: high/medium/low/unknown
- potentialImpact: high/medium/low
- supportingEvidence: brief quotes or references from the evidence

Do NOT treat every fact as a signal. Only flag things that represent a CHANGE or a meaningful business indicator.
Do NOT invent signals that aren't supported by evidence.

Return JSON: { "signals": [...] }`,
      },
      {
        role: 'user',
        content: `Detect business signals from this evidence:\n\n${evidenceSummary}`,
      },
    ],
  });

  // Store signals
  const evidenceIdMap = Object.fromEntries(evidenceRows.map((e) => [e.sourceUrl, e.id]));

  const signalList = result?.signals ?? [];
  for (const signal of signalList) {
    await db.insert(signals).values({
      companyId,
      type: signal.type,
      description: signal.description,
      meaning: signal.meaning,
      actionability: signal.actionability,
      confidence: (signal.confidence as 'high' | 'medium' | 'low' | 'unknown') || 'unknown',
      potentialImpact: signal.potentialImpact,
    });
  }

  logger.info('Signals detected', { companyId, count: signalList.length });
  return signalList;
}

export async function getSignalsForCompany(companyId: string) {
  return db
    .select()
    .from(signals)
    .where(eq(signals.companyId, companyId))
    .orderBy(desc(signals.detectedAt));
}
