import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIncident, transitionIncident, ApiError } from '../api/client';
import type { Incident } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

export default function IncidentDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void loadIncident(id);
  }, [id]);

  async function loadIncident(incidentId: string): Promise<void> {
    try {
      setLoading(true);
      const data = await getIncident(incidentId);
      setIncident(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  }

  async function handleTransition(targetState: 'Investigating' | 'Resolved'): Promise<void> {
    if (!incident) return;
    setConflictMessage(null);
    setTransitioning(true);
    try {
      const updated = await transitionIncident(incident.id, {
        targetState,
        version: incident.version,
      }) as unknown as Incident;
      setIncident(updated);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setConflictMessage('This incident was updated by someone else. Please refresh and try again.');
        if (id) {
          void loadIncident(id);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Transition failed');
      }
    } finally {
      setTransitioning(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <h1 className="page__title">Incident</h1>
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!incident) {
    return (
      <div>
        <h1 className="page__title">Incident</h1>
        <p className="empty-state">Incident not found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page__title">{incident.title}</h1>
      <p className="page__subtitle">Incident #{incident.id}</p>

      {conflictMessage && <ErrorBanner message={conflictMessage} />}

      <dl className="detail-list">
        <dt className="detail-list__key">State</dt>
        <dd className="detail-list__value">{incident.state}</dd>
        <dt className="detail-list__key">Severity</dt>
        <dd className="detail-list__value">{incident.severity}</dd>
        <dt className="detail-list__key">Created</dt>
        <dd className="detail-list__value">{formatDate(incident.createdAt)}</dd>
        <dt className="detail-list__key">Investigating</dt>
        <dd className="detail-list__value">{formatDate(incident.investigatingAt)}</dd>
        <dt className="detail-list__key">Resolved</dt>
        <dd className="detail-list__value">{formatDate(incident.resolvedAt)}</dd>
      </dl>

      <div className="action-row">
        {incident.state === 'Open' && (
          <button
            type="button"
            onClick={() => { void handleTransition('Investigating'); }}
            disabled={transitioning}
            className="button button--warning"
          >
            {transitioning ? 'Updating…' : 'Mark as Investigating'}
          </button>
        )}
        {incident.state === 'Investigating' && (
          <button
            type="button"
            onClick={() => { void handleTransition('Resolved'); }}
            disabled={transitioning}
            className="button button--success"
          >
            {transitioning ? 'Updating…' : 'Mark as Resolved'}
          </button>
        )}
        <button
          type="button"
          onClick={() => { navigate('/'); }}
          className="button button--neutral"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
