import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function Dashboard(): React.ReactElement {
  const { services, loading, error } = useDashboard();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div>
        <h1 className="page__title">Dashboard</h1>
        <ErrorBanner message={error} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page__title">Dashboard</h1>
      {/* Grid of service-card items */}
      <ul className="service-grid">
        {services.length === 0 ? (
          <li className="empty-state">No services registered yet.</li>
        ) : (
          services.map((service) => <ServiceCard key={service.id} service={service} />)
        )}
      </ul>
    </div>
  );
}
