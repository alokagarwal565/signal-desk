import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Get current breadcrumb label based on route
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Today\'s Opportunities';
    if (path === '/companies') return 'Company Directory';
    if (path === '/add') return 'Add Target Company';
    if (path.startsWith('/companies/')) return 'Company Intelligence';
    return 'Console';
  };

  const userInitials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="app-layout">
      {/* Functional Layer: macOS-style Liquid Glass Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">SD</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">SignalDesk</span>
            <span className="sidebar-brand-badge">Intelligence</span>
          </div>
        </div>

        <div className="sidebar-section-title">Workspace</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Dashboard
          </NavLink>

          <NavLink to="/companies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-3" />
              <line x1="9" y1="9" x2="9" y2="9.01" />
              <line x1="9" y1="13" x2="9" y2="13.01" />
              <line x1="9" y1="17" x2="9" y2="17.01" />
            </svg>
            Companies
          </NavLink>
        </nav>

        <div className="sidebar-section-title">Discovery</div>
        <nav className="sidebar-nav">
          <NavLink to="/add" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Company
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{userInitials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || user?.email || 'Operator'}</span>
              <span className="user-role">Research Analyst</span>
            </div>
          </div>
          <button
            className="sidebar-link"
            onClick={logout}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', color: 'var(--text-tertiary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Window */}
      <main className="main-content">
        {/* Functional Layer: Top Command Bar */}
        <header className="top-command-bar">
          <div className="top-breadcrumb">
            <span>SignalDesk</span>
            <span>/</span>
            <span className="top-breadcrumb-current">{getBreadcrumbTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="engine-status-badge">
              <span className="status-dot-pulse" />
              <span>AI Engine Live</span>
            </div>

            {location.pathname !== '/add' && (
              <Link to="/add" className="btn btn-primary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Track Company
              </Link>
            )}
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
