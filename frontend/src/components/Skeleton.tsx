import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rounded' | 'squircle' | 'card';
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Base Apple HIG Skeleton Primitive
 * Applies subtle translucent material shimmer and respects prefers-reduced-motion.
 */
export function Skeleton({
  width,
  height,
  variant = 'text',
  style,
  className = '',
  ...props
}: SkeletonProps) {
  // ponytail: single flexible skeleton primitive with zero external dependencies
  const classes = ['skeleton', `skeleton-${variant}`, className].filter(Boolean).join(' ');
  return (
    <div
      className={classes}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Skeleton for the 4-card Executive Metrics Strip on the Dashboard
 */
export function MetricsGridSkeleton() {
  return (
    <div className="metrics-strip" aria-label="Loading executive metrics">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="metric-card">
          <Skeleton width="55%" height={12} style={{ marginBottom: 8 }} />
          <div className="metric-value-row">
            <Skeleton width="45%" height={28} variant="rounded" />
            <Skeleton width="30%" height={14} style={{ marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton matching an Apple HIG Opportunity Card
 */
export function OpportunityCardSkeleton() {
  return (
    <div className="card opportunity-card" style={{ opacity: 0.9 }}>
      {/* Header Row */}
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-3">
          <Skeleton width={26} height={20} variant="rounded" />
          <Skeleton width={38} height={38} variant="squircle" />
          <div>
            <Skeleton width={140} height={16} className="mb-1" />
            <Skeleton width={90} height={12} />
          </div>
        </div>
        <Skeleton width={52} height={34} variant="squircle" />
      </div>

      {/* Why Act Now Pill */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 16,
        }}
      >
        <Skeleton width="25%" height={11} className="mb-2" />
        <Skeleton width="90%" height={13} className="mb-1" />
        <Skeleton width="75%" height={13} />
      </div>

      {/* 3-Column Metadata Grid */}
      <div className="opportunity-grid mb-3">
        <div className="opportunity-col">
          <Skeleton width="40%" height={11} className="mb-2" />
          <Skeleton width="80%" height={14} className="mb-1" />
          <Skeleton width="60%" height={12} />
        </div>
        <div className="opportunity-col">
          <Skeleton width="40%" height={11} className="mb-2" />
          <Skeleton width="85%" height={14} className="mb-1" />
          <Skeleton width="55%" height={12} />
        </div>
        <div className="opportunity-col">
          <Skeleton width="40%" height={11} className="mb-2" />
          <Skeleton width="90%" height={14} className="mb-1" />
          <Skeleton width="65%" height={12} />
        </div>
      </div>

      {/* Action Bar */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 12 }}
      >
        <Skeleton width={130} height={28} variant="rounded" />
        <div className="flex items-center gap-2">
          <Skeleton width={30} height={30} variant="squircle" />
          <Skeleton width={30} height={30} variant="squircle" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full Dashboard Skeleton (Metrics + 3 Opportunity Cards)
 */
export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <MetricsGridSkeleton />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <OpportunityCardSkeleton />
        <OpportunityCardSkeleton />
        <OpportunityCardSkeleton />
      </div>
    </div>
  );
}

/**
 * Skeleton for a single company row in the directory
 */
export function CompanyRowSkeleton() {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Skeleton width={42} height={42} variant="squircle" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton width={130} height={16} />
            <Skeleton width={60} height={16} variant="rounded" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton width={90} height={12} />
            <Skeleton width={80} height={12} />
          </div>
          <Skeleton width="75%" height={12} />
        </div>
      </div>
      <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
        <Skeleton width={75} height={24} variant="rounded" />
        <Skeleton width={30} height={30} variant="squircle" />
        <Skeleton width={30} height={30} variant="squircle" />
        <Skeleton width={30} height={30} variant="squircle" />
      </div>
    </div>
  );
}

/**
 * Full Companies Directory Page Skeleton
 */
export function CompaniesDirectorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <CompanyRowSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for Company Detail Page (Header banner, tabs, and content cards)
 */
export function CompanyDetailSkeleton() {
  return (
    <div>
      {/* Header Banner */}
      <div className="page-header flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-4">
          <Skeleton width={54} height={54} variant="squircle" />
          <div>
            <div className="flex items-center gap-3">
              <Skeleton width={180} height={24} />
              <Skeleton width={70} height={20} variant="rounded" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Skeleton width={120} height={14} />
              <Skeleton width={90} height={14} />
            </div>
          </div>
        </div>
        <Skeleton width={140} height={36} variant="rounded" />
      </div>

      {/* Segmented Tabs Bar */}
      <div
        className="segmented-control"
        style={{ marginBottom: 24, padding: 3, maxWidth: 620 }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((t) => (
          <div key={t} style={{ flex: 1, padding: '6px 0' }}>
            <Skeleton width="70%" height={14} style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <Skeleton width="25%" height={16} className="mb-3" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <Skeleton width="40%" height={12} className="mb-1" />
              <Skeleton width="70%" height={15} />
            </div>
            <div>
              <Skeleton width="40%" height={12} className="mb-1" />
              <Skeleton width="60%" height={15} />
            </div>
          </div>
          <Skeleton width="100%" height={13} className="mb-2" />
          <Skeleton width="85%" height={13} />
        </div>

        <div className="card">
          <Skeleton width="30%" height={16} className="mb-3" />
          <Skeleton width="95%" height={14} className="mb-2" />
          <Skeleton width="90%" height={14} className="mb-2" />
          <Skeleton width="70%" height={14} />
        </div>
      </div>
    </div>
  );
}

/**
 * Generic Tab Content Skeleton for lazy sub-resource loading
 */
export function TabContentSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="card" style={{ padding: '16px 20px' }}>
          <div className="flex items-center justify-between mb-3">
            <Skeleton width="30%" height={15} />
            <Skeleton width="15%" height={14} variant="rounded" />
          </div>
          <Skeleton width="90%" height={13} className="mb-2" />
          <Skeleton width="70%" height={13} />
        </div>
      ))}
    </div>
  );
}
