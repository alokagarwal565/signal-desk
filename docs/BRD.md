# BRD — Company Intelligence & Action Dashboard

**Product Working Name:** SignalDesk  
**Document Type:** Business Requirements Document  
**Version:** 1.0  
**Status:** Candidate Test Proposal / MVP Definition  
**Prepared By:** Product Engineer Candidate  
**Date:** 2026-09-30  

---

# 1. Executive Summary

## 1.1 Product Overview

SignalDesk is an AI-native company intelligence and opportunity prioritisation product that helps a business development user answer one question every morning:

> **“Which companies should I act on today, and what should I know before I do?”**

The product starts with a set of companies, researches publicly available information, identifies useful business context and relevant people, detects changes over time, scores opportunities, and produces a small daily action list.

The core product is intentionally not a generic company database and not a generic AI chatbot.

It is a **decision-support system for business outreach**.

The product combines:

```text
Company Input
    ↓
Public Research
    ↓
Company Intelligence
    ↓
Signal / Trigger Detection
    ↓
Opportunity Scoring
    ↓
Relevant Person Identification
    ↓
Personalised Outreach Context
    ↓
Daily Prioritised Actions
```

## 1.2 Candidate-Test Alignment

The proposed product directly covers the candidate task areas:

| Candidate Task | Product Capability |
|---|---|
| Company Intelligence | Company intelligence profile |
| Opportunity Scoring | Opportunity scoring and prioritisation |
| Find the Right Person | Contact/persona recommendation |
| Personalised Outreach | Context-aware first-touch draft |
| Automation | Input → Research → AI Analysis → Structured Output → Database |
| Trigger Detection | Change detection across snapshots |
| Data Reliability | Source ranking, conflict resolution, uncertainty |
| Open-Ended Product Challenge | Daily “act today” dashboard |
| Requirement Change | Reduce many opportunities to the 5 highest-value actions |

The product is therefore designed as one connected workflow rather than nine disconnected features.

## 1.3 Business Problem

Business development teams often have more potential accounts than they can meaningfully research or approach.

The problem is not simply “lack of company information”.

The deeper problem is:

> **Relevant public information exists across multiple sources, but the user must manually discover it, interpret it, determine whether it matters, decide who to contact, and then translate the context into an appropriate outreach action.**

This creates:

- Research time before each approach.
- Inconsistent prioritisation.
- Missed business signals.
- Generic outreach.
- Repeated manual work.
- Difficulty maintaining current intelligence.
- Low confidence when sources disagree.

## 1.4 Product Outcome

The product should reduce the user's research-to-action cycle from:

> **many companies → manual research → scattered notes → subjective priority → generic outreach**

to:

> **many companies → evidence-backed ranking → top 5 actions → clear reason → relevant person → contextual outreach**

## 1.5 Product Promise

> Give us a list of companies and public context, and we will continuously turn that information into a small, evidence-backed list of the companies worth acting on today, along with why, who to approach, and what to say.

## 1.6 North Star Outcome

**Percentage of daily recommended actions that result in a meaningful user action.**

A meaningful action may include:

- Opening the company.
- Reviewing the recommended person.
- Editing or approving outreach.
- Sending outreach.
- Saving the company.
- Scheduling follow-up.
- Marking the recommendation as useful or not useful.

The primary goal is not to maximise generated content. It is to improve **decision quality and actionability**.

---

# 2. Problem Definition

## 2.1 Actual Problem

A user responsible for business development needs to decide:

1. Which companies deserve attention?
2. Why do they deserve attention now?
3. What important context should I know?
4. Who inside the company is relevant?
5. What has changed?
6. Is the change meaningful enough to act on?
7. What should I say in the first approach?

Today these answers are often assembled manually.

## 2.2 When the Problem Occurs

The problem appears when a user:

- Receives or maintains a list of prospects.
- Starts a daily outbound session.
- Reviews accounts before outreach.
- Reassesses existing opportunities.
- Notices company changes.
- Needs to prepare for a business conversation.
- Wants to avoid sending generic outreach.

## 2.3 Frequency

For an active BD user, this may occur:

- Daily for opportunity prioritisation.
- Before each meaningful outreach.
- Whenever a company changes materially.
- During weekly pipeline review.

The exact frequency must be validated with target users.

## 2.4 Pain

The likely pain is a combination of:

- Time spent researching.
- Cognitive load from comparing companies.
- Difficulty knowing what information matters.
- Low confidence in outdated information.
- Missed triggers.
- Repetitive writing.
- Generic outreach caused by insufficient context.

The exact severity is an assumption until validated.

## 2.5 Cost of Doing Nothing

If the user does nothing:

- Research remains manual.
- High-value opportunities can receive the same attention as weak opportunities.
- Time can be spent on companies with no meaningful trigger.
- Outreach quality may vary by account.
- Changes can remain undiscovered.
- Decision-making stays dependent on individual memory and judgement.

## 2.6 Current Workflow

A likely current workflow is:

```text
Open company list
  ↓
Search company on Google
  ↓
Open company website
  ↓
Read About / Products / News
  ↓
Search LinkedIn / public profiles
  ↓
Collect notes
  ↓
Decide whether company matters
  ↓
Search for relevant person
  ↓
Write outreach
  ↓
Repeat
```

The main product opportunity is to compress this workflow without removing the user's control.

## 2.7 Why Existing Alternatives May Be Insufficient

Potential alternatives include:

- Search engines
- Company websites
- LinkedIn
- CRM systems
- Spreadsheets
- Sales intelligence tools
- Generic AI assistants
- Custom internal research workflows

Each can provide part of the workflow, but the product hypothesis is that users benefit from **one decision-oriented layer connecting research, prioritisation, change detection and action**.

This statement is a product hypothesis, not a verified market claim.

---

# 3. Target Users

## 3.1 Primary User

**Business Development / Sales / Partnerships professional**

### Goal

Identify the highest-value companies to approach and prepare for outreach quickly.

### Pain Point

Too many accounts and too much public information to manually process every day.

### Current Workflow

Researches companies manually, maintains notes in CRM/spreadsheets, and decides priority based on judgement.

### Motivation

Spend time on opportunities that are more relevant and timely.

### Friction

- Distrust of generic AI output.
- Fear of acting on stale or incorrect information.
- Poor fit from irrelevant recommendations.
- Preference for control over final outreach decisions.

### Expected Outcome

A focused daily shortlist with clear evidence and next steps.

## 3.2 Secondary User

**Founder / BD Lead / Sales Manager**

Uses the product to:

- Review team priorities.
- Understand why accounts are being prioritised.
- Standardise research quality.
- Improve consistency across team members.

## 3.3 Potential Buyer

**Founder-led startup, BD leader, sales leader, partnerships leader, or revenue team.**

This is a hypothesis and requires validation.

## 3.4 Decision Maker

Likely the person accountable for:

- Outbound pipeline quality.
- BD productivity.
- Sales operations.
- Account prioritisation.

---

# 4. Jobs To Be Done

## 4.1 Core Job

> When I start my business-development workday, I want to know which companies deserve my attention and why, so I can spend my limited time on the highest-value actions.

## 4.2 Supporting Jobs

> When I evaluate a company, I want a concise intelligence brief, so I can understand the company before approaching them.

> When I decide to pursue a company, I want to know who is relevant and why, so I do not waste time approaching the wrong person.

> When a company changes, I want to know what changed and whether it matters, so I can act on timely signals.

> When I send outreach, I want relevant context reflected in the message, so the outreach feels specific rather than mass-generated.

## 4.3 Most Important Job

**Prioritise attention.**

The product should optimise first for:

> **“Tell me the five companies worth acting on today, and explain why.”**

Everything else supports that job.

---

# 5. Assumptions

## 5.1 Product Assumptions

| ID | Assumption | Confidence | Validation |
|---|---|---|---|
| A-01 | Users have more candidate companies than they can deeply research every day. | Medium | Interviews |
| A-02 | Public company information is sufficient to produce useful first-pass intelligence. | Medium | Prototype evaluation |
| A-03 | Users care more about prioritised actions than exhaustive research. | Medium | Usage testing |
| A-04 | Users will trust recommendations more when evidence and source context are visible. | High | UX testing |
| A-05 | A small number of timely signals can be more valuable than a large undifferentiated list. | Medium | Outcome testing |
| A-06 | Users want AI-generated outreach to be editable before sending. | High | Workflow testing |
| A-07 | Source conflicts are common enough that explicit reliability handling is necessary. | Medium | Research dataset |

