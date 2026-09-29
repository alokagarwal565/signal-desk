# SignalDesk

AI-powered company intelligence and opportunity prioritization platform.

## What is SignalDesk?

SignalDesk researches companies using public information, identifies meaningful business signals, evaluates opportunity, identifies relevant people to approach, generates contextual outreach, and tells you:

> **"What are the 5 companies or opportunities I should act on today, and why?"**

## Problem

Business development professionals spend too much time manually researching companies. SignalDesk compresses the research → prioritization → action workflow.

## Features

- **Company Research**: Add a URL, get AI-powered company intelligence
- **Signal Detection**: Identifies hiring, funding, expansion, and other business signals
- **Opportunity Scoring**: Transparent, evidence-based scoring with full breakdown
- **People Identification**: Finds the right person to contact and explains why
- **Contextual Outreach**: Generates evidence-based, non-generic outreach messages
- **Change Detection**: Tracks company changes over time, surfaces meaningful triggers
- **Daily Top 5**: Dashboard that answers "What should I act on today?"

## Architecture

Modular monolith:
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Fastify + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **AI**: Groq (primary) + OpenRouter (fallback)
- **Jobs**: BullMQ + Redis

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

## Setup

```bash
# Clone and install
git clone <repo>
cd signaldesk
npm install

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Database setup
npm run db:migrate

# Start development
npm run dev
```

Backend runs on `http://localhost:3001`
Frontend runs on `http://localhost:5173`

## Environment Variables

See `backend/.env.example` for all required variables.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `GROQ_API_KEY` — Groq API key
- `OPENROUTER_API_KEY` — OpenRouter API key (fallback)
- `JWT_SECRET` — JWT signing secret

## Testing

```bash
npm test
```

## License

Private
