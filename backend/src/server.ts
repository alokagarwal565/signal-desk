import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { AppError } from './utils/errors.js';
import { ZodError } from 'zod';

// Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { companyRoutes } from './modules/companies/companies.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { feedbackRoutes } from './modules/feedback/feedback.routes.js';

const app = Fastify({ logger: false });

// ─── Plugins ──────────────────────────────────────

await app.register(cors, {
  origin: config.env === 'production' ? false : true,
  credentials: true,
});

await app.register(helmet, {
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
});

// Allow empty body with application/json
app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body: string | Buffer, done) => {
  const str = typeof body === 'string' ? body : body.toString('utf-8');
  if (!str || str.trim() === '') {
    done(null, {});
    return;
  }
  try {
    done(null, JSON.parse(str));
  } catch (err) {
    done(err as Error, undefined);
  }
});

// ─── Error Handler ────────────────────────────────

app.setErrorHandler((err, req, reply) => {
  const error = err as Error;
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation Error',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Application errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code,
    });
  }

  // Unknown errors — don't expose internals
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    path: req.url,
    method: req.method,
  });

  return reply.status(500).send({
    error: 'Internal server error',
  });
});

// ─── Routes ───────────────────────────────────────

await app.register(authRoutes);
await app.register(companyRoutes);
await app.register(dashboardRoutes);
await app.register(feedbackRoutes);

// Health check
app.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// ─── Start ────────────────────────────────────────

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  logger.info(`SignalDesk API running on port ${config.port}`);
} catch (err) {
  logger.error('Server failed to start', { error: String(err) });
  process.exit(1);
}