## 5.2 Technical Assumptions

| ID | Assumption |
|---|---|
| T-01 | Public information can be retrieved through permitted sources/APIs/search infrastructure. |
| T-02 | AI can summarise and classify company information sufficiently well for decision support when grounded in retrieved evidence. |
| T-03 | Structured model output can represent scores, evidence, signals and recommendations. |
| T-04 | A relational database is sufficient for MVP persistence. |
| T-05 | Full autonomous agents are not required for MVP. |

## 5.3 Known Constraints

- Candidate test prioritises thinking and usefulness over infrastructure scale.
- The product must be demonstrable end to end.
- Public information is the primary research source.
- The system must communicate uncertainty instead of presenting uncertain information as fact.
- MVP scope must remain small enough for one strong Product Engineer.

---

# 6. Problem Validation

## 6.1 Validation Questions

Before significant production work, validate:

1. Do users have a real daily prioritisation problem?
2. How many companies do they typically consider?
3. How much time do they spend researching one company?
4. What signals influence their prioritisation?
5. How often do they revisit existing accounts?
6. What makes an outreach message feel genuinely personalised?
7. How much AI-generated context do they trust?
8. What level of evidence is required before acting?
9. Are the top 5 recommendations actually better than a larger list?

## 6.2 Two-Week Validation Prototype

The initial test should not attempt to build the entire platform.

Build only:

```text
Upload / Enter 10–20 Companies
        ↓
Research each company
        ↓
Extract structured signals
        ↓
Score opportunities
        ↓
Return top 5
        ↓
Show evidence + reason
```

Then manually observe whether users agree with the ranking.

## 6.3 Validation Evidence

| Evidence | Source | Finding | Status |
|---|---|---|---|
| `[Interview]` | `[User]` | `[Finding]` | Pending |
| `[Prototype test]` | `[User]` | `[Finding]` | Pending |
| `[Usage data]` | `[System]` | `[Finding]` | Pending |

## 6.4 Validation Gate

Proceed toward broader MVP development only if users consistently report that:

- The shortlist saves research time.
- The reasons are understandable.
- The evidence is credible.
- The recommendations are more useful than a raw company list.

---

# 7. Product Definition

## 7.1 Product Name

**SignalDesk**

Working name only. Final naming requires validation.

## 7.2 One-Line Description

> **SignalDesk turns company research into a prioritised daily action list for business development.**

## 7.3 Core Value Proposition

Instead of giving users more company data, SignalDesk converts information into:

- Priority.
- Reason.
- Evidence.
- Trigger.
- Relevant person.
- Suggested action.

## 7.4 Core Product Loop

```text
Discover
  ↓
Research
  ↓
Understand
  ↓
Score
  ↓
Detect Change
  ↓
Prioritise
  ↓
Act
  ↓
Learn From Feedback
```

## 7.5 Product Promise

> Give us your target companies and public context, and SignalDesk will identify the few companies worth acting on today, explain the reason with evidence, and prepare the next step.

## 7.6 North Star Outcome

**Actionable recommendation rate**

Definition:

> Number of daily recommendations that lead to a meaningful user action ÷ total daily recommendations shown.

## 7.7 Success Metrics

| Metric | Definition | Why It Matters |
|---|---|---|
| Recommendation action rate | % of recommendations with a meaningful action | Measures usefulness |
| Top-5 acceptance rate | % of top-5 recommendations users agree are worth attention | Measures ranking quality |
| Time to first useful brief | Time from company input to usable research | Measures speed |
| Research time saved | User-reported or measured reduction in manual research time | Measures productivity |
| Outreach edit rate | % of generated drafts requiring substantial edits | Measures contextual quality |
| Signal usefulness rate | % of detected changes marked useful | Measures trigger quality |
| Recommendation feedback quality | Positive/negative reasoned feedback | Enables iteration |

Avoid optimising for:

- Number of AI responses.
- Number of companies processed.
- Number of generated outreach messages.

---

# 8. Product Principles

## 8.1 Decision Over Data

The product exists to support a decision, not to display everything available.

## 8.2 Evidence Before Confidence

Recommendations should show why they exist.

## 8.3 Five Useful Actions Beat One Hundred Opportunities

The requirement change in the test is treated as a core product principle:

> **Reduce information overload instead of creating a bigger inbox.**

## 8.4 AI With Guardrails

AI interprets information; deterministic code handles known rules.

## 8.5 User Remains in Control

The system recommends. The user decides whether and how to act.

## 8.6 Freshness Matters

A stale fact can be worse than missing information when it influences an outreach decision.

## 8.7 Uncertainty Is a Product Feature

Conflicting or weak evidence should be exposed rather than silently resolved into false certainty.

## 8.8 Fast First Value

The user should see useful prioritisation as early as possible.

---

# 9. MVP Scope

## 9.1 MVP Objective

Build a usable system that can:

1. Accept 10–20 companies.
2. Research each company using public information.
3. Create a structured company brief.
4. Extract relevant signals.
5. Score and rank opportunities.
6. Show the top 5 companies worth acting on.
7. Explain why each is recommended.
8. Identify relevant roles/personas for one selected company.
9. Generate a contextual outreach draft.
10. Compare company information from two points in time.
11. Surface meaningful changes.
12. Store structured results in PostgreSQL.

## 9.2 P0 — Absolutely Required

### P0-01 Company Input

**Problem solved:** User needs a starting account set.

**Input:**

- Company name.
- Company website.

Optional:

- User-provided notes.
- Existing CRM context.
- Target business objective.

**Acceptance criteria:**

- User can submit one or many companies.
- Duplicate companies are handled.
- Invalid URLs are rejected with an actionable message.
- Company records enter a processing state.

---

### P0-02 Company Research

**Problem solved:** User needs to understand a company before approaching it.

**Output should include:**

- Company overview.
- Products/services.
- Business model indicators.
- Target market/customer indicators.
- Recent developments.
- Relevant public signals.
- Source references.
- Last verified timestamp.

**Acceptance criteria:**

- Research is structured.
- Every important factual claim is traceable to a source or explicitly labelled as inference.
- Failed sources do not break the entire job.

---

### P0-03 Opportunity Scoring

**Problem solved:** User has too many companies and needs prioritisation.

**Output:**

- Opportunity score.
- Score explanation.
- Key positive signals.
- Negative signals / reasons to deprioritise.
- Confidence.
- Recommended action.

**Acceptance criteria:**

- All processed companies receive a comparable score.
- Score components are explainable.
- Score is not solely generated as an opaque LLM number.
- Top recommendations can be traced to evidence.

---

### P0-04 Daily Top-5 Dashboard

**Problem solved:** User wants to know what deserves attention today.

**Dashboard should show:**

1. Company.
2. Priority.
3. Why now.
4. Key signal.
5. Relevant person/persona if available.
6. Suggested next action.
7. Evidence / sources.
8. Confidence.

**Acceptance criteria:**

- Exactly five recommendations when at least five qualified opportunities exist.
- Fewer than five shown when fewer qualified opportunities exist.
- User can expand into company detail.
- User can mark a recommendation as useful or not useful.

---

### P0-05 Relevant Person / Persona Identification

**Problem solved:** User needs to know who should receive the outreach.

For one selected company, identify:

- Relevant role/persona.
- Why the role is relevant.
- Publicly available person information when confidently identified.
- Evidence supporting relevance.
- Uncertainty when the actual person cannot be reliably identified.

**MVP constraint:**

Do not promise exhaustive contact discovery.

The system should prefer:

> **Correct persona with evidence**

over:

> **Unverified list of names.**

---

### P0-06 Personalised Outreach Draft

**Problem solved:** User wants a contextual opening without generic spam.

Input:

```text
Company
+
Person/persona
+
Relevant trigger
+
Business context
```

Output:

- Subject/opening if applicable.
- First-touch draft.
- Personalisation rationale.
- Evidence used.
- Claims that require user verification.

**Acceptance criteria:**

- Draft references real company context.
- No unsupported claims are introduced.
- User can edit before use.
- System clearly differentiates sourced facts from generated language.

---

### P0-07 Trigger Detection

**Problem solved:** User needs to know what changed and whether it matters.

Input:

```text
Company Snapshot T1
+
Company Snapshot T2
```

