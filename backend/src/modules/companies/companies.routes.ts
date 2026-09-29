import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth.js';
import {
  createCompany,
  getCompaniesForUser,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getLatestResearchJob,
} from './companies.service.js';
import { startResearchJob } from '../research/research.service.js';
import { getIntelligenceForCompany } from '../intelligence/intelligence.service.js';
import { getSignalsForCompany } from '../signals/signals.service.js';
import { getOpportunityForCompany } from '../opportunities/opportunities.service.js';
import { getPeopleForCompany, researchPeople } from '../people/people.service.js';
import { generateOutreach, getOutreachForCompany } from '../outreach/outreach.service.js';
import { getSnapshotsForCompany } from '../snapshots/snapshots.service.js';
import { getChangesForCompany } from '../snapshots/changes.service.js';
import { db } from '../../db/index.js';
import { evidence } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const addCompanySchema = z.object({
  url: z.string().min(1).max(2000),
});

const updateCompanySchema = z.object({
  name: z.string().max(500).optional().nullable(),
  industry: z.string().max(255).optional().nullable(),
  summary: z.string().optional().nullable(),
});

const outreachSchema = z.object({
  personId: z.string().uuid().optional(),
});

export async function companyRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  // ─── Companies CRUD ────────────────────────────

  app.post('/api/companies', async (req, reply) => {
    const { url } = addCompanySchema.parse(req.body);
    const { company, isNew } = await createCompany(req.user.userId, url);

    if (isNew) {
      // Auto-start research for new companies
      await startResearchJob(company.id);
    }

    return reply.status(isNew ? 201 : 200).send({ company, isNew });
  });

  app.get('/api/companies', async (req) => {
    const companies = await getCompaniesForUser(req.user.userId);
    return { companies };
  });

  app.get<{ Params: { id: string } }>('/api/companies/:id', async (req) => {
    const company = await getCompanyById(req.params.id, req.user.userId);
    return { company };
  });

  app.patch<{ Params: { id: string } }>('/api/companies/:id', async (req) => {
    const data = updateCompanySchema.parse(req.body);
    const company = await updateCompany(req.params.id, req.user.userId, data);
    return { company };
  });

  app.delete<{ Params: { id: string } }>('/api/companies/:id', async (req) => {
    const company = await deleteCompany(req.params.id, req.user.userId);
    return { success: true, company };
  });

  // ─── Research ──────────────────────────────────

  app.post<{ Params: { id: string } }>('/api/companies/:id/research', async (req) => {
    await getCompanyById(req.params.id, req.user.userId); // auth check
    const job = await startResearchJob(req.params.id);
    return { jobId: job.id, status: job.status };
  });

  app.get<{ Params: { id: string } }>('/api/companies/:id/research/status', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const job = await getLatestResearchJob(req.params.id);
    return { job };
  });

  // ─── Intelligence ──────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/intelligence', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const intelligence = await getIntelligenceForCompany(req.params.id);
    return { intelligence };
  });

  // ─── Signals ───────────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/signals', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const signalsList = await getSignalsForCompany(req.params.id);
    return { signals: signalsList };
  });

  // ─── Opportunity ───────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/opportunity', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const opportunity = await getOpportunityForCompany(req.params.id);
    return { opportunity };
  });

  // ─── People ────────────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/people', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const peopleList = await getPeopleForCompany(req.params.id);
    return { people: peopleList };
  });

  app.post<{ Params: { id: string } }>('/api/companies/:id/people/research', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const peopleList = await researchPeople(req.params.id);
    return { people: peopleList };
  });

  // ─── Outreach ──────────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/outreach', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const drafts = await getOutreachForCompany(req.params.id);
    return { outreach: drafts[0] ?? null, drafts };
  });

  app.post<{ Params: { id: string } }>('/api/companies/:id/outreach', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const { personId } = outreachSchema.parse(req.body || {});
    const draft = await generateOutreach(req.params.id, personId);
    return { outreach: draft };
  });

  // ─── Snapshots ─────────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/snapshots', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const snapshotList = await getSnapshotsForCompany(req.params.id);
    return { snapshots: snapshotList };
  });

  // ─── Changes ───────────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/changes', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const changeList = await getChangesForCompany(req.params.id);
    return { changes: changeList };
  });

  // ─── Sources ───────────────────────────────────

  app.get<{ Params: { id: string } }>('/api/companies/:id/sources', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const sources = await db
      .select({
        id: evidence.id,
        sourceUrl: evidence.sourceUrl,
        sourceType: evidence.sourceType,
        title: evidence.title,
        authority: evidence.authority,
        retrievedAt: evidence.retrievedAt,
      })
      .from(evidence)
      .where(eq(evidence.companyId, req.params.id))
      .orderBy(desc(evidence.retrievedAt))
      .limit(50);
    return { sources };
  });

  // ─── Refresh (re-research + change detection) ─

  app.post<{ Params: { id: string } }>('/api/companies/:id/refresh', async (req) => {
    await getCompanyById(req.params.id, req.user.userId);
    const job = await startResearchJob(req.params.id);
    return { jobId: job.id, status: job.status };
  });
}
