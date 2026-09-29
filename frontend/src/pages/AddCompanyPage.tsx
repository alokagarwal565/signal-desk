import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function AddCompanyPage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (companyUrl: string) => api.addCompany(companyUrl),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(`/companies/${data.company.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    mutation.mutate(url.trim());
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Add Target Company</h1>
          <p>Provide a corporate domain to launch the multi-source AI extraction and opportunity pipeline.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Company Domain or Website URL
          </label>

          <div className="flex gap-3">
            <input
              className="input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. stripe.com or https://linear.app"
              disabled={mutation.isPending}
              autoFocus
              style={{ height: 38 }}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={mutation.isPending || !url.trim()}
              style={{ whiteSpace: 'nowrap', height: 38 }}
            >
              {mutation.isPending ? (
                <>
                  <span className="spinner" />
                  <span>Launching Pipeline...</span>
                </>
              ) : (
                'Start Research'
              )}
            </button>
          </div>

          {mutation.error && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                fontSize: 13,
              }}
            >
              {mutation.error instanceof Error ? mutation.error.message : 'Failed to add company'}
            </div>
          )}
        </form>

        <div
          style={{
            marginTop: 28,
            padding: '18px 22px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
            Automated Intelligence Pipeline
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>01</span>
              <span>Crawls official site & public sources</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>02</span>
              <span>Extracts tech stack, leadership & model</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>03</span>
              <span>Detects growth, funding & hiring triggers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>04</span>
              <span>Calculates multi-factor opportunity score</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