Output:

| Change | Evidence | Significance | Actionability |
|---|---|---|---|
| `[Change]` | `[Source]` | `[Low/Med/High]` | `[Act / Ignore / Review]` |

**Acceptance criteria:**

- Identical information is ignored.
- Material changes are surfaced.
- Changes are explained.
- Meaningful vs noisy changes are separated.
- Previous and current values are traceable.

---

### P0-08 Data Reliability

**Problem solved:** Sources may disagree.

The system must:

1. Detect conflicting claims.
2. Record competing values.
3. Assign source confidence.
4. Select an operational value where possible.
5. Explain why it was selected.
6. Surface uncertainty to the user.

---

### P0-09 Structured Persistence

Store:

- Companies.
- Sources.
- Company snapshots.
- Research results.
- Signals.
- Scores.
- People/personas.
- Outreach drafts.
- User feedback.

---

### P0-10 Processing Status

Users must be able to understand whether a company is:

- Queued.
- Researching.
- Analysing.
- Ready.
- Partially complete.
- Failed.

---

## 9.3 P1 — Important

- CRM integration.
- Scheduled company refresh.
- Automatic daily refresh.
- Email/slack notifications.
- Saved search / segment filters.
- User-defined scoring weights.
- More advanced contact discovery.
- Outreach history tracking.
- Team collaboration.

## 9.4 P2 — Later

- Multiple sales methodologies.
- Autonomous outbound agent.
- Automatic email sending.
- Large-scale account monitoring.
- Predictive deal scoring.
- Custom knowledge graphs.
- Multi-agent research orchestration.
- Advanced CRM synchronisation.
- Organisation-wide analytics.

## 9.5 Explicitly Excluded From MVP

### Automatic outreach sending

Reason:

- High trust requirement.
- Risk of inappropriate messaging.
- Requires mature validation.
- Sending is consequential and should remain user-controlled.

### Full autonomous AI agent

Reason:

- Not necessary to prove the workflow.
- More difficult to debug.
- Adds reliability and cost complexity.

### Exhaustive contact database

Reason:

- It is not the core problem.
- Public person information can be incomplete.
- Better to recommend a relevant persona than optimise for quantity.

### Huge analytics suite

Reason:

- Core product is daily action prioritisation.
- Analytics can be added after user behaviour is understood.

### Microservice architecture

Reason:

- No MVP need for independent service scaling or team ownership boundaries.

---

# 10. User Journey

## 10.1 First-Time User

```text
Sign In
  ↓
Add Companies
  ↓
Start Research
  ↓
Processing
  ↓
Company Intelligence Ready
  ↓
Opportunity Scores Generated
  ↓
Daily Top 5
  ↓
Select Company
  ↓
Review Intelligence
  ↓
Review Suggested Person
  ↓
Review Outreach
  ↓
Take Action
  ↓
Give Feedback
```

## 10.2 Daily Returning User

```text
Open Dashboard
  ↓
View Top 5
  ↓
See “Why Today?”
  ↓
Review Trigger
  ↓
Inspect Company
  ↓
Choose Person
  ↓
Edit Outreach
  ↓
Take Action
```

## 10.3 What the User Sees

### Dashboard

The user sees:

- Today's date.
- “5 things worth acting on today.”
- Ranked recommendations.
- Why-now signal.
- Suggested next action.
- Confidence.
- Quick access to evidence.

### Company Detail

The user sees:

- Company summary.
- What the company does.
- Current signals.
- Recent changes.
- Opportunity score.
- Relevant people/personas.
- Recommended action.
- Sources.

### Outreach

The user sees:

- Context.
- Draft.
- Evidence.
- Personalisation rationale.
- Edit controls.

## 10.4 System Behaviour

Behind the scenes:

```text
Input
  ↓
Deduplicate
  ↓
Research
  ↓
Normalise
  ↓
Store sources
  ↓
Extract structured facts
  ↓
Generate signals
  ↓
Calculate score
  ↓
Rank
  ↓
Produce top 5
```

## 10.5 Failure States

### Empty

> “No companies yet. Add 10–20 companies to generate your first action list.”

### Loading

Show stage:

> Researching → Analysing → Scoring → Preparing recommendations

### Partial Result

If some sources fail:

> “Research completed with limited source coverage.”

Display what is known and what could not be verified.

### Error

> “We could not complete research for this company. Retry research.”

Do not silently show incomplete information as complete.

---

# 11. UX / UI Structure

## 11.1 Information Architecture

```text
SignalDesk
├── Today
│   ├── Top 5 Actions
│   └── Daily Signals
├── Companies
│   ├── All Companies
│   ├── Needs Review
│   └── Recently Changed
├── Company Detail
│   ├── Intelligence
│   ├── Signals
│   ├── People
│   ├── Outreach
│   └── Sources
├── Research Jobs
└── Settings
```

## 11.2 Dashboard

Primary hierarchy:

### Level 1

**What should I do today?**

### Level 2

**Why?**

### Level 3

**What evidence supports this?**

### Level 4

**How do I act?**

Example card:

```text
#1 Acme Technologies

WHY NOW
Recently launched enterprise product

OPPORTUNITY
86 / 100

WHY IT MATTERS
Strong fit + recent product expansion

WHO
VP Partnerships

NEXT ACTION
Review company brief and send tailored intro

CONFIDENCE
High

[View Evidence] [Open Company]
```

## 11.3 Avoid Generic Chatbot UX

The product should not primarily be:

> “Ask me anything about this company.”

Instead, the interface should provide:

- Structured evidence.
- Ranked actions.
- Explainable signals.
- Clear next steps.

Conversational AI can exist as a secondary interaction later.

## 11.4 Filters

MVP filters:

- Priority.
- Signal type.
- Company.
- Status.

Avoid complex reporting filters until needed.

---

# 12. AI Strategy

## 12.1 AI Components

| Component | Input | Task | Output | Validation |
|---|---|---|---|---|
| Company extraction | Retrieved source content | Extract company facts | Structured JSON | Schema + source grounding |
| Signal extraction | Current facts | Identify meaningful signals | Structured signals | Evidence requirement |
| Opportunity reasoning | Signals + fit context | Explain why company matters | Score rationale | Deterministic score + LLM explanation |
| Persona reasoning | Company context | Identify relevant role | Persona + reasoning | Evidence + confidence |
| Outreach generation | Company + persona + trigger | Draft first approach | Editable draft | Claim grounding |
| Change analysis | Snapshot T1/T2 | Compare and classify changes | Change set | Field-level diff + AI significance classification |

## 12.2 Deterministic Logic

Use standard code for:

- URL validation.
- Deduplication.
- Source timestamps.
- Snapshot comparison.
- Field-level diffs.
- Score arithmetic.
- Data validation.
- Ranking.
- Filtering.
- Permissions.
- Retry logic.
- Idempotency.
- Processing state.

## 12.3 AI Tasks

Use LLMs for:

- Extracting meaning from unstructured text.
- Summarising company information.
- Classifying signal significance.
- Explaining opportunity rationale.
- Reasoning about relevant personas.
- Drafting context-aware outreach.

## 12.4 Automation

Automatically:

- Research newly added companies.
- Refresh stale company information.
- Recalculate scores after new evidence.
- Detect changes across snapshots.
- Update the daily action list.

## 12.5 Human Decisions

Keep these under user control:

- Whether a company is worth pursuing.
- Whether a source is sufficient.
- Whether a person is appropriate.
- Whether outreach is acceptable.
- Whether to send.
- Whether to override the recommended score or action.

---

# 13. System Architecture

## 13.1 Recommended Stack

### Frontend

**Next.js / React**

Reason:

- Fast product development.
- Good support for dashboard interfaces.
- Straightforward API integration.
- Suitable for a single full-stack engineer.

### Backend

**Python + FastAPI**

Reason:

- Strong ecosystem for AI/data workflows.
- Clean API development.
- Easy integration with LLM and data processing libraries.
- Good fit for background research workflows.

### Database

**PostgreSQL**

Reason:

- Structured relational data fits the domain.
- Supports JSONB for flexible AI output.
- Simple enough for MVP.
- Easy to index company/signal/snapshot data.

### AI

Use a hosted LLM API with structured output support.

Model selection should depend on:

- Extraction accuracy.
- Reasoning quality.
- Latency.
- Cost.
- Structured output reliability.

The MVP should avoid committing to a single provider until a small benchmark is run.

