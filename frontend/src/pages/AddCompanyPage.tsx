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
        <h1>Add Company</h1>
        <p>Enter a company website URL to start researching</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Company Website URL
          </label>

          <div className="flex gap-3">
            <input
              className="input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={mutation.isPending}
              autoFocus
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={mutation.isPending || !url.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {mutation.isPending ? (
                <><span className="spinner" /> Researching...</>
              ) : (
                'Research Company'
              )}
            </button>
          </div>

          {mutation.error && (
            <div style={{
              marginTop: 16,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              color: '#f87171',
              fontSize: 13,
            }}>
              {mutation.error instanceof Error ? mutation.error.message : 'Failed to add company'}
            </div>
          )}
        </form>

        <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
            What happens next
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            <div>→ Company website is analyzed</div>
            <div>→ Key pages are scraped for evidence</div>
            <div>→ AI extracts company intelligence</div>
            <div>→ Business signals are identified</div>
            <div>→ Opportunity is scored</div>
            <div>→ Results appear on your dashboard</div>
          </div>
        </div>
      </div>
    </div>
  );
}
