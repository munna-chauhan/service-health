import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, deleteService } from '../api/client';
import type { DashboardService } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function ServiceRegistry(): React.ReactElement {
  const [services, setServices] = useState<DashboardService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadServices();
  }, []);

  async function loadServices(): Promise<void> {
    try {
      setLoading(true);
      const data = await getDashboard();
      setServices(data.services);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('Delete this service?')) return;
    setDeletingId(id);
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="page__header">
        <h1 className="page__title">Services</h1>
        <Link to="/register" className="button button--primary">+ Register Service</Link>
      </div>
      {error && <ErrorBanner message={error} />}
      <ul className="service-list">
        {services.length === 0 ? (
          <li className="empty-state">No services yet. <Link to="/register" className="text-link">Register one.</Link></li>
        ) : (
          services.map((service) => (
            <li key={service.id} className="service-list__row">
              <span className="service-list__cell">{service.name}</span>
              <span className="service-list__cell">{service.team ?? '—'}</span>
              <span className="service-list__cell"><StatusBadge status={service.computedStatus} /></span>
              <button type="button" className="button button--danger" onClick={() => { void handleDelete(service.id); }} disabled={deletingId === service.id}>
                {deletingId === service.id ? 'Deleting…' : 'Delete'}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
