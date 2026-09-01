import React from 'react';
import type { DashboardService } from '../api/client';

type Status = DashboardService['computedStatus'];

const STATUS_CLASS: Record<Status, string> = {
  healthy: 'status-healthy',
  degraded: 'status-degraded',
  unhealthy: 'status-unhealthy',
  Unknown: 'status-unknown',
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const variant = STATUS_CLASS[status] ?? STATUS_CLASS.Unknown;
  return (
    <span className={`status-badge ${variant}`} data-status={status}>
      {status}
    </span>
  );
}
