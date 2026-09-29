import 'dotenv/config';

function required(key: string, devFallback?: string): string {
  const val = process.env[key] || (process.env.NODE_ENV !== 'production' ? devFallback : undefined);
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3001'), 10),

  db: {
    url: required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/signaldesk'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  ai: {
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
      model: optional('GROQ_MODEL', 'llama-3.3-70b-versatile'),
      fastModel: optional('GROQ_FAST_MODEL', 'llama-3.3-70b-versatile'),
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: optional('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct'),
      fastModel: optional('OPENROUTER_FAST_MODEL', 'meta-llama/llama-3.3-70b-instruct'),
    },
    maxRetries: 3,
    timeoutMs: 30000,
  },

  auth: {
    jwtSecret: required('JWT_SECRET', 'signaldesk-dev-secret-change-in-production'),
    tokenExpiresIn: '7d',
  },

  research: {
    maxConcurrent: parseInt(optional('MAX_CONCURRENT_RESEARCH', '3'), 10),
    timeoutMs: parseInt(optional('RESEARCH_TIMEOUT_MS', '60000'), 10),
    maxPagesPerSite: parseInt(optional('MAX_PAGES_PER_SITE', '10'), 10),
  },
} as const;
