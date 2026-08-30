import React from 'react';
import type { DashboardService } from '../api/client';
import StatusBadge from './StatusBadge';

interface ServiceRowProps {
  service: DashboardService;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

export default function ServiceRow({ service }: ServiceRowProps): React.ReactElement {
  return (
    <tr>
      <td style={{ padding: '8px 12px' }}>{service.name}</td>
      <td style={{ padding: '8px 12px' }}>
        <StatusBadge status={service.computedStatus} />
      </td>
      <td style={{ padding: '8px 12px' }}>{service.incidentCount}</td>
      <td style={{ padding: '8px 12px' }}>{formatDate(service.lastReportAt)}</td>
    </tr>
  );
}
