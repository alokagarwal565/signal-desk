import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.js';
import { getDashboardToday } from './dashboard.service.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  app.get('/api/dashboard/today', async (req) => {
    const items = await getDashboardToday(req.user.userId);
    return { items, generatedAt: new Date().toISOString() };
  });
}
