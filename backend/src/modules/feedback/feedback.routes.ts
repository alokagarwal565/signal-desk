import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth.js';
import { db } from '../../db/index.js';
import { feedback } from '../../db/schema.js';

const feedbackSchema = z.object({
  companyId: z.string().uuid().optional(),
  targetType: z.enum(['opportunity', 'signal', 'person', 'outreach']),
  targetId: z.string().uuid().optional(),
  rating: z.enum(['useful', 'not_useful', 'wrong_signal', 'wrong_person']),
  comment: z.string().max(1000).optional(),
});

export async function feedbackRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  app.post('/api/feedback', async (req, reply) => {
    const body = feedbackSchema.parse(req.body);
    const [entry] = await db
      .insert(feedback)
      .values({ userId: req.user.userId, ...body })
      .returning();
    return reply.status(201).send({ feedback: entry });
  });
}