### Search / Research

Use permitted search and public-data retrieval mechanisms.

The research layer should be abstracted behind an internal interface:

```text
ResearchProvider
├── search(...)
├── fetch(...)
└── metadata(...)
```

This prevents the product from tightly coupling business logic to one provider.

### Storage

Object storage only if source documents or snapshots need durable raw storage.

Otherwise, store relevant extracted content and source metadata in PostgreSQL.

### Authentication

Start with simple email authentication or an OAuth provider.

Use organisation/user IDs from the beginning even if MVP has one user type.

### Background Jobs

Use a lightweight job queue for company research.

The MVP does not require a distributed workflow engine.

### Deployment

A simple production topology:

```text
Next.js
  ↓
FastAPI
  ↓
PostgreSQL

FastAPI
  ↓
Worker
  ├── Research
  ├── AI Processing
  └── Scoring

External
  ├── Search / Public Sources
  └── LLM Provider
```

## 13.2 Architecture Principle

One application + one worker + one PostgreSQL database is sufficient for MVP.

Do not start with:

- Multiple microservices.
- Kubernetes.
- Multiple orchestration systems.
- Multi-agent infrastructure.

---

# 14. Database Design

## 14.1 users

**Purpose:** User identity.

**Important fields:**

- id
- email
- name
- created_at
- updated_at

**Primary key:** id

## 14.2 companies

**Purpose:** Canonical company records.

**Fields:**

- id
- name
- normalized_name
- website_url
- domain
- status
- created_at
- updated_at
- last_researched_at

**Indexes:**

- domain
- normalized_name
- status

## 14.3 company_sources

**Purpose:** Track public sources.

**Fields:**

- id
- company_id
- source_url
- source_type
- title
- retrieved_at
- published_at
- content_hash
- reliability_score
- raw_reference

**Foreign key:**

- company_id → companies.id

**Indexes:**

- company_id
- source_url
- published_at

## 14.4 company_snapshots

**Purpose:** Store point-in-time company intelligence.

**Fields:**

- id
- company_id
- snapshot_time
- summary
- structured_facts JSONB
- source_ids JSONB
- extraction_version

**Indexes:**

- company_id + snapshot_time

## 14.5 signals

**Purpose:** Store discovered events or notable business signals.

**Fields:**

- id
- company_id
- snapshot_id
- signal_type
- title
- description
- evidence
- significance
- actionability
- confidence
- detected_at
- valid_from
- valid_to

**Indexes:**

- company_id
- significance
- actionability
- detected_at

## 14.6 opportunity_scores

**Purpose:** Store explainable scores.

**Fields:**

- id
- company_id
- score
- fit_score
- timing_score
- signal_score
- evidence_score
- score_explanation
- confidence
- calculated_at
- scoring_version

**Indexes:**

- score DESC
- company_id + calculated_at

## 14.7 people

**Purpose:** Relevant public person records.

**Fields:**

- id
- company_id
- name
- role
- profile_url
- evidence
- confidence
- source_id
- created_at
- updated_at

## 14.8 outreach_drafts

**Purpose:** Store generated outreach.

**Fields:**

- id
- company_id
- person_id nullable
- draft_text
- context_used JSONB
- generation_model
- status
- created_at
- updated_at

## 14.9 research_jobs

**Purpose:** Track asynchronous processing.

**Fields:**

- id
- company_id
- job_type
- status
- attempts
- error_code
- error_message
- started_at
- completed_at

**Indexes:**

- status
- company_id

## 14.10 user_feedback

**Purpose:** Capture recommendation quality.

**Fields:**

- id
- user_id
- company_id
- feedback_type
- reason
- context JSONB
- created_at

## 14.11 Permanent vs Regenerable Data

| Data | Permanent | Regenerable | Audit |
|---|---|---|---|
| User | Yes | No | Yes |
| Company identity | Yes | Partially | Yes |
| Source metadata | Yes | Partially | Yes |
| Company snapshot | Yes | Yes | Yes |
| AI summary | No | Yes | Versioned |
| Signal | Yes for history | Yes | Yes |
| Score | No | Yes | Versioned |
| Outreach draft | Usually yes | Yes | Useful |
| Feedback | Yes | No | Yes |

---

# 15. API Design

## 15.1 POST /api/companies

**Purpose:** Create a company.

**Request:**

```json
{
  "name": "Acme Technologies",
  "website_url": "https://example.com"
}
```

**Response:**

```json
{
  "id": "company_123",
  "status": "queued"
}
```

**Authentication:** Required.

**Validation:**

- Valid URL.
- Normalised domain.
- Duplicate handling.

## 15.2 POST /api/research/batch

**Purpose:** Submit multiple companies for research.

**Request:**

```json
{
  "companies": [
    {
      "name": "Acme Technologies",
      "website_url": "https://example.com"
    }
  ]
}
```

**Response:**

```json
{
  "job_id": "job_123",
  "company_count": 10,
  "status": "queued"
}
```

## 15.3 GET /api/dashboard/today

**Purpose:** Retrieve today's prioritised actions.

**Response:**

```json
{
  "date": "2026-09-30",
  "actions": [
    {
      "company_id": "company_123",
      "rank": 1,
      "score": 86,
      "why_now": "Recent expansion into enterprise customers",
      "recommended_action": "Review partnership opportunity",
      "confidence": "high"
    }
  ]
}
```

## 15.4 GET /api/companies/{id}

**Purpose:** Company detail.

Returns:

- Overview.
- Current snapshot.
- Signals.
- Score.
- People.
- Sources.
- Recommendation.

## 15.5 POST /api/companies/{id}/refresh

**Purpose:** Re-run research.

## 15.6 GET /api/companies/{id}/changes

**Purpose:** Retrieve meaningful changes between snapshots.

## 15.7 GET /api/companies/{id}/people

**Purpose:** Retrieve relevant people/personas.

## 15.8 POST /api/outreach/draft

**Purpose:** Generate a contextual draft.

**Request:**

```json
{
  "company_id": "company_123",
  "person_id": "person_123"
}
```

## 15.9 POST /api/feedback

**Purpose:** Capture recommendation feedback.

**Request:**

```json
{
  "company_id": "company_123",
  "feedback_type": "not_useful",
  "reason": "weak_fit"
}
```

---

# 16. Automation Architecture

## 16.1 Core Automation

```text
New Company
    ↓
Validate URL
    ↓
Create Research Job
    ↓
Collect Public Sources
    ↓
Normalise Source Content
    ↓
Extract Structured Facts
    ↓
Store Snapshot
    ↓
Detect Signals
    ↓
Calculate Opportunity Score
    ↓
Update Dashboard
```

## 16.2 Refresh Automation

Trigger:

- Manual refresh in MVP.
- Scheduled refresh in P1.

Workflow:

```text
Trigger
  ↓
Fetch Latest Sources
  ↓
Compare With Previous Snapshot
  ↓
Detect Field Changes
  ↓
AI Classifies Significance
  ↓
Store Meaningful Signals
  ↓
Recalculate Opportunity Score
  ↓
Update Top 5
```

## 16.3 Why Backend Jobs Instead of n8n for Core MVP

Core product logic should live in the application because:

- It is central to product behaviour.
- It requires tight transactional control.
- It needs deterministic retry and state handling.
- Testing is easier.
- Versioning and local development are simpler.

## 16.4 Where n8n Could Be Useful

n8n becomes useful for peripheral workflows such as:

```text
Scheduled Trigger
  ↓
Call SignalDesk API
  ↓
Generate Daily Summary
  ↓
Send Slack / Email
```

This avoids placing core product logic inside workflow automation.

---

# 17. Data Flow

## 17.1 Company Research

```text
Company URL
  ↓
API
  ↓
Validation
  ↓
Research Job
  ↓
Search / Fetch Public Sources
  ↓
Source Normalisation
  ↓
LLM Extraction
  ↓
Schema Validation
  ↓
Company Snapshot
  ↓
Signal Extraction
  ↓
Score Calculation
  ↓
Dashboard
```

## 17.2 Data Transformation Points

### Input

Raw company identity.

### Research

Unstructured web/public data.

### Normalisation

Clean text, metadata, timestamps, source identifiers.

### AI Extraction

Unstructured information → structured company facts.

### Signal Layer

Facts → potentially meaningful events/signals.

### Scoring Layer

