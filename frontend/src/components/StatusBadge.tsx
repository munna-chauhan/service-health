import React from 'react';
import type { DashboardService } from '../api/client';

type Status = DashboardService['computedStatus'];

const STATUS_COLORS: Record<Status, { background: string; color: string }> = {
  healthy: { background: 'var(--color-status-healthy)', color: 'var(--color-text-on-accent)' },
  degraded: { background: 'var(--color-status-degraded)', color: 'var(--color-text-on-accent)' },
  unhealthy: { background: 'var(--color-status-unhealthy)', color: 'var(--color-text-on-accent)' },
  Unknown: { background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' },
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS['Unknown'];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: colors.background,
        color: colors.color,
      }}
    >
      {status}
    </span>
  );
}
