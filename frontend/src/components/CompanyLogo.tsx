import { useState } from 'react';

interface CompanyLogoProps {
  domain: string;
  name?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Generate consistent vibrant colors based on string
const GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #6366f1)',
];

function getGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index]!;
}

export function CompanyLogo({ domain, name, size = 40, className = '', style = {} }: CompanyLogoProps) {
  const [errorCount, setErrorCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Clean domain of protocols or paths
  const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0] || domain;

  // Source fallback priority:
  // 0: Google High-Res S2 Favicon
  // 1: DuckDuckGo Icons
  // 2: Monogram Fallback
  const src =
    errorCount === 0
      ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`
      : errorCount === 1
      ? `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`
      : null;

  const initials = (name || cleanDomain || 'C')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: Math.max(8, Math.round(size * 0.22)),
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    flexShrink: 0,
    ...style,
  };

  if (!src || errorCount >= 2) {
    return (
      <div
        className={`company-logo-fallback ${className}`}
        style={{
          ...containerStyle,
          background: getGradient(cleanDomain),
          color: '#ffffff',
          fontWeight: 700,
          fontSize: Math.round(size * 0.42),
          letterSpacing: '-0.02em',
          userSelect: 'none',
        }}
        title={name || domain}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`company-logo-container ${className}`} style={containerStyle} title={name || domain}>
      {/* Background Monogram while image loads */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: getGradient(cleanDomain),
            color: '#ffffff',
            fontWeight: 700,
            fontSize: Math.round(size * 0.42),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6,
          }}
        >
          {initials}
        </div>
      )}

      <img
        src={src}
        alt={name || domain}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setErrorCount((prev) => prev + 1);
        }}
        style={{
          width: '72%',
          height: '72%',
          objectFit: 'contain',
          borderRadius: 4,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
        }}
      />
    </div>
  );
}
