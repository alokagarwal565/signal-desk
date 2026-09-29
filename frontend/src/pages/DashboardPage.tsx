import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, type DashboardItem } from '../lib/api';
import { CompanyLogo } from '../components/CompanyLogo';

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
      {level}
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
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {sent === 'useful' ? '👍 Thanks!' : '👎 Noted'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Useful?</span>
      <button
        className="btn btn-secondary btn-sm"
        style={{ padding: '2px 8px', fontSize: 12 }}
        onClick={() => mutation.mutate('useful')}
        disabled={mutation.isPending}
        title="Mark as useful"
      >
        👍
      </button>
      <button
        className="btn btn-secondary btn-sm"
        style={{ padding: '2px 8px', fontSize: 12 }}
        onClick={() => mutation.mutate('not_useful')}
        disabled={mutation.isPending}
        title="Mark as not useful"
      >
        👎
      </button>
    </div>
  );
}

function EvidencePanel({ item }: { item: DashboardItem }) {
  const [open, setOpen] = useState(false);

  if (!item.strongestSignal && !item.opportunity?.whyNow) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <button
        className="btn btn-secondary btn-sm"
        style={{ fontSize: 12 }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '▲ Hide Evidence' : '▼ View Evidence'}
      </button>
      {open && (
        <div
          style={{
            marginTop: 8,
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            fontSize: 13,
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {item.opportunity?.whyNow && (
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: 11 }}>TIMING REASON</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{item.opportunity.whyNow}</p>
            </div>
          )}
          {item.strongestSignal && (
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: 11 }}>STRONGEST SIGNAL</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <SignalTag type={item.strongestSignal.type} />
                <span style={{ color: 'var(--text-secondary)' }}>{item.strongestSignal.description}</span>
              </div>
            </div>
          )}
          {item.opportunity && (
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: 11 }}>SCORE BREAKDOWN</strong>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                {[
                  { label: 'Fit', v: item.opportunity.strategicFit, max: 30 },
                  { label: 'Trigger', v: item.opportunity.recentTrigger, max: 25 },
                  { label: 'Growth', v: item.opportunity.growthSignal, max: 20 },
                  { label: 'Evidence', v: item.opportunity.evidenceConfidence, max: 10 },
                ].map((b) => (
                  <span key={b.label} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {b.label}: <strong style={{ color: 'var(--text-secondary)' }}>{Math.round(b.v)}/{b.max}</strong>
                  </span>
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
    <div className="opportunity-card">
      {/* Header: rank + score + company */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <span className="opportunity-card-rank" style={{ position: 'static', marginRight: 0 }}>
            #{rank}
          </span>
          <div className={`score-badge ${scoreClass(item.opportunity?.totalScore ?? 0)}`}>
            {Math.round(item.opportunity?.totalScore ?? 0)}
          </div>
          <CompanyLogo domain={item.company.domain} name={item.company.name} size={34} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {item.company.name || item.company.domain}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {item.company.domain}
              {item.company.industry && ` · ${item.company.industry}`}
            </div>
          </div>
        </div>
        {item.opportunity && <Confidence level={item.opportunity.confidence} />}
      </div>

      {/* BRD §11.2 — Why Now */}
      {item.opportunity?.whyNow && (
        <div className="why-now" style={{ marginBottom: 12 }}>
          <div className="why-now-label">Why Now</div>
          {item.opportunity.whyNow}
        </div>
      )}

      {/* BRD §F — Who, Signal, Recommended Action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {item.topPerson && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>WHO</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.topPerson.name}</span>
            {item.topPerson.role && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— {item.topPerson.role}</span>
            )}
          </div>
        )}

        {item.strongestSignal && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>SIGNAL</span>
            <SignalTag type={item.strongestSignal.type} />
          </div>
        )}

        {item.recommendedAction && (
          <div className="flex items-start gap-2">
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 80, flexShrink: 0, paddingTop: 2 }}>
              NEXT ACTION
            </span>
            <span
              style={{
                fontSize: 13,
                color: 'var(--accent-primary)',
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              → {item.recommendedAction}
            </span>
          </div>
        )}
      </div>

      {/* Evidence toggle */}
      <EvidencePanel item={item} />

      {/* Footer CTAs */}
      <div
        className="flex items-center justify-between"
        style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}
      >
        <FeedbackButtons companyId={item.company.id} />
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/companies/${item.company.id}`)}
          style={{ fontSize: 13 }}
        >
          Open Company →
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

  const { data: metricsData } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 60_000,
  });

  const m = metricsData?.metrics;

  return (
    <div>
      <div className="page-header">
        <h1>What should I act on today?</h1>
        <p>Top opportunities ranked by evidence, signals, and timing</p>
      </div>

      {/* BRD §7.7 — Product metrics bar */}
      {m && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: '10px 16px',
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{m.companies.total}</strong> companies
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{m.opportunitiesScored}</strong> scored
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{m.outreachDraftsGenerated}</strong> drafts
          </span>
          {m.feedback.actionRate !== null && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Recommendation usefulness:{' '}
              <strong style={{ color: m.feedback.actionRate >= 70 ? '#34d399' : m.feedback.actionRate >= 40 ? '#fbbf24' : '#f87171' }}>
                {m.feedback.actionRate}%
              </strong>
              {' '}({m.feedback.total} ratings)
            </span>
          )}
        </div>
      )}

      {isLoading && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <p className="mt-4">Loading your opportunities...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'rgba(248, 113, 113, 0.3)' }}>
          <p style={{ color: '#f87171' }}>Failed to load dashboard: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h3>No opportunities yet</h3>
          <p>
            Add companies to research and SignalDesk will identify the top opportunities worth acting on.
          </p>
          <a href="/add" className="btn btn-primary mt-4">Add your first company</a>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.items.map((item, i) => (
            <OpportunityCard key={item.company.id} item={item} rank={i + 1} />
          ))}

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Updated {new Date(data.generatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
