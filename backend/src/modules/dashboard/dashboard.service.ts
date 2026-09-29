import { db } from '../../db/index.js';
import {
  companies,
  opportunities,
  signals,
  people,
  companyIntelligence,
} from '../../db/schema.js';
import { eq, desc, and, isNotNull } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';

export interface DashboardItem {
  company: {
    id: string;
    name: string | null;
    domain: string;
    industry: string | null;
  };
  opportunity: {
    totalScore: number;
    strategicFit: number;
    recentTrigger: number;
    growthSignal: number;
    reachability: number;
    evidenceConfidence: number;
    whyNow: string | null;
    confidence: string;
  } | null;
  strongestSignal: {
    type: string;
    description: string;
  } | null;
  topPerson: {
    name: string;
    role: string | null;
    whyRelevant: string | null;
  } | null;
  recommendedAction: string | null;
}

export async function getDashboardToday(userId: string): Promise<DashboardItem[]> {
  // Get all user companies with completed research
  const userCompanies = await db
    .select()
    .from(companies)
    .where(
      and(
        eq(companies.userId, userId),
        isNotNull(companies.lastResearchedAt),
      ),
    );

  if (userCompanies.length === 0) return [];

  const items: DashboardItem[] = [];

  for (const company of userCompanies) {
    // Get latest opportunity
    const [opp] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.companyId, company.id))
      .orderBy(desc(opportunities.calculatedAt))
      .limit(1);

    // Get strongest signal (highest confidence first, then most recent)
    const [topSignal] = await db
      .select()
      .from(signals)
      .where(eq(signals.companyId, company.id))
      .orderBy(desc(signals.detectedAt))
      .limit(1);

    // Get top person
    const [topPerson] = await db
      .select()
      .from(people)
      .where(eq(people.companyId, company.id))
      .orderBy(desc(people.relevanceScore))
      .limit(1);

    items.push({
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        industry: company.industry,
      },
      opportunity: opp
        ? {
            totalScore: opp.totalScore,
            strategicFit: opp.strategicFit,
            recentTrigger: opp.recentTrigger,
            growthSignal: opp.growthSignal,
            reachability: opp.reachability,
            evidenceConfidence: opp.evidenceConfidence,
            whyNow: opp.whyNow,
            confidence: opp.confidence,
          }
        : null,
      strongestSignal: topSignal
        ? { type: topSignal.type, description: topSignal.description }
        : null,
      topPerson: topPerson
        ? { name: topPerson.name, role: topPerson.role, whyRelevant: topPerson.whyRelevant }
        : null,
      // BRD §F: recommended action is distinct from "why now"
      // Use explanation summary if available; otherwise derive from whyNow
      recommendedAction: opp?.explanation
        ? opp.explanation.split('\n')[0]?.slice(0, 150) ?? null
        : opp?.whyNow ?? null,
    });
  }

  // ─── Ranking ──────────────────────────────────
  // ponytail: Deterministic ranking — not just raw score. Considers recency, signal strength, evidence confidence.
  // Upgrade path: per-user weighting, dismissed-opportunity filtering.
  return items
    .filter((item) => item.opportunity !== null)
    .sort((a, b) => {
      const scoreA = rankItem(a);
      const scoreB = rankItem(b);
      return scoreB - scoreA;
    })
    .slice(0, 5);
}

export function rankItem(item: DashboardItem): number {
  if (!item.opportunity) return 0;

  let rank = item.opportunity.totalScore;

  // Boost for strong recent triggers
  rank += item.opportunity.recentTrigger * 0.5;

  // Boost for having a person identified
  if (item.topPerson) rank += 5;

  // Boost for high-confidence signals
  if (item.strongestSignal) rank += 3;

  // Penalty for low confidence
  if (item.opportunity.confidence === 'low') rank -= 10;
  if (item.opportunity.confidence === 'unknown') rank -= 15;

  return rank;
}
