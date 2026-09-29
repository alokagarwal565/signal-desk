import { db } from '../../db/index.js';
import { companies, researchJobs } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { parseCompanyUrl } from '../../utils/url.js';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export async function createCompany(userId: string, rawUrl: string) {
  const { url, domain } = parseCompanyUrl(rawUrl);

  // Check if company already exists for this user
  const existing = await db
    .select()
    .from(companies)
    .where(and(eq(companies.userId, userId), eq(companies.domain, domain)))
    .limit(1);

  if (existing.length) {
    return { company: existing[0]!, isNew: false };
  }

  const [company] = await db
    .insert(companies)
    .values({ userId, url, domain, researchStatus: 'pending' })
    .returning();

  logger.info('Company created', { companyId: company!.id, domain });
  return { company: company!, isNew: true };
}

export async function getCompaniesForUser(userId: string) {
  return db
    .select()
    .from(companies)
    .where(eq(companies.userId, userId))
    .orderBy(desc(companies.updatedAt));
}

export async function getCompanyById(companyId: string, userId: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, companyId), eq(companies.userId, userId)))
    .limit(1);

  if (!company) throw AppError.notFound('Company not found');
  return company;
}

export async function updateCompany(
  companyId: string,
  userId: string,
  data: Partial<typeof companies.$inferInsert>
) {
  await getCompanyById(companyId, userId);
  const [updated] = await db
    .update(companies)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(companies.id, companyId), eq(companies.userId, userId)))
    .returning();
  logger.info('Company updated', { companyId, userId });
  return updated;
}

export async function deleteCompany(companyId: string, userId: string) {
  const company = await getCompanyById(companyId, userId);
  await db
    .delete(companies)
    .where(and(eq(companies.id, companyId), eq(companies.userId, userId)));
  logger.info('Company deleted', { companyId, userId });
  return company;
}

export async function getLatestResearchJob(companyId: string) {
  const [job] = await db
    .select()
    .from(researchJobs)
    .where(eq(researchJobs.companyId, companyId))
    .orderBy(desc(researchJobs.createdAt))
    .limit(1);
  return job;
}
