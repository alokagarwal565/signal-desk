# SignalDesk Architecture

## System Overview

```
React Frontend (Vite)
       │
       │ REST API (JSON)
       ▼
Fastify API Server
       │
       ├── Auth Middleware (JWT)
       ├── Route Handlers
       │      │
       │      ▼
       ├── Module Services
       │      │
       │      ├── Companies
       │      ├── Research (scraper + orchestrator)
       │      ├── Intelligence (AI extraction)
       │      ├── Signals (AI detection)
       │      ├── Opportunities (AI attributes + deterministic scoring)
       │      ├── People (AI identification)
       │      ├── Outreach (AI generation)
       │      ├── Snapshots
       │      ├── Changes (AI diff analysis)
       │      └── Dashboard (deterministic ranking)
       │
       ├── AI Service
       │      ├── Groq Provider (primary)
       │      └── OpenRouter Provider (fallback)
       │
       └── PostgreSQL (Drizzle ORM)
```

## Database

PostgreSQL with Drizzle ORM. Schema is defined in TypeScript with generated SQL migrations.

### Key Data Separation

| Category | Examples | Retention |
|----------|----------|-----------|
| Permanent | companies, users, people | Indefinite |
| Regeneratable | AI summaries, scores, outreach | Can be re-created |
| Historical | snapshots, signals, changes | Append-only |
| Tracking | ai_usage, feedback | Analytics |

## AI Architecture

All AI calls go through `aiExtract<T>()` which enforces:

1. **Structured output**: JSON mode with Zod schema validation
2. **Provider fallback**: Groq → OpenRouter on failure
3. **Retry with backoff**: Up to 3 attempts per provider
4. **Usage tracking**: Tokens, latency, cost stored in `ai_usage`

### AI Operations

| Operation | Input | Output | Model Usage |
|-----------|-------|--------|-------------|
| `extractIntelligence` | Scraped evidence | Structured company data | Standard |
| `detectSignals` | Evidence | Business signals array | Standard |
| `scoreAttributes` | Intelligence + signals | 0-1 attributes for scoring | Standard |
| `generateWhyNow` | Intelligence + signals | 1-2 sentence explanation | Standard |
| `researchPeople` | Evidence + intelligence | People array | Standard |
| `generateOutreach` | Intelligence + person + evidence | Outreach message | Standard |
| `detectChanges` | Two snapshots | Changes array | Standard |

### Scoring Architecture

```
Evidence → AI extracts attributes (0-1 scale) → Deterministic scoring engine → Score 0-100
```

The LLM never produces the final score. It extracts structured attributes,
then a deterministic engine applies configurable weights:

- Strategic Fit: 30%
- Recent Trigger: 25%
- Growth Signal: 20%
- Reachability: 15%
- Evidence Confidence: 10%

## Research Pipeline

```
URL → Validate → Discover pages → Scrape → Store evidence
                                           → AI intelligence
                                           → AI signals
                                           → Deterministic scoring
                                           → Create snapshot
                                           → Detect changes (if previous snapshot)
```

Research runs asynchronously (fire-and-forget in-process for MVP).
Progress is tracked in the `research_jobs` table and polled by the frontend.

## Security

- JWT authentication on all API routes except auth and health
- SSRF protection: blocks private IPs, localhost, metadata endpoints
- External content treated as untrusted data (never instructions)
- Secrets never exposed to frontend
- API keys stored in environment variables only

## Error Handling

- Zod validation errors → 400 with structured details
- AppError → appropriate HTTP status with message
- Unknown errors → 500 without stack trace exposure
- Research degrades gracefully: one failed source doesn't fail the company
- AI provider fallback: Groq failure → OpenRouter attempt