Signals + fit criteria → explainable opportunity score.

### Presentation

Score + evidence + next action → dashboard recommendation.

## 17.3 Retry Model

- Network failure: retry with exponential backoff.
- LLM timeout: retry.
- Schema failure: structured-output retry.
- Source unavailable: continue with remaining sources.
- Permanent failure: mark job failed and expose status.

---

# 18. Reliability & Failure Handling

## 18.1 LLM Hallucination

**Detection:**

- Require source references for factual claims.
- Validate output schema.
- Reject unsupported claims where possible.

**Recovery:**

- Retry using grounded context.
- Remove unsupported fields.
- Mark information uncertain.

**User Experience:**

> “This appears to be an inference based on available sources.”

## 18.2 Incorrect Extraction

Detection through:

- Schema validation.
- Business-rule validation.
- Confidence thresholds.

Recovery:

- Retry extraction.
- Use source excerpt.
- Allow user review.

## 18.3 API Failure

Recovery:

- Retry.
- Provider fallback if available.
- Continue partial workflow.

UX:

> “Some sources could not be reached. Results may be incomplete.”

## 18.4 Rate Limit

Recovery:

- Queue.
- Backoff.
- Respect provider limits.

## 18.5 Conflicting Sources

The system should not simply select one value silently.

Example:

```text
Source A:
Funding amount = X
Published = Jan 2026

Source B:
Funding amount = Y
Published = Aug 2026
```

Decision logic:

1. Prefer newer reliable source.
2. Prefer first-party evidence where appropriate.
3. Preserve competing values.
4. Explain the basis for the selected operational value.
5. Lower confidence if conflict remains unresolved.

## 18.6 Stale Data

Display:

- Last verified time.
- Source date where available.
- Freshness status.

Potential states:

- Fresh.
- Aging.
- Stale.
- Unknown.

## 18.7 Duplicate Events

Use:

- Source URL.
- Content hash.
- Event signature.
- Idempotency key.

## 18.8 Third-Party API Changes

Use an integration adapter rather than spreading provider-specific logic throughout the codebase.

---

# 19. Security & Privacy

## 19.1 Authentication

All user-specific APIs must require authentication.

## 19.2 Authorization

Users can access only companies and data belonging to their organisation.

## 19.3 API Key Management

- Store secrets server-side.
- Never expose provider keys in the frontend.
- Use environment-based secret configuration for MVP.

## 19.4 PII

Potential PII includes:

- Person names.
- Job titles.
- Public profile links.
- Email addresses if later obtained.

Requirements:

- Store only data necessary for the product.
- Do not invent personal information.
- Do not expose uncertain personal data as verified.

## 19.5 Prompt Injection

Public web content is untrusted input.

The system must treat retrieved content as data, not instructions.

Controls:

```text
Retrieved Content
      ↓
Sanitisation / Isolation
      ↓
Explicit System Instructions
      ↓
Structured Extraction
```

Do not allow retrieved web text to directly control tools or business actions.

## 19.6 Data Retention

The MVP should retain:

- User-owned company records.
- Source metadata.
- Historical signals.
- Feedback.

Raw source content can be retained only where required and permitted.

---

# 20. Cost & Performance

## 20.1 Major Cost Drivers

1. Public research/search.
2. LLM calls.
3. Hosting.
4. Database.
5. Storage.

## 20.2 Cost Strategy

Avoid multiple LLM calls for the same information.

Prefer:

```text
Retrieve → Extract once → Store → Reuse
```

rather than:

```text
Retrieve → LLM summary
Retrieve → LLM score
Retrieve → LLM person
Retrieve → LLM outreach
```

where the same context can be reused.

## 20.3 AI Call Strategy

MVP target:

- One extraction call per research batch/source group where possible.
- One signal/reasoning call per company.
- One outreach call only on user request.

## 20.4 Scale: 100 Users

Expected concern:

- Concurrent research jobs.
- LLM throughput.
- Search API usage.

Response:

- Background queue.
- Rate limiting.
- Caching.
- Reuse of snapshots.

## 20.5 Scale: 1,000 Users

Likely pressure points:

- Research provider limits.
- LLM spend.
- Number of scheduled refreshes.
- Database growth.

Potential next steps:

- Queue partitioning.
- Provider abstraction.
- More aggressive caching.
- Batch research.
- Async dashboard refresh.
- Cost-based model routing.

No exact cost estimates should be committed without selecting providers and expected usage.

## 20.6 Latency

The following operations can be asynchronous:

- Company research.
- Multi-company processing.
- Trigger detection.
- Daily refresh.

The following should feel fast:

- Dashboard read.
- Company detail retrieval.
- Feedback.
- Filtering.

---

# 21. Competitive Alternatives

This section intentionally distinguishes known alternatives from assumptions. No current market claims are asserted here without external verification.

## 21.1 Search Engines

Users can research companies manually through search.

**Why they use them:**

- Broad coverage.
- Familiar.
- Low friction.

**Gap:**

- User must interpret the results.
- No consistent prioritisation.
- No daily action ranking.
- No unified evidence model.

## 21.2 Company Websites

**Strength:**

- First-party information.

**Gap:**

- Static browsing workflow.
- No cross-company ranking.
- No change detection across a portfolio.

## 21.3 CRMs

Examples may include common CRM systems, but specific current product capabilities should be verified before being presented as factual.

**Strength:**

- Existing account records.
- Workflow management.

**Gap for this product hypothesis:**

- CRM is primarily the system of record.
- SignalDesk is designed as an intelligence and prioritisation layer.

## 21.4 Spreadsheets

**Strength:**

- Simple.
- Flexible.
- Familiar.

**Gap:**

- Manual research.
- Manual updates.
- No intelligent change detection.
- High maintenance.

## 21.5 Generic AI Assistants

**Strength:**

- Flexible.
- Fast summarisation.

**Gap:**

- Often require manual context assembly.
- No persistent company intelligence model.
- No deterministic scoring layer.
- No dedicated daily action workflow.

## 21.6 Build-It-Yourself

A technical team can combine:

- Search.
- Scrapers.
- LLM APIs.
- PostgreSQL.
- Internal scripts.
- n8n.

**Gap:**

- Requires maintenance.
- Workflow may become fragmented.
- No dedicated UX.

## 21.7 Product Differentiation Hypothesis

The potential differentiation is not “we use AI.”

It is:

> **Turning changing public company information into a small, explainable set of actions worth taking today.**

This remains a hypothesis until validated against real alternatives and user behaviour.

---

# 22. Product Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Users do not have a strong prioritisation problem | Medium | High | Validate before broad build |
| Recommendations are not trusted | High | High | Evidence + explanations + feedback |
| Public data is incomplete | High | High | Confidence + source coverage |
| Research becomes expensive | Medium | High | Caching + async + model routing |
| AI produces unsupported claims | Medium | High | Grounded structured outputs |
| Relevant people cannot be found reliably | High | Medium | Persona-first approach |
| Too many noisy triggers | High | High | Signal significance threshold |
| Ranking is perceived as arbitrary | Medium | High | Deterministic scoring components |
| Product becomes a data-heavy research tool | Medium | Medium | Keep daily action as central UX |
| Requirement scope expands | High | High | Enforce P0/P1/P2 boundaries |
| Integration providers change | Medium | Medium | Adapter pattern |
| Users prefer existing tools | Medium | High | Validate workflow switching value |
| Outreach feels like AI spam | High | High | Context + editable drafts + human control |
| Daily refresh costs grow | Medium | Medium | Freshness policy + selective refresh |

---

# 23. 7-Day Build Plan

Assumption: one strong Product Engineer, one focused MVP, no large infrastructure investment.

## Day 1 — Product Definition + Data Model

### Goal

Lock the core workflow and define the smallest usable data model.

### Tasks

- Define company object.
- Define source object.
- Define snapshot.
- Define signal.
- Define score.
- Define dashboard action.
- Define P0 acceptance criteria.
- Create PostgreSQL schema.
- Create project structure.

### Deliverable

Working app skeleton + database schema.

### Definition of Done

The end-to-end data model exists and can represent:

```text
Company → Sources → Snapshot → Signals → Score → Recommendation
```

---

## Day 2 — Company Input + Research Pipeline

### Goal

Get real public information into the product.

### Tasks

- Company input UI.
- URL validation.
- Batch upload/input.
- Research provider interface.
- Source retrieval.
- Source metadata storage.
- Background job creation.
- Processing states.

