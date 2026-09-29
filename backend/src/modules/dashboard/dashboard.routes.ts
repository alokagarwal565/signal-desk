import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.js';
import { getDashboardToday } from './dashboard.service.js';
import { db } from '../../db/index.js';
import { feedback, companies, opportunities, outreachDrafts } from '../../db/schema.js';
import { eq, count, inArray } from 'drizzle-orm';

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  app.get('/api/dashboard/today', async (req) => {
    const items = await getDashboardToday(req.user.userId);
    return { items, generatedAt: new Date().toISOString() };
  });

  // BRD §7.7 — Core product metrics (DEP-004)
  // ponytail: N+1 for MVP metrics (low frequency endpoint). Upgrade path: materialized view.
  app.get('/api/dashboard/metrics', async (req) => {
    const userId = req.user.userId;

    // Get all company IDs for this user
    const userCompanies = await db
      .select({ id: companies.id, status: companies.researchStatus })
      .from(companies)
      .where(eq(companies.userId, userId));

    const companyIds = userCompanies.map((c) => c.id);
    const statusMap = userCompanies.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    // Feedback stats
    const feedbackStats = await db
      .select({ rating: feedback.rating, total: count() })
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .groupBy(feedback.rating);

    const totalFeedback = feedbackStats.reduce((s, r) => s + r.total, 0);
    const usefulCount = feedbackStats.find((r) => r.rating === 'useful')?.total ?? 0;

    // Outreach + opportunities (only if companies exist)
    let draftsTotal = 0;
    let oppsTotal = 0;
    if (companyIds.length > 0) {
      const [drafts] = await db
        .select({ total: count() })
        .from(outreachDrafts)
        .where(inArray(outreachDrafts.companyId, companyIds));
      draftsTotal = drafts?.total ?? 0;

      const [opps] = await db
        .select({ total: count() })
        .from(opportunities)
        .where(inArray(opportunities.companyId, companyIds));
      oppsTotal = opps?.total ?? 0;
    }

    return {
      metrics: {
        companies: {
          total: userCompanies.length,
          byStatus: statusMap,
        },
        feedback: {
          total: totalFeedback,
          useful: usefulCount,
          notUseful: feedbackStats.find((r) => r.rating === 'not_useful')?.total ?? 0,
          // BRD §7.7 recommendation action rate
          actionRate: totalFeedback > 0 ? Math.round((usefulCount / totalFeedback) * 100) : null,
        },
        outreachDraftsGenerated: draftsTotal,
        opportunitiesScored: oppsTotal,
      },
    };
  });
}
