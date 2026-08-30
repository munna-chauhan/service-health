import React from 'react';
import type { DashboardService } from '../api/client';

type Status = DashboardService['computedStatus'];

const STATUS_COLORS: Record<Status, { background: string; color: string }> = {
  healthy: { background: '#d1fae5', color: '#065f46' },
  degraded: { background: '#fef3c7', color: '#92400e' },
  unhealthy: { background: '#fee2e2', color: '#991b1b' },
  Unknown: { background: '#f3f4f6', color: '#6b7280' },
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
