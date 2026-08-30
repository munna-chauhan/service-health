import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import ServiceRow from '../components/ServiceRow';
import ErrorBanner from '../components/ErrorBanner';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard(): React.ReactElement {
  const { services, loading, error } = useDashboard();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <h1>Dashboard</h1>
        <ErrorBanner message={error} />
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {services.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No services registered yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Service</th>
              <th style={{ padding: '8px 12px' }}>Status</th>
              <th style={{ padding: '8px 12px' }}>Incidents</th>
              <th style={{ padding: '8px 12px' }}>Last Report</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