### Deliverable

User can submit companies and see research jobs progress.

### Definition of Done

At least one real company can move from URL → source records.

---

## Day 3 — AI Extraction + Company Intelligence

### Goal

Turn raw information into a structured company brief.

### Tasks

- Extraction prompt/schema.
- Source grounding.
- JSON validation.
- Snapshot persistence.
- Company detail screen.
- Error handling.

### Deliverable

A usable company intelligence page.

### Definition of Done

A user can inspect the company and see structured facts tied to source evidence.

---

## Day 4 — Signal Detection + Opportunity Scoring

### Goal

Convert research into prioritisation.

### Tasks

- Signal schema.
- Deterministic score formula.
- AI significance classification.
- Score explanation.
- Ranking logic.
- Top-5 dashboard.

### Deliverable

Ten to twenty companies become an ordered list of recommended actions.

### Definition of Done

The top five are explainable and evidence-backed.

---

## Day 5 — People + Outreach

### Goal

Turn a prioritised company into a potential action.

### Tasks

- Persona identification.
- Public person extraction where reliable.
- Evidence capture.
- Outreach generation.
- Editable draft UI.

### Deliverable

Selected company → relevant person/persona → contextual outreach.

### Definition of Done

User can review and edit a first-touch draft.

---

## Day 6 — Trigger Detection + Reliability

### Goal

Demonstrate what changed and whether it matters.

### Tasks

- Snapshot comparison.
- Field-level diff.
- Meaningful-change classification.
- Conflict detection.
- Source reliability.
- Confidence display.
- Retry/failure handling.

### Deliverable

Company T1 → Company T2 → actionable changes.

### Definition of Done

Noise is filtered and meaningful changes are surfaced with evidence.

---

## Day 7 — Evaluation + Deployment

### Goal

Ship something usable and test it with realistic cases.

### Tasks

- Build representative evaluation set.
- Test 10–20 companies.
- Run ranking review.
- Fix major quality issues.
- Add feedback.
- Instrument key metrics.
- Deploy.
- Prepare demonstration flow.

### Deliverable

Live MVP + evaluation results.

### Definition of Done

A user can complete:

```text
Companies
→ Research
→ Score
→ Top 5
→ Company Brief
→ Person
→ Outreach
→ Change Detection
```

---

# 24. Engineering Backlog

## Frontend

| ID | Task | Priority | Dependencies | Complexity | Acceptance Criteria |
|---|---|---|---|---|---|
| FE-001 | Create app shell | P0 | None | S | Dashboard loads |
| FE-002 | Company input | P0 | FE-001 | S | Submit company |
| FE-003 | Research progress UI | P0 | BE-001 | M | Status visible |
| FE-004 | Daily top-5 dashboard | P0 | BE-003 | M | Ranked actions shown |
| FE-005 | Company intelligence page | P0 | DB-002 | M | Structured brief visible |
| FE-006 | Signal/change UI | P0 | BE-004 | M | Changes visible |
| FE-007 | Person/persona panel | P0 | AI-002 | S | Recommended role visible |
| FE-008 | Outreach editor | P0 | AI-003 | S | Draft editable |
| FE-009 | Feedback controls | P0 | BE-005 | S | Feedback stored |

## Backend

| ID | Task | Priority | Dependencies | Complexity | Acceptance Criteria |
|---|---|---|---|---|---|
| BE-001 | Company APIs | P0 | DB-001 | S | CRUD works |
| BE-002 | Research job API | P0 | BE-001 | M | Jobs created |
| BE-003 | Score/ranking API | P0 | AI-001 | M | Top 5 returned |
| BE-004 | Change detection API | P0 | DB-002 | M | Changes returned |
| BE-005 | Feedback API | P0 | DB-006 | S | Feedback stored |
| BE-006 | Error handling layer | P0 | BE-001 | M | Stable errors |

## Database

| ID | Task | Priority | Complexity | Acceptance Criteria |
|---|---|---|---|---|
| DB-001 | Create core schema | P0 | M | Migration passes |
| DB-002 | Snapshot tables | P0 | M | Historical snapshots stored |
| DB-003 | Signal tables | P0 | S | Signals persisted |
| DB-004 | Score tables | P0 | S | Scores persisted |
| DB-005 | People/outreach tables | P0 | S | Data persisted |
| DB-006 | Feedback tables | P0 | S | Feedback persisted |

## AI

| ID | Task | Priority | Complexity | Acceptance Criteria |
|---|---|---|---|---|
| AI-001 | Company extraction | P0 | M | Valid structured output |
| AI-002 | Signal classification | P0 | M | Significance classification |
| AI-003 | Persona reasoning | P0 | M | Relevant role produced |
| AI-004 | Outreach drafting | P0 | S | Grounded draft |
| AI-005 | Conflict reasoning | P0 | M | Conflicts surfaced |

## Integrations

| ID | Task | Priority | Complexity | Acceptance Criteria |
|---|---|---|---|---|
| INT-001 | Research provider adapter | P0 | M | Search/fetch works |
| INT-002 | LLM provider adapter | P0 | M | Structured generation works |

## Automation

| ID | Task | Priority | Complexity | Acceptance Criteria |
|---|---|---|---|---|
| AUT-001 | Research worker | P0 | M | Async job executes |
| AUT-002 | Retry strategy | P0 | S | Transient failures retry |
| AUT-003 | Snapshot refresh | P1 | M | Refresh creates new snapshot |
| AUT-004 | Daily refresh | P1 | M | Scheduled refresh works |

## Testing

| ID | Task | Priority | Complexity | Acceptance Criteria |
|---|---|---|---|---|
| TEST-001 | Unit tests for scoring | P0 | S | Score cases pass |
| TEST-002 | Research integration test | P0 | M | Pipeline completes |
| TEST-003 | AI eval dataset | P0 | M | Evaluation results recorded |
| TEST-004 | End-to-end happy path | P0 | M | Full flow passes |

## Deployment

| ID | Task | Priority | Complexity | Acceptance Criteria |
|---|---|---|---|---|
| DEP-001 | Production environment | P0 | S | App deployed |
| DEP-002 | Database deployment | P0 | S | DB accessible securely |
| DEP-003 | Error monitoring | P0 | S | Errors captured |
| DEP-004 | Usage metrics | P0 | S | Core metrics visible |

---

# 25. Testing & AI Evaluation

## 25.1 Unit Testing

Focus deterministic behaviour:

- Score calculation.
- Ranking.
- Deduplication.
- URL normalisation.
- Snapshot diff.
- Conflict detection.
- Freshness.
- Permissions.
- Retry behaviour.

## 25.2 Integration Testing

Test:

- Search/research integration.
- LLM provider.
- PostgreSQL.
- Worker.
- End-to-end processing.

## 25.3 AI Evaluation Dataset

Create a fixed benchmark of representative companies.

Minimum initial set:

- 10–20 companies.
- Different industries.
- Different company sizes.
- Different information availability.
- At least a few examples with conflicting or stale information.

## 25.4 Evaluation Dimensions

### Company Intelligence

- Accuracy.
- Completeness.
- Source grounding.
- Relevance.

### Signals

- Change detection precision.
- Noise suppression.
- Actionability.

### Opportunity Scoring

- Ranking agreement with experienced user.
- Explanation quality.
- Consistency.

### Person Identification

- Role relevance.
- Evidence quality.
- Confidence calibration.

### Outreach

- Context relevance.
- Factual correctness.
- Personalisation.
- Edit distance required from human.

## 25.5 AI Release Gate

Do not ship an AI workflow solely because outputs “look good”.

Define thresholds such as:

```text
Groundedness       ≥ [Target]
Critical factual errors = 0
Schema validity     ≥ [Target]
Signal precision    ≥ [Target]
Human ranking agreement ≥ [Target]
```

Exact thresholds should be established after the first evaluation set.

---

# 26. Product Validation Plan

## 26.1 Hypothesis 1

> Users will prefer a small daily action list over a large list of opportunities.

**Experiment:**

Show users:

- Version A: 20 opportunities.
- Version B: Top 5 with reasons.

Measure:

- Review time.
- Actions taken.
- Perceived usefulness.
- Recommendation agreement.

## 26.2 Hypothesis 2

> Evidence increases trust in AI recommendations.

**Experiment:**

Compare:

- Score only.
- Score + explanation.
- Score + explanation + evidence.

