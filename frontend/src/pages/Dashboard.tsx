import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import ServiceCard from '../components/ServiceCard';
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
        <p style={{ color: 'var(--color-text-muted)' }}>No services registered yet.</p>
      ) : (
        <ul className="service-grid">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </ul>
      )}
    </div>
  );
}
