import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.08), transparent 70%), var(--bg-primary)',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
            }}
          >
            SD
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 6 }}>
            SignalDesk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
            Automated company intelligence & timing-driven opportunity ranking
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card"
          style={{
            padding: 32,
            boxShadow: 'var(--shadow-glass)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {isRegistering ? 'Create Analyst Account' : 'Operator Sign In'}
            </h2>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Terminal
            </span>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {isRegistering && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Work Email
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@signaldesk.internal"
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', height: 38, fontSize: 14 }}
          >
            {loading ? <span className="spinner" /> : isRegistering ? 'Create Account' : 'Authenticate Console'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-secondary)' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an operator account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-accent)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {isRegistering ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
