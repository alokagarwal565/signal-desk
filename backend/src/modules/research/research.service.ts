import { db } from '../../db/index.js';
import { companies, evidence, researchJobs } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { discoverPages, scrapePage } from './scraper.js';
import { extractIntelligence } from '../intelligence/intelligence.service.js';
import { detectSignals } from '../signals/signals.service.js';
import { calculateOpportunity } from '../opportunities/opportunities.service.js';
import { researchPeople } from '../people/people.service.js';
import { createSnapshot } from '../snapshots/snapshots.service.js';
import { detectChanges } from '../snapshots/changes.service.js';
import { logger } from '../../utils/logger.js';

export async function startResearchJob(companyId: string) {
  const [job] = await db
    .insert(researchJobs)
    .values({
      companyId,
      status: 'pending',
      progress: { step: 'queued' },
    })
    .returning();

  // Update company status
  await db.update(companies).set({ researchStatus: 'pending', updatedAt: new Date() }).where(eq(companies.id, companyId));

  // ponytail: In-process async execution for MVP. Upgrade path: BullMQ worker when concurrency/reliability matters.
  // We do it fire-and-forget so the API responds immediately.
  processResearch(companyId, job!.id).catch((err) => {
    logger.error('Research job failed', { companyId, jobId: job!.id, error: String(err) });
  });

  return job!;
}

async function updateJobProgress(jobId: string, progress: Record<string, string>, status?: string) {
  await db
    .update(researchJobs)
    .set({
      progress,
      ...(status ? { status: status as 'pending' | 'in_progress' | 'completed' | 'partial' | 'failed' } : {}),
      ...(status === 'in_progress' ? { startedAt: new Date() } : {}),
      ...(status === 'completed' || status === 'partial' || status === 'failed'
        ? { completedAt: new Date() }
        : {}),
    })
    .where(eq(researchJobs.id, jobId));
}

async function processResearch(companyId: string, jobId: string) {
  logger.info('Research started', { companyId, jobId });

  await updateJobProgress(jobId, { step: 'discovering_pages' }, 'in_progress');
  await db.update(companies).set({ researchStatus: 'in_progress', updatedAt: new Date() }).where(eq(companies.id, companyId));

  // 1. Get company URL
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  if (!company) throw new Error('Company not found');

  // 2. Discover and scrape pages
  await updateJobProgress(jobId, { step: 'discovering_pages', url: company.url });
  const pages = await discoverPages(company.url);

  let sourcesSucceeded = 0;
  let sourcesFailed = 0;

  await updateJobProgress(jobId, { step: 'scraping', total: String(pages.length), completed: '0' });

  const scrapedPages = [];
  for (let i = 0; i < pages.length; i++) {
    const page = await scrapePage(pages[i]!);
    if (page.success && page.content.length > 50) {
      scrapedPages.push(page);
      sourcesSucceeded++;

      // Store evidence
      await db.insert(evidence).values({
        companyId,
        sourceUrl: page.url,
        sourceType: page.sourceType,
        title: page.title,
        content: page.content.slice(0, 100000),
        authority: 'first_party',
      });
    } else {
      sourcesFailed++;
    }

    await updateJobProgress(jobId, {
      step: 'scraping',
      total: String(pages.length),
      completed: String(i + 1),
    });
  }

  await db
    .update(researchJobs)
    .set({ sourcesAttempted: pages.length, sourcesSucceeded, sourcesFailed })
    .where(eq(researchJobs.id, jobId));

  if (scrapedPages.length === 0) {
    await updateJobProgress(jobId, { step: 'failed', error: 'No pages could be scraped' }, 'failed');
    await db.update(companies).set({ researchStatus: 'failed', updatedAt: new Date() }).where(eq(companies.id, companyId));
    return;
  }

  // 3. AI Intelligence extraction
  await updateJobProgress(jobId, { step: 'extracting_intelligence' });
  try {
    await extractIntelligence(companyId);
  } catch (err) {
    logger.error('Intelligence extraction failed', { companyId, error: String(err) });
  }

  // 4. Signal detection
  await updateJobProgress(jobId, { step: 'detecting_signals' });
  try {
    await detectSignals(companyId);
  } catch (err) {
    logger.error('Signal detection failed', { companyId, error: String(err) });
  }

  // 5. Opportunity scoring
  await updateJobProgress(jobId, { step: 'scoring_opportunity' });
  try {
    await calculateOpportunity(companyId);
  } catch (err) {
    logger.error('Opportunity scoring failed', { companyId, error: String(err) });
  }

  // 6. Research people
  await updateJobProgress(jobId, { step: 'researching_people' });
  try {
    await researchPeople(companyId);
  } catch (err) {
    logger.error('People research failed', { companyId, error: String(err) });
  }

  // 7. Create snapshot
  await updateJobProgress(jobId, { step: 'creating_snapshot' });
  try {
    const snapshot = await createSnapshot(companyId);

    // 7. Detect changes if there's a previous snapshot
    await detectChanges(companyId, snapshot.id);
  } catch (err) {
    logger.error('Snapshot/change detection failed', { companyId, error: String(err) });
  }

  // Complete
  const finalStatus = sourcesFailed > 0 && sourcesSucceeded > 0 ? 'partial' : 'completed';
  await updateJobProgress(
    jobId,
    {
      step: 'completed',
      sourcesSucceeded: String(sourcesSucceeded),
      sourcesFailed: String(sourcesFailed),
    },
    finalStatus,
  );

  await db
    .update(companies)
    .set({
      researchStatus: finalStatus as 'completed' | 'partial',
      lastResearchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));

  logger.info('Research completed', { companyId, jobId, sourcesSucceeded, sourcesFailed });
}
