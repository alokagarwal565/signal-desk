import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, type Company } from '../lib/api';
import { CompanyLogo } from '../components/CompanyLogo';

function statusBadge(status: string) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    completed: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: 'rgba(16, 185, 129, 0.25)' },
    partial: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.25)' },
    in_progress: { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.25)' },
    pending: { bg: 'rgba(161, 161, 170, 0.12)', text: '#a1a1aa', border: 'rgba(161, 161, 170, 0.25)' },
    failed: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.25)' },
  };

  const s = styles[status] || styles.pending!;
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
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {status === 'in_progress' ? (
        <span
          className="spinner"
          style={{ width: 10, height: 10, borderWidth: 1.5, borderColor: s.text, borderTopColor: 'transparent' }}
        />
      ) : status === 'completed' ? (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.text }} />
      ) : null}
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

  // Fetch companies with auto-poll if any are active
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
      <div className="page-header">
        <div>
          <h1>Monitored Companies</h1>
          <p>
            {data ? `${data.companies.length} tracked ${data.companies.length === 1 ? 'organization' : 'organizations'} with automated web & signal discovery.` : 'Loading directory...'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setAddError(null);
            setIsAddOpen(true);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Target
        </button>
      </div>

      {/* ─── Filters & Search Controls ─── */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 280px', maxWidth: 420, position: 'relative' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="input"
            placeholder="Search by company name, domain, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, height: 34, fontSize: 13 }}
          />
        </div>

        {/* Apple HIG Segmented Control */}
        <div className="segmented-control">
          {[
            { id: 'all', label: 'All' },
            { id: 'completed', label: 'Completed' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'pending', label: 'Pending' },
            { id: 'failed', label: 'Failed' },
          ].map((st) => (
            <button
              key={st.id}
              className={`segmented-button ${statusFilter === st.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Loading State ─── */}
      {isLoading && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 28, height: 28 }} />
          <p className="mt-3">Loading company directory...</p>
        </div>
      )}

      {/* ─── Empty State ─── */}
      {data && data.companies.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-3" />
            </svg>
          </div>
          <h3>No companies added yet</h3>
          <p>Add a company website domain to trigger our AI pipeline and generate rich dossiers.</p>
          <button className="btn btn-primary mt-4" onClick={() => setIsAddOpen(true)}>
            Add Your First Target
          </button>
        </div>
      )}

      {/* ─── Filtered Empty State ─── */}
      {data && data.companies.length > 0 && filteredCompanies.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3>No matching companies</h3>
          <p>No results found matching "{search}" with status "{statusFilter}".</p>
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
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                minWidth: 0,
              }}
              onClick={() => navigate(`/companies/${company.id}`)}
            >
              {/* Left Column: Logo + Info */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden' }}>
                <CompanyLogo domain={company.domain} name={company.name} size={42} />
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
                      {company.name || company.domain}
                    </span>
                    {company.industry && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          color: '#a5b4fc',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {company.industry}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{company.domain}</span>
                    {company.lastResearchedAt && (
                      <span>
                        {' '}· Updated {new Date(company.lastResearchedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {company.summary && (
                    <p
                      style={{
                        marginTop: 6,
                        fontSize: 12.5,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
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

              {/* Right Column: Status & macOS Actions */}
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                {statusBadge(company.researchStatus)}

                {/* Re-run Research */}
                <button
                  className="btn-icon"
                  title="Re-run AI research"
                  onClick={(e) => handleReResearch(e, company.id)}
                  disabled={company.researchStatus === 'in_progress'}
                  aria-label="Re-run research"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </button>

                {/* Edit Details */}
                <button
                  className="btn-icon"
                  title="Edit metadata"
                  onClick={(e) => openEditModal(e, company)}
                  aria-label="Edit company"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  className="btn-icon"
                  title="Remove target"
                  style={{ color: 'var(--accent-danger)' }}
                  onClick={(e) => openDeleteModal(e, company)}
                  aria-label="Delete company"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add Company Modal (Sheet) ─── */}
      {isAddOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Track New Company</h3>
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
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    Company Website Domain or URL
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. stripe.com or https://linear.app"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    autoFocus
                  />
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6, lineHeight: 1.5 }}>
                    SignalDesk will discover company pages, extract verified evidence, detect triggers, and score buying intent.
                  </p>
                </div>
                {addError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                    {addError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addMutation.isPending || !newUrl.trim()}>
                  {addMutation.isPending ? 'Ingesting Target...' : 'Start Intelligence Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Company Modal ─── */}
      {editingCompany && (
        <div className="modal-backdrop" onClick={() => setEditingCompany(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Edit Company Information</h3>
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
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
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
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    Industry / Sector
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
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    Intelligence Notes / Summary
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Executive description or strategic notes..."
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

      {/* ─── Delete Confirmation Modal ─── */}
      {deletingCompany && (
        <div className="modal-backdrop" onClick={() => setDeletingCompany(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-danger)' }}>
                Delete Target Company
              </h3>
              <button className="btn-icon" onClick={() => setDeletingCompany(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{deletingCompany.name || deletingCompany.domain}</strong>?
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                This action is irreversible. All crawled evidence sources, signals, opportunity scores, and tailored outreach drafts will be deleted.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingCompany(null)}>
                Keep Company
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingCompany.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
