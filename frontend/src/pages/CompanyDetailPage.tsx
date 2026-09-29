import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Person, type Source } from '../lib/api';
import { CompanyLogo } from '../components/CompanyLogo';

type Tab = 'overview' | 'signals' | 'opportunity' | 'people' | 'outreach' | 'history' | 'sources';

function scoreClass(score: number): string {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// ─── Research Progress ──────────────────────────

function ResearchProgress({ companyId }: { companyId: string }) {
  const { data } = useQuery({
    queryKey: ['research-status', companyId],
    queryFn: () => api.getResearchStatus(companyId),
    refetchInterval: 2000,
  });

  const job = data?.job;
  if (!job) return null;

  const steps = [
    { key: 'discovering_pages', label: 'Discovering company pages' },
    { key: 'scraping', label: `Analyzing pages${job.progress?.total ? ` (${job.progress.completed || '0'}/${job.progress.total})` : ''}` },
    { key: 'extracting_intelligence', label: 'Extracting company intelligence' },
    { key: 'detecting_signals', label: 'Detecting business signals' },
    { key: 'scoring_opportunity', label: 'Scoring opportunity' },
    { key: 'researching_people', label: 'Identifying relevant people & decision makers' },
    { key: 'creating_snapshot', label: 'Creating snapshot' },
  ];

  const currentStep = job.progress?.step || '';
  const stepKeys = steps.map((s) => s.key);
  const currentIdx = stepKeys.indexOf(currentStep);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <span className="card-title">Research in Progress</span>
        {job.status === 'in_progress' && <span className="spinner" />}
      </div>
      <div className="research-progress">
        {steps.map((step, i) => {
          let status = 'pending';
          if (currentStep === 'completed' || currentStep === 'failed') {
            status = currentStep === 'failed' && i >= currentIdx ? 'pending' : 'done';
          } else if (i < currentIdx) status = 'done';
          else if (i === currentIdx) status = 'active';

          return (
            <div key={step.key} className={`progress-step ${status}`}>
              <span className="icon">
                {status === 'done' && '✓'}
                {status === 'active' && <span className="spinner" />}
                {status === 'pending' && '○'}
              </span>
              {step.label}
            </div>
          );
        })}
      </div>
      {job.status === 'partial' && (
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--score-medium)' }}>
          Research completed from {job.sourcesSucceeded} sources. {job.sourcesFailed} sources were unavailable.
        </div>
      )}
      {job.status === 'failed' && job.error && (
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--score-low)' }}>
          Error: {job.error}
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────

function OverviewTab({ companyId }: { companyId: string }) {
  const { data } = useQuery({
    queryKey: ['intelligence', companyId],
    queryFn: () => api.getIntelligence(companyId),
  });

  const intel = data?.intelligence;
  if (!intel) return <div className="empty-state"><h3>No intelligence yet</h3><p>Research needs to complete first.</p></div>;

  const d = intel.data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="card-title mb-2">Summary</div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{d.summary}</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title mb-2">Business Model</div>
          <p className="text-sm text-muted">{d.businessModel}</p>
        </div>
        <div className="card">
          <div className="card-title mb-2">Target Customers</div>
          <p className="text-sm text-muted">{d.targetCustomers}</p>
        </div>
        <div className="card">
          <div className="card-title mb-2">Company Size</div>
          <p className="text-sm text-muted">{d.companySizeIndicators}</p>
        </div>
        <div className="card">
          <div className="card-title mb-2">Geographies</div>
          <p className="text-sm text-muted">{d.geographies.join(', ') || 'Unknown'}</p>
        </div>
      </div>

      {d.productsServices.length > 0 && (
        <div className="card">
          <div className="card-title mb-2">Products & Services</div>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {d.productsServices.map((p, i) => (
              <span key={i} style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)', fontSize: 13, color: 'var(--text-secondary)',
              }}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {d.potentialOpportunity && d.potentialOpportunity !== 'Insufficient evidence' && (
        <div className="why-now">
          <div className="why-now-label">Why This Company Matters</div>
          {d.potentialOpportunity}
        </div>
      )}

      {d.keyEvidence.length > 0 && (
        <div className="card">
          <div className="card-title mb-2">Key Evidence</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.keyEvidence.map((e, i) => (
              <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-primary)' }}>{e.fact}</span>
                {e.source && <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 11 }}>— {e.source}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BRD §18.5 — Conflicting claims surface */}
      {Array.isArray((d as Record<string, unknown>).conflictingClaims) &&
        ((d as Record<string, unknown>).conflictingClaims as {field: string; sourceA: string; valueA: string; sourceB: string; valueB: string; resolution?: string}[]).length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(251, 191, 36, 0.25)' }}>
          <div className="card-title mb-3" style={{ color: '#fbbf24' }}>⚠ Conflicting Source Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {((d as Record<string, unknown>).conflictingClaims as {field: string; sourceA: string; valueA: string; sourceB: string; valueB: string; resolution?: string}[]).map((c, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(251, 191, 36, 0.05)', fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{c.field}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 11, marginBottom: 2 }}>{c.sourceA}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{c.valueA || '—'}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 11, marginBottom: 2 }}>{c.sourceB}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{c.valueB || '—'}</div>
                  </div>
                </div>
                {c.resolution && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#fbbf24' }}>Resolution: {c.resolution}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="confidence-indicator" style={{ justifyContent: 'flex-end' }}>
        Intelligence confidence: <span className={`confidence-dot ${d.confidence}`} /> {d.confidence}
      </div>
    </div>
  );
}

// ─── Signals Tab ────────────────────────────────

function SignalsTab({ companyId }: { companyId: string }) {
  const { data } = useQuery({
    queryKey: ['signals', companyId],
    queryFn: () => api.getSignals(companyId),
  });

  if (!data?.signals?.length) return <div className="empty-state"><h3>No signals detected</h3><p>Signals are identified during research.</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.signals.map((signal) => (
        <div key={signal.id} className="card">
          <div className="flex items-center justify-between mb-2">
            <span className={`signal-tag ${signal.type.toLowerCase()}`}>{signal.type.replace(/_/g, ' ')}</span>
            <span className="confidence-indicator">
              <span className={`confidence-dot ${signal.confidence}`} /> {signal.confidence}
            </span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{signal.description}</p>
          {signal.meaning && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <strong style={{ color: 'var(--text-muted)' }}>Meaning:</strong> {signal.meaning}
            </div>
          )}
          {signal.actionability && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Actionability:</strong> {signal.actionability}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Opportunity Tab ────────────────────────────

function OpportunityTab({ companyId }: { companyId: string }) {
  const { data } = useQuery({
    queryKey: ['opportunity', companyId],
    queryFn: () => api.getOpportunity(companyId),
  });

  const opp = data?.opportunity;
  if (!opp) return <div className="empty-state"><h3>No opportunity scored yet</h3></div>;

  const breakdowns = [
    { label: 'Strategic Fit', value: opp.strategicFit, max: 30 },
    { label: 'Recent Trigger', value: opp.recentTrigger, max: 25 },
    { label: 'Growth Signal', value: opp.growthSignal, max: 20 },
    { label: 'Reachability', value: opp.reachability, max: 15 },
    { label: 'Evidence Confidence', value: opp.evidenceConfidence, max: 10 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className={`score-badge ${scoreClass(opp.totalScore)}`} style={{ fontSize: 24, width: 64, height: 48 }}>
            {Math.round(opp.totalScore)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Opportunity Score</div>
            <span className="confidence-indicator mt-2">
              <span className={`confidence-dot ${opp.confidence}`} /> {opp.confidence} confidence
            </span>
          </div>
        </div>

        <div className="score-breakdown">
          {breakdowns.map((b) => (
            <div key={b.label} className="score-row">
              <span className="score-label">{b.label}</span>
              <div className="score-bar-bg">
                <div className="score-bar-fill" style={{ width: `${(b.value / b.max) * 100}%` }} />
              </div>
              <span className="score-value">{Math.round(b.value)}/{b.max}</span>
            </div>
          ))}
        </div>
      </div>

      {opp.whyNow && (
        <div className="why-now">
          <div className="why-now-label">Why Now</div>
          {opp.whyNow}
        </div>
      )}

      {opp.explanation && (
        <div className="card">
          <div className="card-title mb-2">Score Reasoning</div>
          <pre style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>
            {opp.explanation}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── People Tab ─────────────────────────────────

function PeopleTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['people', companyId],
    queryFn: () => api.getPeople(companyId),
  });

  const researchMutation = useMutation({
    mutationFn: () => api.researchPeople(companyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['people', companyId] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="card-title">Relevant People</div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => researchMutation.mutate()}
          disabled={researchMutation.isPending}
        >
          {researchMutation.isPending ? <><span className="spinner" /> Finding people...</> : 'Find People'}
        </button>
      </div>

      {(!data?.people?.length && !isLoading) && (
        <div className="empty-state">
          <h3>No people identified yet</h3>
          <p>Click "Find People" to identify relevant contacts at this company.</p>
        </div>
      )}

      {data?.people && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.people.map((person) => (
            <PersonCard key={person.id} person={person} companyId={companyId} />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonCard({ person }: { person: Person; companyId?: string }) {
  const isTargetRole =
    person.name.toLowerCase() === person.role?.toLowerCase() ||
    person.name.toLowerCase().includes('decision maker') ||
    person.confidence === 'low';

  // Clean display name of repetitive suffixes
  const displayName = person.name.replace(/\s+Decision\s+Maker/gi, '').trim();
  const displayRole = person.role?.replace(/\s+Decision\s+Maker/gi, '').trim();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-full)',
              background: isTargetRole
                ? 'rgba(148, 163, 184, 0.15)'
                : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {isTargetRole ? '🎯' : (displayName[0]?.toUpperCase() || '👤')}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{displayName}</span>
              {isTargetRole && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(148, 163, 184, 0.12)',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 600,
                  }}
                >
                  Target Role
                </span>
              )}
            </div>
            {displayRole && displayRole.toLowerCase() !== displayName.toLowerCase() && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{displayRole}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {person.persona && (
            <span
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(129, 140, 248, 0.1)',
                color: 'var(--accent-primary)',
              }}
            >
              {person.persona}
            </span>
          )}
          <span className="confidence-indicator">
            <span className={`confidence-dot ${person.confidence}`} /> {person.confidence}
          </span>
        </div>
      </div>
      {person.whyRelevant && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 8 }}>
          <strong style={{ color: 'var(--text-muted)' }}>Why relevant:</strong> {person.whyRelevant}
        </p>
      )}
      {person.profileUrl && (
        <a href={person.profileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, marginTop: 4, display: 'inline-block' }}>
          View profile →
        </a>
      )}
    </div>
  );
}

// ─── Outreach Tab ───────────────────────────────

function OutreachTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['outreach', companyId],
    queryFn: () => api.getOutreach(companyId),
  });

  const mutation = useMutation({
    mutationFn: () => api.generateOutreach(companyId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['outreach', companyId] });
      setSelectedDraftId(res.outreach.id);
    },
  });

  const drafts = data?.drafts ?? [];
  const draft = (selectedDraftId ? drafts.find((d) => d.id === selectedDraftId) : drafts[0]) ?? data?.outreach ?? null;

  const handleCopy = () => {
    if (draft) {
      navigator.clipboard.writeText(draft.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="card-title">Outreach Draft</div>
          {drafts.length > 1 && (
            <div className="flex items-center gap-1">
              {drafts.map((d) => (
                <button
                  key={d.id}
                  className={`btn btn-sm ${draft?.id === d.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '2px 8px', fontSize: 11 }}
                  onClick={() => setSelectedDraftId(d.id)}
                >
                  v{d.version}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <><span className="spinner" /> Generating...</> : (draft ? 'Generate Another Draft' : 'Generate Outreach')}
        </button>
      </div>

      {isLoading && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 28, height: 28 }} />
          <p className="mt-2 text-sm text-muted">Loading outreach drafts...</p>
        </div>
      )}

      {!isLoading && !draft && !mutation.isPending && (
        <div className="empty-state">
          <h3>No outreach generated yet</h3>
          <p>Generate a contextual, evidence-based outreach message for this company.</p>
        </div>
      )}

      {draft && (
        <div>
          {draft.context && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Personalisation Context
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'pre-line', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', lineHeight: 1.6 }}>
                {draft.context}
              </div>
            </div>
          )}
          <div className="outreach-message">{draft.message}</div>
          <div
            style={{
              marginTop: 12,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(251, 191, 36, 0.06)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              fontSize: 12,
              color: '#fbbf24',
              lineHeight: 1.5,
            }}
          >
            ⚠ Review before sending — verify all claims against real company information. This draft uses AI-generated language grounded in scraped evidence; some details may be outdated or inferred.
          </div>
          <div className="flex items-center justify-between mt-4">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Version {draft.version} · {new Date(draft.createdAt).toLocaleString()}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy Message'}
            </button>
          </div>
        </div>
      )}

      {mutation.error && (
        <div style={{ marginTop: 16, color: 'var(--score-low)', fontSize: 13 }}>
          {mutation.error instanceof Error ? mutation.error.message : 'Failed to generate outreach'}
        </div>
      )}
    </div>
  );
}

// ─── Sources Tab ────────────────────────────────

const AUTHORITY_LABELS: Record<string, { label: string; color: string }> = {
  first_party: { label: 'First Party', color: '#34d399' },
  official_announcement: { label: 'Official', color: '#60a5fa' },
  established_publication: { label: 'Publication', color: '#a78bfa' },
  third_party_database: { label: '3rd Party DB', color: '#fbbf24' },
  unverified: { label: 'Unverified', color: '#9494a8' },
};

function SourceRow({ source }: { source: Source }) {
  const auth = AUTHORITY_LABELS[source.authority] || AUTHORITY_LABELS['unverified']!;
  const ageH = Math.floor(
    (Date.now() - new Date(source.retrievedAt).getTime()) / (1000 * 60 * 60)
  );
  const freshness = ageH < 24 ? 'Fresh' : ageH < 168 ? 'Aging' : 'Stale';
  const freshnessColor = freshness === 'Fresh' ? '#34d399' : freshness === 'Aging' ? '#fbbf24' : '#f87171';

  let hostname = source.sourceUrl;
  try { hostname = new URL(source.sourceUrl).hostname; } catch { /* noop */ }

  return (
    <div className="card" style={{ padding: '12px 16px' }}>
      <div className="flex items-start justify-between gap-3">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
            {source.title || hostname}
          </div>
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--text-muted)', wordBreak: 'break-all' }}
          >
            {source.sourceUrl}
          </a>
        </div>
        <div className="flex items-center gap-2" style={{ flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)',
              background: `${auth.color}18`, color: auth.color, fontWeight: 600,
            }}
          >
            {auth.label}
          </span>
          <span
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)',
              background: `${freshnessColor}12`, color: freshnessColor, fontWeight: 600,
            }}
          >
            {freshness}
          </span>
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
        {source.sourceType} · Retrieved {new Date(source.retrievedAt).toLocaleString()}
      </div>
    </div>
  );
}

function SourcesTab({ companyId }: { companyId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['sources', companyId],
    queryFn: () => api.getSources(companyId),
  });

  if (isLoading)
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );

  if (!data?.sources?.length)
    return (
      <div className="empty-state">
        <h3>No sources recorded</h3>
        <p>Sources are collected during company research.</p>
      </div>
    );

  const byAuth = data.sources.reduce<Record<string, number>>((acc, s) => {
    acc[s.authority] = (acc[s.authority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={{ padding: '12px 16px' }}>
        <div className="card-title mb-3" style={{ fontSize: 13 }}>Source Coverage</div>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {Object.entries(byAuth).map(([auth, count]) => {
            const a = AUTHORITY_LABELS[auth] || AUTHORITY_LABELS['unverified']!;
            return (
              <span key={auth} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ color: a.color, fontWeight: 600 }}>{count}</span> {a.label}
              </span>
            );
          })}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {data.sources.length} total sources
          </span>
        </div>
      </div>
      {data.sources.map((source) => (
        <SourceRow key={source.id} source={source} />
      ))}
    </div>
  );
}

// ─── History Tab ────────────────────────────────

function HistoryTab({ companyId }: { companyId: string }) {
  const { data: snapshotsData } = useQuery({
    queryKey: ['snapshots', companyId],
    queryFn: () => api.getSnapshots(companyId),
  });
  const { data: changesData } = useQuery({
    queryKey: ['changes', companyId],
    queryFn: () => api.getChanges(companyId),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {changesData?.changes && changesData.changes.length > 0 && (
        <div>
          <div className="card-title mb-4">Detected Changes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {changesData.changes.map((change) => (
              <div key={change.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{change.changeType}</span>
                  <div className="flex gap-2">
                    {change.significance && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        background: change.significance === 'high' ? 'rgba(248, 113, 113, 0.12)' : change.significance === 'medium' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(148, 148, 168, 0.12)',
                        color: change.significance === 'high' ? '#f87171' : change.significance === 'medium' ? '#fbbf24' : '#9494a8',
                      }}>
                        {change.significance} significance
                      </span>
                    )}
                    {change.actionability && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        background: change.actionability === 'high' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(148, 148, 168, 0.12)',
                        color: change.actionability === 'high' ? '#34d399' : '#9494a8',
                      }}>
                        {change.actionability} actionability
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{change.description}</p>
                {change.recommendedAction && (
                  <div style={{ marginTop: 8, fontSize: 13, color: 'var(--accent-primary)' }}>
                    → {change.recommendedAction}
                  </div>
                )}
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(change.detectedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="card-title mb-4">Snapshots</div>
        {(!snapshotsData?.snapshots?.length) && (
          <div className="empty-state"><p>No snapshots recorded yet.</p></div>
        )}
        {snapshotsData?.snapshots && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {snapshotsData.snapshots.map((snap) => (
              <div key={snap.id} className="card" style={{ padding: 16 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    Snapshot #{snap.snapshotNumber}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(snap.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  {snap.evidenceCount} evidence sources
                  {snap.opportunityData ? ` · Score: ${(snap.opportunityData as { totalScore?: number })?.totalScore ?? 'N/A'}` : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.getCompany(id!),
    enabled: !!id,
  });

  const refreshMutation = useMutation({
    mutationFn: () => api.refreshCompany(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      queryClient.invalidateQueries({ queryKey: ['research-status', id] });
    },
  });

  if (isLoading) return <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!data?.company) return <div className="empty-state"><h3>Company not found</h3></div>;

  const company = data.company;
  const isResearching = company.researchStatus === 'pending' || company.researchStatus === 'in_progress';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'signals', label: 'Signals' },
    { key: 'opportunity', label: 'Opportunity' },
    { key: 'people', label: 'People' },
    { key: 'outreach', label: 'Outreach' },
    { key: 'history', label: 'History' },
    { key: 'sources', label: 'Sources' },
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CompanyLogo domain={company.domain} name={company.name} size={52} />
          <div>
            <h1>{company.name || company.domain}</h1>
            <p>
              {company.domain}
              {company.industry && ` · ${company.industry}`}
            </p>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending || isResearching}
        >
          {isResearching ? 'Researching...' : 'Refresh Research'}
        </button>
      </div>

      {isResearching && <ResearchProgress companyId={id!} />}

      {/* BRD §10.5 — Failure states */}
      {company.researchStatus === 'failed' && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            borderColor: 'rgba(248, 113, 113, 0.3)',
            background: 'rgba(248, 113, 113, 0.04)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
                Research could not be completed for this company.
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                The site may be unavailable or blocked. Retry to attempt again.
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            >
              {refreshMutation.isPending ? <><span className="spinner" /> Retrying...</> : 'Retry Research'}
            </button>
          </div>
        </div>
      )}

      {company.researchStatus === 'partial' && (
        <div
          style={{
            marginBottom: 20,
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(251, 191, 36, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            fontSize: 13,
            color: '#fbbf24',
          }}
        >
          Research completed with limited source coverage — some pages were unavailable. Results may be incomplete.
        </div>
      )}


      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab companyId={id!} />}
      {activeTab === 'signals' && <SignalsTab companyId={id!} />}
      {activeTab === 'opportunity' && <OpportunityTab companyId={id!} />}
      {activeTab === 'people' && <PeopleTab companyId={id!} />}
      {activeTab === 'outreach' && <OutreachTab companyId={id!} />}
      {activeTab === 'history' && <HistoryTab companyId={id!} />}
      {activeTab === 'sources' && <SourcesTab companyId={id!} />}
    </div>
  );
}