Measure:

- Trust.
- Action rate.
- Rejection rate.

## 26.3 Hypothesis 3

> Meaningful triggers are more useful than generic company updates.

**Experiment:**

Show users:

- All detected changes.
- Only high-actionability changes.

Measure:

- Signal usefulness.
- Time spent.
- Actions taken.

## 26.4 Hypothesis 4

> Contextual outreach reduces editing effort.

Measure:

```text
Generated Draft
        ↓
Human Edits
        ↓
Final Draft
```

Record:

- Edit percentage.
- Rejected drafts.
- Accepted drafts.

## 26.5 Failure Criteria

Consider stopping or materially changing the product if:

- Users cannot distinguish recommendations from generic AI summaries.
- Users disagree with rankings frequently.
- Evidence is insufficient to support decisions.
- Users prefer their existing workflow after testing.
- Research cost is too high relative to value.
- The top-five workflow does not produce meaningful actions.

## 26.6 What Evidence Would Make Us Stop Building This?

Strong negative evidence would include:

1. Users say prioritisation is not a meaningful problem.
2. Users already have an efficient workflow they strongly prefer.
3. AI recommendations do not materially improve decisions.
4. Public information is consistently insufficient for the target use case.
5. Users do not trust the recommendations even with evidence.
6. The cost of producing intelligence is structurally higher than the value created.

---

# 27. Future Roadmap

## Phase 0 — Validation

Validate:

- Problem severity.
- Daily prioritisation need.
- Evidence requirements.
- Top-5 preference.
- Current alternatives.

## Phase 1 — Prototype

Deliver:

```text
10–20 companies
→ Research
→ Score
→ Top 5
```

## Phase 2 — MVP

Add:

- People/personas.
- Outreach.
- Trigger detection.
- Reliability layer.
- Feedback.
- Production monitoring.

## Phase 3 — Workflow Expansion

Add:

- CRM integrations.
- Scheduled refresh.
- Slack/email summaries.
- Team workspaces.
- User-defined scoring preferences.

## Phase 4 — Intelligence System

Potential future capabilities:

- Account change timelines.
- Historical opportunity movement.
- Multi-source entity resolution.
- Adaptive ranking based on feedback.
- Personalised scoring models.
- Workflow recommendations.

## Phase 5 — Automation

Only after strong validation:

- CRM updates.
- Automated follow-up suggestions.
- Approval-based outreach workflows.
- Automated daily summaries.

Avoid moving directly to autonomous outbound sending.

---

# 28. What I Would Build First

## 28.1 Core User

A business development professional responsible for researching and approaching companies.

## 28.2 Core Problem

They have too many potential companies and cannot manually determine every day which few deserve attention.

## 28.3 Single Most Important Workflow

```text
Input 10–20 Companies
        ↓
Research
        ↓
Extract Signals
        ↓
Score
        ↓
Return Top 5
        ↓
Explain Why
        ↓
Enable Action
```

## 28.4 MVP Features

1. Company input.
2. Public research.
3. Structured company intelligence.
4. Explainable opportunity score.
5. Top-5 daily dashboard.
6. Trigger/change detection.
7. Relevant persona/person recommendation.
8. Contextual outreach draft.
9. Source/conflict handling.
10. Feedback.

## 28.5 Technology Stack

```text
Next.js / React
        +
FastAPI / Python
        +
PostgreSQL
        +
LLM API
        +
Research Provider
        +
Background Worker
```

## 28.6 Architecture

```text
                    ┌────────────────────┐
                    │       User         │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │ Next.js Frontend   │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │   FastAPI Backend  │
                    └─────────┬──────────┘
                              ↓
             ┌────────────────┴────────────────┐
             ↓                                 ↓
    ┌─────────────────┐               ┌────────────────┐
    │ Business Logic  │               │ Research Layer │
    └────────┬────────┘               └───────┬────────┘
             ↓                                ↓
    ┌─────────────────┐               ┌────────────────┐
    │ Scoring/Signals │               │ Public Sources │
    └────────┬────────┘               └────────────────┘
             ↓
    ┌─────────────────┐
    │ AI Layer        │
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ PostgreSQL      │
    └─────────────────┘
```

## 28.7 First 10 Engineering Tasks

1. Define company/snapshot/signal/score schemas.
2. Build company input API and UI.
3. Build research-provider abstraction.
4. Build asynchronous research worker.
5. Build source ingestion and metadata persistence.
6. Build structured company extraction.
7. Build deterministic opportunity-scoring model.
8. Build top-five dashboard.
9. Build snapshot comparison and signal detection.
10. Build evidence-backed company/person/outreach view.

## 28.8 What I Would Deliberately Not Build

- Autonomous email sending.
- Full CRM.
- Large contact database.
- Multi-agent orchestration.
- Complex analytics.
- Microservices.
- Custom vector database unless retrieval requirements prove it necessary.
- Automatic actions with irreversible consequences.

## 28.9 How I Would Validate It

Start with 10–20 real companies.

Ask an experienced BD user to independently rank them.

Compare:

```text
Human Ranking
      vs
SignalDesk Ranking
```

Then investigate disagreements.

The key question is not:

> “Did the AI get the exact same ranking?”

It is:

> “Does the product expose useful reasons that help a user make a better decision faster?”

## 28.10 What Success Looks Like

A user opens the dashboard and immediately understands:

1. Which five companies matter.
2. Why each one matters.
3. What changed.
4. Who to approach.
5. What the first approach could look like.
6. What evidence supports the recommendation.

That is the product.

---

# 29. Brutal Product Review

## 29.1 Are We Solving a Real Problem?

Potentially, but this must be validated.

“Researching companies” alone is not differentiated enough.

The stronger problem is:

> **Prioritising attention across many companies using fresh, relevant evidence.**

That is the hypothesis worth testing.

## 29.2 Is the MVP Too Large?

Yes, if all nine candidate tasks are built as independent features.

The right product approach is to make them one workflow.

The P0 core is:

```text
Research
→ Signals
→ Score
→ Top 5
→ Evidence
```

People, outreach and advanced automation are downstream of that.

## 29.3 Are We Overusing AI?

There is a risk.

The temptation is:

```text
LLM → Research
LLM → Score
LLM → Rank
LLM → Detect Change
LLM → Person
LLM → Outreach
```

That is unnecessary.

Better:

```text
Deterministic:
Validation
Diff
Ranking
State
Rules

AI:
Extraction
Interpretation
Significance
Reasoning
Generation
```

## 29.4 Is There a Simpler Solution?

Yes.

The simplest useful product may initially be:

```text
Company List
+
Research
+
Simple Scoring Rules
+
Human Review
```

The scoring model can initially be partly deterministic.

Do not build sophisticated adaptive intelligence until basic ranking works.

## 29.5 Riskiest Assumption

The riskiest assumption is:

> **Public company information contains enough timely signal to reliably decide which accounts deserve attention today.**

If that is false, the rest of the system becomes an expensive summarisation layer.

## 29.6 What Could Make the Product Fail?

- Weak data.
- Unreliable sources.
- Generic recommendations.
- No meaningful advantage over search + CRM.
- Too much information.
- Lack of user trust.
- No improvement in actual actions.
- High research/LLM costs.
- Inaccurate person identification.
- Noise overwhelming useful triggers.

## 29.7 What Would an Experienced Founder Question?

They would likely ask:

- Who pays?
- What exact workflow changes?
- Why will users switch?
- Why is this better than using existing sales tooling plus an LLM?
- Which signal is uniquely valuable?
- How do we prove the ranking is better?
- What happens when sources conflict?
- How much does one researched company cost?
- How often does the daily list contain something genuinely worth acting on?

## 29.8 What Would a Senior Product Engineer Cut?

They would likely cut:

- Autonomous agents.
- Full CRM integration.
- Automated outbound.
- Complex dashboard analytics.
- Huge contact discovery.
- Custom infrastructure before validation.

## 29.9 What Would Users Actually Pay For?

Do not assume they pay for “AI company research”.

The value hypothesis is closer to:

> **Saving time and improving the quality of daily business-development decisions.**

Willingness to pay must be validated.

## 29.10 Strongest Potential Moat

Potential future moats could come from:

- Accumulated company-change history.
- User feedback on recommendation quality.
- Organisation-specific scoring.
- Workflow integration.
- High-quality signal taxonomy.
- Proprietary decision data.

