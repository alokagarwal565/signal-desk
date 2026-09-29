# SignalDesk — AI Evaluation Dataset

**Purpose:** Representative company set for ranking agreement testing (BRD §25.3)  
**Target:** 10–20 companies across industries, sizes, and information availability  
**Validation method:** Compare SignalDesk top-5 ranking vs independent human ranking

---

## Dataset v0 — Initial Set

| # | Company | URL | Industry | Size Indicator | Expected Signal Type | Information Availability |
|---|---|---|---|---|---|---|
| 1 | Stripe | https://stripe.com | Fintech/Payments | Large (1000+) | PRODUCT_LAUNCH, EXPANSION | High — extensive public coverage |
| 2 | Linear | https://linear.app | Dev Tools/SaaS | Medium (100–500) | CUSTOMER_GROWTH, HIRING | Medium — blog + job posts |
| 3 | Retool | https://retool.com | No-code/Dev Tools | Medium (200–800) | FUNDING, EXPANSION | High — press coverage |
| 4 | Vercel | https://vercel.com | Infrastructure | Medium (500+) | PRODUCT_LAUNCH, PARTNERSHIP | High |
| 5 | Cal.com | https://cal.com | Scheduling/Open Source | Small (<50) | STRATEGIC_CHANGE | Medium — OSS, public roadmap |
| 6 | Supabase | https://supabase.com | Database/BaaS | Small-Medium | FUNDING, HIRING | High — public funding rounds |
| 7 | Loom | https://loom.com | Video/Collaboration | Medium | ACQUISITION | Medium — acquired by Atlassian |
| 8 | Figma | https://figma.com | Design Tools | Large | ACQUISITION | High — Adobe deal widely covered |
| 9 | Notion | https://notion.so | Productivity/SaaS | Large | EXPANSION, PARTNERSHIP | High |
| 10 | Raycast | https://raycast.com | Developer Productivity | Small (<100) | PRODUCT_LAUNCH, HIRING | Low — limited press |
| 11 | Posthog | https://posthog.com | Analytics/Open Source | Small-Medium | CUSTOMER_GROWTH | Medium — transparent blog |
| 12 | Descript | https://descript.com | Video Editing/AI | Small-Medium | PRODUCT_LAUNCH | Medium |
| 13 | Height | https://height.app | Project Management | Small | STRATEGIC_CHANGE | Low — minimal public presence |
| 14 | Incident.io | https://incident.io | Incident Management | Small | FUNDING, HIRING | Medium |
| 15 | Resend | https://resend.com | Email API | Small (<50) | PRODUCT_LAUNCH | Low — early stage |

---

## Evaluation Dimensions (BRD §25.4)

### Company Intelligence
- [ ] Summary is accurate and based on evidence
- [ ] Products/services correctly identified
- [ ] Business model classification correct
- [ ] Key evidence is grounded in retrieved sources

### Signals
- [ ] At least one signal detected per researched company
- [ ] Signal type correctly classified
- [ ] Significance rating appropriate
- [ ] No obviously noisy/irrelevant signals

### Opportunity Scoring
- [ ] Top-5 matches reasonable human expectation
- [ ] Explanation is understandable and evidence-backed
- [ ] Score breakdown reflects actual company signals
- [ ] Consistency across repeated runs

### Person Identification
- [ ] Role identified is relevant to BD/partnerships outreach
- [ ] Confidence appropriately calibrated
- [ ] Evidence referenced for known persons

### Outreach
- [ ] References actual company context
- [ ] No invented claims
- [ ] Edit distance from acceptable draft is reasonable

---

## Conflict Cases (BRD §18.5)

These companies have known information conflicts to test reliability layer:

| Company | Expected Conflict |
|---|---|
| Figma | Company size (pre vs post-acquisition) |
| Loom | Ownership (independent vs Atlassian subsidiary) |
| Linear | Funding round discrepancies across databases |

---

## Known Limitations at This Stage

- Dataset is not manually ranked by a human BD professional yet (required for §28.9 validation)
- Conflicting source cases are identified but not formally scored
- Evaluation results table is empty pending first run

---

## Evaluation Results Log

| Run | Date | Companies Processed | Top-5 Agreement | Notes |
|---|---|---|---|---|
| — | — | — | — | Not yet run |
