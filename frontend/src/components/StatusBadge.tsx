import React from 'react';
import type { DashboardService } from '../api/client';

type Status = DashboardService['computedStatus'];

const STATUS_CLASS: Record<Status, string> = {
  healthy: 'status-healthy',
  degraded: 'status-degraded',
  unhealthy: 'status-unhealthy',
  Unknown: 'status-unknown',
};

const STATUS_ICON: Record<Status, string> = {
  healthy:   '✓',
  degraded:  '⚠',
  unhealthy: '✕',
  Unknown:   '?',
};

interface StatusBadgeProps {
  status: Status;
  hero?: boolean;
}

export default function StatusBadge({ status, hero = false }: StatusBadgeProps): React.ReactElement {
  const variant = STATUS_CLASS[status] ?? STATUS_CLASS.Unknown;
  const icon    = STATUS_ICON[status]  ?? STATUS_ICON.Unknown;
  if (hero) {
    return (
      <span className={`status-badge ${variant} status-badge--hero`} data-status={status}>
        <span className="status-badge__icon" aria-hidden="true">{icon}</span>
        {status}
      </span>
    );
  }
  return (
    <span className={`status-badge ${variant}`} data-status={status}>
      {status}
    </span>
  );
}