The initial MVP should not assume any of these are already moats.

## 29.11 What Can Be Built in Days Rather Than Weeks?

A meaningful prototype can be:

```text
10–20 companies
→ public research
→ structured extraction
→ simple scoring
→ top 5 dashboard
→ evidence
```

This should be built before investing in advanced architecture.

## 29.12 Final Honest Assessment

The strongest interpretation of the candidate task is not to build a broad “AI sales platform”.

It is to demonstrate that the engineer can:

```text
Take ambiguity
     ↓
Identify the core decision
     ↓
Build the smallest useful workflow
     ↓
Use AI only where it helps
     ↓
Make outputs explainable
     ↓
Measure whether users act on them
```

The product should therefore be evaluated primarily on:

- Quality of prioritisation.
- Quality of reasoning.
- Evidence and uncertainty.
- Speed to useful output.
- Simplicity of implementation.
- Ability to adapt when the requirement changes from “100 opportunities” to “5 things worth acting on today”.

---

# 30. Open Questions

Only questions that materially affect the MVP should remain open.

| ID | Question | Why It Matters | Priority |
|---|---|---|---|
| Q-01 | Who is the first target customer: BD, sales, founder, partnerships, or recruiting? | Changes scoring model and workflow | P0 |
| Q-02 | What business outcome defines a “good opportunity”? | Required for scoring | P0 |
| Q-03 | Which company attributes matter most for prioritisation? | Determines scoring inputs | P0 |
| Q-04 | What public sources are permitted and available? | Determines research architecture | P0 |
| Q-05 | Is person-level public data expected in MVP? | Affects scope and privacy | P0 |
| Q-06 | How fresh does information need to be? | Determines refresh strategy | P1 |
| Q-07 | What is the expected number of companies per user? | Determines scale/cost | P1 |
| Q-08 | Is daily refresh required at launch? | Determines background infrastructure | P1 |
| Q-09 | Is CRM integration required for the test? | Potentially changes scope | P1 |
| Q-10 | What action should a recommendation ultimately drive? | Defines North Star metric | P0 |

---

# Appendix A — Product Decision Log

| Decision | Rationale | Status |
|---|---|---|
| Make Top 5 the central dashboard outcome | Directly addresses final requirement change | Proposed |
| Treat candidate tasks as one workflow | Avoid feature fragmentation | Proposed |
| Keep scoring partly deterministic | Improve explainability | Proposed |
| Keep user approval for outreach | Reduce trust and misuse risk | Proposed |
| Use one relational database for MVP | Simplicity | Proposed |
| Use background jobs for research | Research is slow and failure-prone | Proposed |
| Avoid multi-agent architecture | Not necessary for core workflow | Proposed |
| Use evidence on recommendations | Required for trust | Proposed |

---

# Appendix B — Requirement Traceability

| Requirement | User Problem | Product Capability | Metric |
|---|---|---|---|
| BR-001 | Too many companies | Top-5 ranking | Recommendation action rate |
| BR-002 | Research takes time | Company intelligence | Research time saved |
| BR-003 | Missed timing | Trigger detection | Signal usefulness |
| BR-004 | Wrong person | Persona recommendation | Persona relevance |
| BR-005 | Generic outreach | Contextual draft | Outreach edit rate |
| BR-006 | Conflicting information | Reliability layer | Correction/error rate |
| BR-007 | Too much information | Daily dashboard | Top-5 acceptance rate |

---

# Appendix C — Requirement IDs

- **BR-xxx:** Business Requirement
- **UR-xxx:** User Requirement
- **FR-xxx:** Functional Requirement
- **NFR-xxx:** Non-Functional Requirement
- **AI-xxx:** AI Requirement
- **INT-xxx:** Integration Requirement
- **AUT-xxx:** Automation Requirement
- **SEC-xxx:** Security Requirement
- **DATA-xxx:** Data Requirement
- **MET-xxx:** Measurement Requirement

---

# Appendix D — Definition of Done

The MVP is ready for evaluation when:

- A user can enter 10–20 companies.
- Research runs asynchronously.
- Public sources are stored with timestamps.
- Structured company intelligence is generated.
- Signals are extracted.
- Opportunity scores are calculated.
- Top 5 recommendations are shown.
- Each recommendation has a reason.
- Evidence is visible.
- Company snapshots can be compared.
- Meaningful changes are separated from noise.
- A relevant persona/person can be suggested for a selected company.
- A contextual outreach draft can be generated.
- User feedback can be recorded.
- Failures are visible and retryable.
- AI outputs are evaluated against a representative test set.
- Core product metrics are instrumented.
- The MVP is deployed.

---

# Appendix E — Scoring Model v0

The first scoring version should be simple and explainable.

## E.1 Example Components

| Component | Weight | Description |
|---|---:|---|
| ICP / Fit | 30% | How well the company matches the target |
| Timing | 25% | Whether there is a current trigger |
| Business Signal Strength | 20% | Strength of meaningful company changes |
| Evidence Quality | 15% | Reliability and freshness of supporting evidence |
| Actionability | 10% | Whether there is a clear next action |

## E.2 Example Formula

```text
Opportunity Score =
    Fit × 0.30
  + Timing × 0.25
  + Signal Strength × 0.20
  + Evidence Quality × 0.15
  + Actionability × 0.10
```

This is a **starting hypothesis**, not a final scoring model.

The weights should evolve from user feedback and observed outcomes.

## E.3 Important Rule

The LLM should not be the sole authority for the numeric score.

The LLM may:

- Extract.
- Classify.
- Explain.

The application should:

- Calculate.
- Rank.
- Enforce thresholds.

---

# Appendix F — Daily Dashboard Output Contract

Every recommended action should answer four questions:

### 1. Who?

`[Company]`

### 2. Why now?

`[Trigger / business signal]`

### 3. Why this company?

`[Fit / opportunity rationale]`

### 4. What next?

`[Recommended action]`

Optional:

### 5. Who should I approach?

`[Person/persona]`

### 6. What supports this?

`[Evidence / sources]`

### 7. How confident are we?

`[High / Medium / Low]`

---

# Appendix G — Candidate Test Demonstration Flow

The final demonstration should be concise and show product thinking.

## Step 1 — Input

Add 10–20 companies.

## Step 2 — Research

Show that the system automatically gathers public information.

## Step 3 — Intelligence

Open one company to show structured evidence.

## Step 4 — Prioritisation

Return the top 5 companies.

## Step 5 — Explainability

Click one recommendation and answer:

> “Why is this company #1?”

## Step 6 — Person

Show the recommended role/person and reasoning.

## Step 7 — Outreach

Generate a contextual first-touch draft.

## Step 8 — Trigger

Compare an older snapshot to a newer snapshot.

## Step 9 — Conflict

Show how conflicting source information is handled.

## Step 10 — Requirement Change

Change the product requirement from:

> “Show me all opportunities”

to:

> **“I only want the 5 things worth acting on today.”**

Then show that the product architecture already supports this through ranking and filtering instead of requiring a redesign.

---

# Appendix H — Product Narrative

The product should be explainable in one paragraph:

> **SignalDesk is an AI-native business-development decision layer. It takes a set of target companies, researches public information, turns that information into structured company intelligence, detects meaningful changes, scores each company using explainable criteria, identifies the most relevant person or persona, and produces a daily list of the five companies worth acting on. The system deliberately combines AI for interpretation with deterministic software for ranking, validation, state and business rules. Every recommendation is accompanied by evidence and uncertainty so the user can make the final decision.**

---

# Source Basis

This BRD is derived directly from the provided **Product Engineer — AI & Automation Candidate Job Description** and **Candidate Test & Evaluation Brief**.

The source emphasises:

- Product thinking.
- Ownership and autonomy.
- Full-stack engineering.
- AI-native development.
- Automation and integrations.
- Company intelligence.
- Opportunity scoring.
- Relevant-person identification.
- Personalised outreach.
- Input → Research → AI analysis → Structured output → Database.
- Trigger detection.
- Data reliability.
- Open-ended dashboard design.
- Adaptation from 100 opportunities to the 5 things worth acting on today.
- Evaluation based primarily on autonomy, product thinking, learning/problem solving, engineering, AI, automation and communication.

The source also explicitly states that the exercise is intended to test how the candidate **thinks, researches, makes decisions and builds**, rather than whether the candidate can follow a detailed specification.

