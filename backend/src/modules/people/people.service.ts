import { z } from 'zod';
import { db } from '../../db/index.js';
import { people, evidence, companyIntelligence, opportunities } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { aiExtract } from '../../ai/ai.service.js';
import { logger } from '../../utils/logger.js';

const peopleSchema = z.object({
  people: z.array(z.object({
    name: z.string().default('Unknown Person'),
    role: z.string().default('Team Member'),
    profileUrl: z.string().optional(),
    whyRelevant: z.string().default(''),
    relevanceScore: z.number().min(0).max(100).default(50),
    persona: z.string().default('General'),
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
  })).default([]),
});

export async function researchPeople(companyId: string) {
  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.companyId, companyId));

  const [intel] = await db
    .select()
    .from(companyIntelligence)
    .where(eq(companyIntelligence.companyId, companyId))
    .orderBy(desc(companyIntelligence.generatedAt))
    .limit(1);

  const [opp] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.companyId, companyId))
    .orderBy(desc(opportunities.calculatedAt))
    .limit(1);

  const priorityTypes = ['team', 'about', 'leadership', 'contact', 'careers', 'news', 'press', 'blog', 'product', 'homepage'];
  const sortedEvidence = [...evidenceRows].sort((a, b) => {
    const aIdx = priorityTypes.indexOf(a.sourceType);
    const bIdx = priorityTypes.indexOf(b.sourceType);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  const evidenceSummary = sortedEvidence
    .map((e) => `[${e.sourceType} - ${e.title}]: ${e.content.slice(0, 1500)}`)
    .join('\n---\n')
    .slice(0, 10000);

  const result = await aiExtract({
    operation: 'research_people',
    schema: peopleSchema,
    messages: [
      {
        role: 'system',
        content: `You are a B2B sales intelligence analyst. Identify key leadership, founders, and decision-maker contacts at the target company for business development outreach.

RULES:
1. TARGET COMPANY PERSONNEL ONLY: Only identify people who work at or founded the target company. Do NOT include third-party clients, customer quotes, or external testimonial providers (e.g. if someone is described as working at a customer or partner organization like Tata Capital, do NOT include them as company personnel).
2. REAL EXECUTIVES & FOUNDERS FIRST: Search the evidence (especially About Us, Team, Structured Organization & People Metadata, and Blog authors) for actual named founders and leaders (e.g., Dr. Vivek Raghavan, Dr. Pratyush Kumar). Set confidence: "high" if confirmed by structured data/about page, "medium" if mentioned in articles.
3. INFERRED BUYER ROLES (Only if fewer than 2 real leaders are found): Suggest up to 2 key functional target titles (e.g., "VP of Engineering", "Head of AI Partnerships"). For inferred roles, use the title as the name (e.g. "VP of Engineering"), do NOT append repetitive words like "Decision Maker" to the name. Set confidence: "low".
4. persona should categorize their function (e.g. "Founder / Executive", "Technical Decision Maker", "Product Lead", "Partnerships Lead").
5. Provide a specific, concise "whyRelevant" explaining why this contact matters for the business development opportunity.

Return JSON: { "people": [...] }`,
      },
      {
        role: 'user',
        content: `Company intelligence: ${JSON.stringify(intel?.data ?? {}, null, 2).slice(0, 3000)}\n\nOpportunity context: ${opp?.whyNow ?? 'Unknown'}\n\nEvidence:\n${evidenceSummary}`,
      },
    ],
  });

  // Clear existing people and store new ones
  await db.delete(people).where(eq(people.companyId, companyId));

  const peopleList = result?.people ?? [];
  for (const person of peopleList) {
    await db.insert(people).values({
      companyId,
      name: person.name,
      role: person.role,
      profileUrl: person.profileUrl,
      whyRelevant: person.whyRelevant,
      relevanceScore: person.relevanceScore,
      persona: person.persona,
      confidence: (person.confidence as 'high' | 'medium' | 'low' | 'unknown') || 'unknown',
    });
  }

  logger.info('People researched', { companyId, count: peopleList.length });
  return peopleList;
}

export async function getPeopleForCompany(companyId: string) {
  return db
    .select()
    .from(people)
    .where(eq(people.companyId, companyId))
    .orderBy(desc(people.relevanceScore));
}
