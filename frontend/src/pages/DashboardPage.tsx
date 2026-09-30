import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { api, type DashboardItem } from '../lib/api';
import { CompanyLogo } from '../components/CompanyLogo';
import { MetricsGridSkeleton, OpportunityCardSkeleton } from '../components/Skeleton';

function scoreClass(score: number): string {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function SignalTag({ type }: { type: string }) {
  return <span className={`signal-tag ${type.toLowerCase()}`}>{type.replace(/_/g, ' ')}</span>;
}

function Confidence({ level }: { level: string }) {
  return (
    <span className="confidence-indicator">
      <span className={`confidence-dot ${level}`} />
      <span style={{ textTransform: 'capitalize' }}>{level} Confidence</span>
    </span>
  );
}

function FeedbackButtons({ companyId }: { companyId: string }) {
  const [sent, setSent] = useState<'useful' | 'not_useful' | null>(null);

  const mutation = useMutation({
    mutationFn: (rating: 'useful' | 'not_useful') =>
      api.sendFeedback({ companyId, targetType: 'opportunity', rating }),
    onSuccess: (_, rating) => setSent(rating),
  });

  if (sent) {
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: sent === 'useful' ? 'var(--score-high)' : 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        {sent === 'useful' ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Helpful feedback saved
          </>
        ) : (
          'Feedback noted'
        )}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginRight: 4 }}>Helpful?</span>
      <button
        className="btn-icon"
        style={{ width: 28, height: 28, minHeight: 28 }}
        onClick={() => mutation.mutate('useful')}
        disabled={mutation.isPending}
        title="Mark as useful"
        aria-label="Mark opportunity as useful"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>
      <button
        className="btn-icon"
        style={{ width: 28, height: 28, minHeight: 28 }}
        onClick={() => mutation.mutate('not_useful')}
        disabled={mutation.isPending}
        title="Mark as not useful"
        aria-label="Mark opportunity as not useful"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
        </svg>
      </button>
    </div>
  );
}

