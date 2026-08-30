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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Services</h1>
        <Link to="/register" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}>
          + Register Service
        </Link>
      </div>
      {error && <ErrorBanner message={error} />}
      {services.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No services yet. <Link to="/register">Register one.</Link></p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Name</th>
              <th style={{ padding: '8px 12px' }}>Team</th>
              <th style={{ padding: '8px 12px' }}>Status</th>
              <th style={{ padding: '8px 12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px' }}>{service.name}</td>
                <td style={{ padding: '8px 12px' }}>{service.team ?? '—'}</td>
                <td style={{ padding: '8px 12px' }}>
                  <StatusBadge status={service.computedStatus} />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <button
                    onClick={() => { void handleDelete(service.id); }}
                    disabled={deletingId === service.id}
                    style={{ padding: '4px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {deletingId === service.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
