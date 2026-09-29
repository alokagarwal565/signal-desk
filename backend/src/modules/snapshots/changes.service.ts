import { z } from 'zod';
import { db } from '../../db/index.js';
import { changes, snapshots } from '../../db/schema.js';
import { eq, desc, lt } from 'drizzle-orm';
import { aiExtract } from '../../ai/ai.service.js';
import { logger } from '../../utils/logger.js';

const changesSchema = z.object({
  changes: z.array(z.object({
    changeType: z.string().default('UPDATE'),
    description: z.string().default(''),
    significance: z.string().transform((val): string => {
      const l = val.toLowerCase();
      if (l === 'high' || l === 'medium' || l === 'low') return l;
      return 'medium';
    }).default('medium'),
    actionability: z.string().transform((val): string => {
      const l = val.toLowerCase();
      if (l === 'high' || l === 'medium' || l === 'low') return l;
      return 'medium';
    }).default('medium'),
    recommendedAction: z.string().optional(),
  })).default([]),
});

export async function detectChanges(companyId: string, currentSnapshotId: string) {
  // Find previous snapshot
  const currentSnapshot = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.id, currentSnapshotId))
    .limit(1);

  if (!currentSnapshot.length) return [];

  const [previousSnapshot] = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.companyId, companyId))
    .orderBy(desc(snapshots.createdAt))
    .limit(2);

  // Need at least 2 snapshots for comparison
  const allSnapshots = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.companyId, companyId))
    .orderBy(desc(snapshots.createdAt))
    .limit(2);

  if (allSnapshots.length < 2) {
    logger.info('No previous snapshot for comparison', { companyId });
    return [];
  }

  const current = allSnapshots[0]!;
  const previous = allSnapshots[1]!;

  const result = await aiExtract({
    operation: 'detect_changes',
    schema: changesSchema,
    messages: [
      {
        role: 'system',
        content: `You are a change detection analyst. Compare two company snapshots and identify MEANINGFUL changes.

RULES:
- Only report changes that are genuinely meaningful for business development.
- Separate "What changed?" from "Does it matter?" from "Should I act?"
- Do NOT report trivial wording differences.
- Focus on changes in: opportunity score, signals, people, growth indicators, strategic direction.

For each change:
- changeType: brief category (e.g., "Score Increase", "New Signal", "Leadership Change")
- description: what changed
- significance: high/medium/low — how important is this change?
- actionability: high/medium/low — should someone do something about it?
- recommendedAction: what to do (if actionability is medium or high)

Return JSON: { "changes": [...] }`,
      },
      {
        role: 'user',
        content: `Previous snapshot (#${previous.snapshotNumber}, ${previous.createdAt.toISOString()}):\n${JSON.stringify(
          {
            intelligence: previous.intelligenceData,
            signals: previous.signalsData,
            opportunity: previous.opportunityData,
            people: previous.peopleData,
            evidenceCount: previous.evidenceCount,
          },
          null,
          2,
        ).slice(0, 5000)}\n\nCurrent snapshot (#${current.snapshotNumber}, ${current.createdAt.toISOString()}):\n${JSON.stringify(
          {
            intelligence: current.intelligenceData,
            signals: current.signalsData,
            opportunity: current.opportunityData,
            people: current.peopleData,
            evidenceCount: current.evidenceCount,
          },
          null,
          2,
        ).slice(0, 5000)}`,
      },
    ],
  });

  // Store changes
  const changeList = result?.changes ?? [];
  for (const change of changeList) {
    await db.insert(changes).values({
      companyId,
      previousSnapshotId: previous.id,
      currentSnapshotId: current.id,
      changeType: change.changeType,
      description: change.description,
      significance: change.significance,
      actionability: change.actionability,
      recommendedAction: change.recommendedAction,
    });
  }

  logger.info('Changes detected', { companyId, count: changeList.length });
  return changeList;
}

export async function getChangesForCompany(companyId: string) {
  return db
    .select()
    .from(changes)
    .where(eq(changes.companyId, companyId))
    .orderBy(desc(changes.detectedAt));
}
