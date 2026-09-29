# Architecture & Design Decisions

This document records the key architectural, technical, and product decisions made during the design and implementation of **SignalDesk**.

---

### 1. Drizzle ORM over Prisma

* **Decision**: Use Drizzle ORM with PostgreSQL (`postgres` client).
* **Rationale**:
  - Drizzle provides TypeScript-first schema definition with zero runtime overhead and direct SQL transparency.
  - Generates readable, standard SQL migrations without proprietary schema engine binaries.
  - Full relational queries with complete type safety.
* **Trade-offs**: Slightly more manual migration steps compared to Prisma, but significantly smaller bundle and transparent queries.

---

### 2. Fastify over Express

* **Decision**: Use Fastify as the backend HTTP server.
* **Rationale**:
  - First-class TypeScript support and modern async/await plugin architecture.
  - Native JSON serialization performance and built-in schema validation support.
  - Clean lifecycle hooks (`onRequest`, `setErrorHandler`).
* **Trade-offs**: Slightly different plugin ecosystem than Express, but vastly superior type safety and modern standards.

---

### 3. Deterministic Opportunity Scoring over End-to-End LLM Scoring

* **Decision**: Two-stage scoring pipeline:
  1. LLM extracts 5 normalized dimensions on a 0–1 decimal scale (`strategicFit`, `recentTrigger`, `growthSignal`, `reachability`, `evidenceConfidence`) alongside specific evidence reasoning.
  2. A deterministic engine computes the final 0–100 score based on weighted factors:
     - Strategic Fit: 30%
     - Recent Trigger: 25%
     - Growth Signal: 20%
     - Reachability: 15%
     - Evidence Confidence: 10%
* **Rationale**:
  - Eliminates LLM hallucination and numerical drift in scores.
  - Enables auditability and transparent score breakdowns in the UI.
  - Allows easy weight adjustments per organization without re-prompting LLMs.
* **Trade-offs**: Requires a strict Zod schema for attribute extraction, but guarantees score reproducibility.

---

### 4. Primary (Groq) + Fallback (OpenRouter) AI Architecture

* **Decision**: Multi-provider AI service abstraction (`aiExtract`, `aiComplete`) with Groq as primary and OpenRouter as fallback.
* **Rationale**:
  - Groq delivers low-latency inference (Llama 3.3 70B), critical for interactive company research.
  - OpenRouter provides resilience against provider outages or rate limits.
  - All responses are strictly validated through Zod schemas before being accepted.
* **Trade-offs**: Managing credentials and slight format variations across providers, mitigated by unified internal adapter.

---

### 5. PostgreSQL for Evidence and Snapshots (No Vector DB / No S3 for MVP)

* **Decision**: Store scraped page contents, evidence snippets, historical snapshots, and audit trails directly in PostgreSQL `jsonb` and `text` columns.
* **Rationale**:
  - Avoids infrastructure sprawl (no pinecone/weaviate, no S3 buckets to provision for MVP).
  - ACID guarantees ensure company research, signals, and snapshot diffs remain consistent.
  - Postgres `jsonb` queries and indexes easily handle thousands of scraped pages and diff snapshots.
* **Upgrade path**: Vector extension (`pgvector`) or external S3 archiving when page volume exceeds gigabytes.

---

### 6. Lightweight Cheerio + Fetch Scraper over Headless Browsers

* **Decision**: Scrape company pages using `fetch` with `cheerio` HTML parsing, filtering boilerplate (nav, footer, script, styles).
* **Rationale**:
  - Extremely fast execution (under 2 seconds per page vs 10–20 seconds with Puppeteer/Playwright).
  - 10x lower memory and CPU footprint.
  - Sufficient for 90%+ of company informational sites (home, about, team, careers, news).
* **Upgrade path**: Optional fallback to headless browser (Playwright) only for client-side rendered Single Page Applications that fail basic scraping.

---

### 7. SSRF and External Input Sanitization

* **Decision**: Strict URL normalization and domain validation blocking private IP ranges (`10.x`, `172.16-31.x`, `192.168.x`, `127.x`), loopback addresses, and cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`).
* **Rationale**:
  - Company ingestion accepts arbitrary user-supplied URLs. Without SSRF defenses, internal infrastructure or cloud instance metadata could be queried.
  - Untrusted web content is stored as evidence data and never directly fed into prompt instruction spaces without sanitization.

---

### 8. Self-Contained JWT Authentication

* **Decision**: Lightweight JWT-based authentication using `bcryptjs` for password hashing and `jsonwebtoken` for stateless bearer tokens.
* **Rationale**:
  - No external auth service dependency (Auth0, Clerk, Firebase) required for self-hosting or evaluation.
  - Fastify `onRequest` hook validates tokens transparently across protected endpoints.
* **Trade-offs**: Token revocation requires blacklist or expiry cycle, appropriate for MVP scope.
