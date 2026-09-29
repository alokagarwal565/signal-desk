import { useQuery } from '@tanstack/react-query';
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

function OpportunityCard({ item, rank }: { item: DashboardItem; rank: number }) {
  const navigate = useNavigate();

  return (
    <div className="opportunity-card" onClick={() => navigate(`/companies/${item.company.id}`)}>
      <span className="opportunity-card-rank">#{rank}</span>

      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <div className={`score-badge ${scoreClass(item.opportunity?.totalScore ?? 0)}`}>
          {Math.round(item.opportunity?.totalScore ?? 0)}
        </div>
        <CompanyLogo domain={item.company.domain} name={item.company.name} size={36} />
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

      {item.opportunity?.whyNow && (
        <div className="why-now" style={{ marginBottom: 16 }}>
          <div className="why-now-label">Why Now</div>
          {item.opportunity.whyNow}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {item.strongestSignal && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60 }}>Signal</span>
            <SignalTag type={item.strongestSignal.type} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }} className="truncate">
              {item.strongestSignal.description}
            </span>
          </div>
        )}

        {item.topPerson && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60 }}>Contact</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.topPerson.name}</span>
            {item.topPerson.role && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— {item.topPerson.role}</span>
            )}
          </div>
        )}

        {item.opportunity && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60 }}>Conf.</span>
            <Confidence level={item.opportunity.confidence} />
          </div>
        )}
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

  return (
    <div>
      <div className="page-header">
        <h1>What should I act on today?</h1>
        <p>Your top opportunities ranked by evidence, signals, and timing</p>
      </div>

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
