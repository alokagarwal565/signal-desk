import { db } from '../../db/index.js';
import {
  snapshots,
  companyIntelligence,
  signals as signalsTable,
  opportunities,
  people,
  evidence,
} from '../../db/schema.js';
import { eq, desc, count } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';

export async function createSnapshot(companyId: string) {
  // Gather current state
  const [intel] = await db
    .select()
    .from(companyIntelligence)
    .where(eq(companyIntelligence.companyId, companyId))
    .orderBy(desc(companyIntelligence.generatedAt))
    .limit(1);

  const companySignals = await db
    .select()
    .from(signalsTable)
    .where(eq(signalsTable.companyId, companyId));

  const [opp] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.companyId, companyId))
    .orderBy(desc(opportunities.calculatedAt))
    .limit(1);

  const companyPeople = await db
    .select()
    .from(people)
    .where(eq(people.companyId, companyId));

  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.companyId, companyId));

  // Get current snapshot count for numbering
  const existing = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.companyId, companyId));

  const [snapshot] = await db
    .insert(snapshots)
    .values({
      companyId,
      intelligenceData: intel?.data ?? null,
      signalsData: companySignals.map((s) => ({
        type: s.type,
        description: s.description,
        confidence: s.confidence,
      })),
      opportunityData: opp
        ? {
            totalScore: opp.totalScore,
            strategicFit: opp.strategicFit,
            recentTrigger: opp.recentTrigger,
            growthSignal: opp.growthSignal,
            reachability: opp.reachability,
            evidenceConfidence: opp.evidenceConfidence,
            whyNow: opp.whyNow,
          }
        : null,
      peopleData: companyPeople.map((p) => ({
        name: p.name,
        role: p.role,
        relevanceScore: p.relevanceScore,
      })),
      evidenceCount: evidenceRows.length,
      snapshotNumber: existing.length + 1,
    })
    .returning();

  logger.info('Snapshot created', {
    companyId,
    snapshotId: snapshot!.id,
    snapshotNumber: existing.length + 1,
  });

  return snapshot!;
}

export async function getSnapshotsForCompany(companyId: string) {
  return db
    .select()
    .from(snapshots)
    .where(eq(snapshots.companyId, companyId))
    .orderBy(desc(snapshots.createdAt));
}
