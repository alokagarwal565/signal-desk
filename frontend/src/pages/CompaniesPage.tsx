import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, type Company } from '../lib/api';
import { CompanyLogo } from '../components/CompanyLogo';

function statusBadge(status: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'rgba(52, 211, 153, 0.12)', text: '#34d399' },
    partial: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24' },
    in_progress: { bg: 'rgba(129, 140, 248, 0.12)', text: '#818cf8' },
    pending: { bg: 'rgba(148, 148, 168, 0.12)', text: '#9494a8' },
    failed: { bg: 'rgba(248, 113, 113, 0.12)', text: '#f87171' },
  };
  const c = colors[status] || colors.pending!;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: c.bg,
        color: c.text,
      }}
    >
      {status === 'in_progress' && (
        <span
          className="spinner"
          style={{ width: 10, height: 10, borderWidth: 1.5, borderColor: c.text, borderTopColor: 'transparent' }}
        />
      )}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function CompaniesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  // Fetch companies with auto-poll if any are in progress
  const { data, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: api.getCompanies,
    refetchInterval: (query) => {
      const companies = query.state.data?.companies;
      const hasActive = companies?.some(
        (c) => c.researchStatus === 'in_progress' || c.researchStatus === 'pending'
      );
      return hasActive ? 3000 : false;
    },
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (url: string) => api.addCompany(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsAddOpen(false);
      setNewUrl('');
      setAddError(null);
    },
    onError: (err: Error) => {
      setAddError(err.message || 'Failed to add company');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string | null; industry?: string | null; summary?: string | null };
    }) => api.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setEditingCompany(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setDeletingCompany(null);
    },
  });

  const reResearchMutation = useMutation({
    mutationFn: (id: string) => api.startResearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const openEditModal = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    setEditingCompany(company);
    setEditName(company.name || '');
    setEditIndustry(company.industry || '');
    setEditSummary(company.summary || '');
  };

  const openDeleteModal = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    setDeletingCompany(company);
  };

  const handleReResearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    reResearchMutation.mutate(id);
  };

  // Filtered companies
  const filteredCompanies = (data?.companies || []).filter((c) => {
    const matchesSearch =
      search === '' ||
      c.domain.toLowerCase().includes(search.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.researchStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Companies</h1>
          <p>
            {data ? `${data.companies.length} tracked ${data.companies.length === 1 ? 'company' : 'companies'}` : 'Loading...'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setAddError(null);
            setIsAddOpen(true);
          }}
        >
          <span style={{ fontSize: 16 }}>+</span> Add Company
        </button>
      </div>

      {/* ─── Filters & Search ─── */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 260px', maxWidth: 400 }}>
          <input
            type="text"
            className="input"
            placeholder="Search company, domain, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 14px', fontSize: 13, width: '100%' }}
          />
        </div>

        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {['all', 'completed', 'in_progress', 'pending', 'failed'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(st)}
              style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Loading State ─── */}
      {isLoading && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      )}

      {/* ─── Empty State ─── */}
      {data && data.companies.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <h3>No companies yet</h3>
          <p>Add a company website URL to start building intelligence automatically.</p>
          <button className="btn btn-primary mt-4" onClick={() => setIsAddOpen(true)}>
            Add Your First Company
          </button>
        </div>
      )}

      {/* ─── Filtered Empty State ─── */}
      {data && data.companies.length > 0 && filteredCompanies.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No matching companies</h3>
          <p>Try adjusting your search query or status filter.</p>
        </div>
      )}

      {/* ─── Company Rows ─── */}
      {filteredCompanies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                minWidth: 0,
              }}
              onClick={() => navigate(`/companies/${company.id}`)}
            >
              {/* Left Column: Logo + Info */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden' }}>
                <CompanyLogo domain={company.domain} name={company.name} size={42} />
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      {company.name || company.domain}
                    </span>
                  {company.industry && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(129, 140, 248, 0.1)',
                        color: 'var(--accent-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {company.industry}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {company.domain} ↗
                  </a>
                  {company.lastResearchedAt && (
                    <span>
                      {' '}· Researched {new Date(company.lastResearchedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {company.summary && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                    }}
                  >
                    {company.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Status & Actions */}
              <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                {statusBadge(company.researchStatus)}

                {/* Re-run Research */}
                <button
                  className="btn-icon"
                  title="Re-run research"
                  onClick={(e) => handleReResearch(e, company.id)}
                  disabled={company.researchStatus === 'in_progress'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </button>

                {/* Edit Details */}
                <button
                  className="btn-icon"
                  title="Edit company"
                  onClick={(e) => openEditModal(e, company)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  className="btn-icon"
                  title="Delete company"
                  style={{ color: 'var(--accent-danger)' }}
                  onClick={(e) => openDeleteModal(e, company)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add Company Modal (Create) ─── */}
      {isAddOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Add Company</h3>
              <button className="btn-icon" onClick={() => setIsAddOpen(false)}>✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newUrl.trim()) addMutation.mutate(newUrl.trim());
              }}
            >
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Company Website URL or Domain
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. stripe.com or https://segment.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    autoFocus
                  />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    SignalDesk will discover company pages, extract intelligence, and score opportunity.
                  </p>
                </div>
                {addError && (
                  <div style={{ padding: '8px 12px', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                    {addError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addMutation.isPending || !newUrl.trim()}>
                  {addMutation.isPending ? 'Ingesting...' : 'Start Research'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Company Modal (Update) ─── */}
      {editingCompany && (
        <div className="modal-backdrop" onClick={() => setEditingCompany(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Edit Company Details</h3>
              <button className="btn-icon" onClick={() => setEditingCompany(null)}>✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editingCompany.id,
                  data: {
                    name: editName.trim() || null,
                    industry: editIndustry.trim() || null,
                    summary: editSummary.trim() || null,
                  },
                });
              }}
            >
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Stripe, Inc."
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Industry
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Financial Technology / Payments"
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Summary / Notes
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Brief description or business development notes..."
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCompany(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal (Delete) ─── */}
      {deletingCompany && (
        <div className="modal-backdrop" onClick={() => setDeletingCompany(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-danger)' }}>
                Delete Company
              </h3>
              <button className="btn-icon" onClick={() => setDeletingCompany(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{deletingCompany.name || deletingCompany.domain}</strong>?
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This will permanently remove the company, all associated research evidence, intelligence, signals, opportunity scores, and outreach drafts.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingCompany(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingCompany.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
