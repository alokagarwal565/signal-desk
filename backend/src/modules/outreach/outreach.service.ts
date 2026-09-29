import { db } from '../../db/index.js';
import {
  outreachDrafts,
  people,
  companyIntelligence,
  opportunities,
  evidence,
  companies,
} from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { aiComplete } from '../../ai/ai.service.js';
import { logger } from '../../utils/logger.js';

export async function generateOutreach(companyId: string, personId?: string) {
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
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

  let person = null;
  if (personId) {
    const [p] = await db.select().from(people).where(eq(people.id, personId)).limit(1);
    person = p ?? null;
  }
  if (!person) {
    // Get highest-relevance person
    const [p] = await db
      .select()
      .from(people)
      .where(eq(people.companyId, companyId))
      .orderBy(desc(people.relevanceScore))
      .limit(1);
    person = p ?? null;
  }

  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.companyId, companyId));

  const keyEvidence = evidenceRows
    .slice(0, 5)
    .map((e) => `[${e.sourceType}] ${e.title}: ${e.content.slice(0, 500)}`)
    .join('\n');

  const intelData = intel?.data as Record<string, unknown> | undefined;

  const message = await aiComplete(
    [
      {
        role: 'system',
        content: `You are writing a first-touch outreach message for a business development professional.

RULES:
- The message MUST reference specific facts from the evidence provided.
- NEVER use generic phrases like "I came across your amazing company" or "I was impressed by your growth."
- NEVER invent facts, partnerships, funding rounds, metrics, or personal achievements.
- Keep it concise: 3-5 sentences maximum.
- The tone should be professional, direct, and curious — not salesy.
- Reference a specific signal or development that creates relevance.
- End with a specific, low-commitment ask (e.g., "Would it be worth a quick conversation about X?")
- Do NOT include a subject line unless asked.`,
      },
      {
        role: 'user',
        content: `Company: ${company?.name ?? company?.domain ?? 'Unknown'}
Intelligence: ${JSON.stringify(intelData ?? {}, null, 2).slice(0, 2000)}
Opportunity: ${opp?.whyNow ?? 'Unknown'}
Person: ${person ? `${person.name} (${person.role}) — ${person.whyRelevant}` : 'Unknown contact'}
Key evidence:
${keyEvidence}

Write the outreach message.`,
      },
    ],
    'generate_outreach',
    { temperature: 0.7 },
  );

  // Build context description
  const context = [
    person ? `To: ${person.name} (${person.role})` : 'To: Unknown contact',
    `Company: ${company?.name ?? company?.domain}`,
    opp?.whyNow ? `Why now: ${opp.whyNow}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Get current version count
  const existingDrafts = await db
    .select()
    .from(outreachDrafts)
    .where(eq(outreachDrafts.companyId, companyId));

  const [draft] = await db
    .insert(outreachDrafts)
    .values({
      companyId,
      personId: person?.id,
      message,
      context,
      evidenceUsed: evidenceRows.slice(0, 5).map((e) => e.id),
      version: existingDrafts.length + 1,
    })
    .returning();

  logger.info('Outreach generated', { companyId, personId: person?.id });
  return draft;
}

export async function getOutreachForCompany(companyId: string) {
  const drafts = await db
    .select()
    .from(outreachDrafts)
    .where(eq(outreachDrafts.companyId, companyId))
    .orderBy(desc(outreachDrafts.createdAt));

  return drafts;
}