function EvidencePanel({ item }: { item: DashboardItem }) {
  const [open, setOpen] = useState(false);

  if (!item.strongestSignal && !item.opportunity?.whyNow) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <button
        className="btn btn-secondary btn-sm"
        style={{ fontSize: 12, gap: 6 }}
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 180ms ease',
          }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {open ? 'Hide Evidence & Breakdown' : 'Inspect Evidence & Scores'}
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: 13,
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {item.opportunity?.whyNow && (
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                TIMING RATIONALE
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{item.opportunity.whyNow}</p>
            </div>
          )}

          {item.strongestSignal && (
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                PRIMARY DETECTED SIGNAL
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <SignalTag type={item.strongestSignal.type} />
                <span style={{ color: 'var(--text-secondary)' }}>{item.strongestSignal.description}</span>
              </div>
            </div>
          )}

          {item.opportunity && (
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                SCORE BREAKDOWN
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {[
                  { label: 'Strategic Fit', v: item.opportunity.strategicFit, max: 30 },
                  { label: 'Recent Trigger', v: item.opportunity.recentTrigger, max: 25 },
                  { label: 'Growth Signal', v: item.opportunity.growthSignal, max: 20 },
                  { label: 'Evidence Conf.', v: item.opportunity.evidenceConfidence, max: 10 },
                ].map((b) => (
                  <div
                    key={b.label}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{b.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: 2 }}>
                      {Math.round(b.v)} <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>/ {b.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ item, rank }: { item: DashboardItem; rank: number }) {
  const navigate = useNavigate();

  return (
    <div className="opportunity-card" onClick={() => navigate(`/companies/${item.company.id}`)}>
      <span className="opportunity-card-rank">#{rank} Ranked</span>

      {/* Header: Score + Company Branding */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <div className={`score-badge ${scoreClass(item.opportunity?.totalScore ?? 0)}`}>
            {Math.round(item.opportunity?.totalScore ?? 0)}
          </div>
          <CompanyLogo domain={item.company.domain} name={item.company.name} size={38} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
              {item.company.name || item.company.domain}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {item.company.domain}
              {item.company.industry && ` · ${item.company.industry}`}
            </div>
          </div>
        </div>
        {item.opportunity && <Confidence level={item.opportunity.confidence} />}
      </div>

      {/* Why Now Callout */}
      {item.opportunity?.whyNow && (
        <div className="why-now" style={{ marginBottom: 14 }}>
          <div className="why-now-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Why Act Now
          </div>
          <div style={{ color: 'var(--text-primary)', fontSize: 13.5 }}>{item.opportunity.whyNow}</div>
        </div>
      )}

      {/* Who · Signal · Recommended Action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
        {item.topPerson && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-tertiary)', width: 84, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Target Lead
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.topPerson.name}</span>
            {item.topPerson.role && (
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>— {item.topPerson.role}</span>
            )}
          </div>
        )}

        {item.strongestSignal && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-tertiary)', width: 84, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Core Trigger
            </span>
            <SignalTag type={item.strongestSignal.type} />
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }} className="truncate">
              {item.strongestSignal.description}
            </span>
          </div>
        )}

        {item.recommendedAction && (
          <div className="flex items-start gap-2">
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-tertiary)', width: 84, flexShrink: 0, paddingTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Next Step
            </span>
            <span
              style={{
                fontSize: 13,
                color: 'var(--text-accent)',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              → {item.recommendedAction}
            </span>
          </div>
        )}
      </div>

      {/* Accordion Evidence Drawer */}
      <div onClick={(e) => e.stopPropagation()}>
        <EvidencePanel item={item} />
      </div>

      {/* Footer CTAs */}
      <div
        className="flex items-center justify-between"
        style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <FeedbackButtons companyId={item.company.id} />
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/companies/${item.company.id}`)}
        >
          View Full Dossier
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
    refetchInterval: 30_000,
  });

  const { data: metricsData, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 60_000,
  });

  const m = metricsData?.metrics;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Opportunity Prioritization</h1>
          <p>Real-time company intelligence ranked by evidence strength, signal triggers, and timing.</p>
        </div>
      </div>

      {/* Executive Metrics Summary Bar */}
      {m ? (
        <div className="metrics-strip">
          <div className="metric-card">
            <span className="metric-label">Monitored Targets</span>
            <div className="metric-value-row">
              <span className="metric-value">{m.companies.total}</span>
              <span className="metric-sub">companies</span>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Opportunities Scored</span>
            <div className="metric-value-row">
              <span className="metric-value">{m.opportunitiesScored}</span>
              <span className="metric-sub">pipeline</span>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Outreach Drafts</span>
            <div className="metric-value-row">
              <span className="metric-value">{m.outreachDraftsGenerated}</span>
              <span className="metric-sub">tailored</span>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Signal Usefulness</span>
            <div className="metric-value-row">
              <span
                className="metric-value"
                style={{
                  color:
                    m.feedback.actionRate !== null && m.feedback.actionRate >= 70
                      ? 'var(--score-high)'
                      : m.feedback.actionRate !== null && m.feedback.actionRate >= 40
                      ? 'var(--score-medium)'
                      : 'var(--text-primary)',
                }}
              >
                {m.feedback.actionRate !== null ? `${m.feedback.actionRate}%` : '—'}
              </span>
              <span className="metric-sub">({m.feedback.total} reviews)</span>
            </div>
          </div>
        </div>
      ) : isMetricsLoading ? (
        <MetricsGridSkeleton />
      ) : null}

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <p style={{ color: '#f87171', fontSize: 13.5 }}>
            Failed to load dashboard: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h3>No opportunities ranked yet</h3>
          <p>
            Add companies to research and SignalDesk will automatically analyze web signals, detect triggers, and surface high-priority targets.
          </p>
          <Link to="/add" className="btn btn-primary mt-4">
            Track your first company
          </Link>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.items.map((item, i) => (
            <OpportunityCard key={item.company.id} item={item} rank={i + 1} />
          ))}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Engine updated: {new Date(data.generatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
