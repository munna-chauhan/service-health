import React from 'react';
import type { DashboardService } from '../api/client';
import StatusBadge from './StatusBadge';

interface ServiceCardProps {
  service: DashboardService;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

export default function ServiceCard({ service }: ServiceCardProps): React.ReactElement {
  return (
    <li className="service-card" data-testid="service-card">
      <div className="service-card__header">
        <h2 className="service-card__name">{service.name}</h2>
        <StatusBadge status={service.computedStatus} />
      </div>
      <dl className="service-card__meta">
        <div>
          <dt className="service-card__label">Open incidents</dt>
          <dd className="service-card__value" data-field="incident-count">
            {service.nonResolvedIncidentCount}
          </dd>
        </div>
        <div>
          <dt className="service-card__label">Last report</dt>
          <dd className="service-card__value" data-field="last-report">
            {formatDate(service.lastReportAt)}
          </dd>
        </div>
      </dl>
    </li>
  );
}
