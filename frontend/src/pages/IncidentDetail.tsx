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
        <h1>Incident</h1>
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!incident) {
    return (
      <div>
        <h1>Incident</h1>
        <p style={{ color: '#6b7280' }}>Incident not found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '0.25rem' }}>{incident.title}</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>Incident #{incident.id}</p>

      {conflictMessage && <ErrorBanner message={conflictMessage} />}

      <table style={{ borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <tbody>
          <tr>
            <th style={{ padding: '6px 16px 6px 0', textAlign: 'left', fontWeight: 600 }}>State</th>
            <td style={{ padding: '6px 0' }}>{incident.state}</td>
          </tr>
          <tr>
            <th style={{ padding: '6px 16px 6px 0', textAlign: 'left', fontWeight: 600 }}>Severity</th>
            <td style={{ padding: '6px 0' }}>{incident.severity}</td>
          </tr>
          <tr>
            <th style={{ padding: '6px 16px 6px 0', textAlign: 'left', fontWeight: 600 }}>Created</th>
            <td style={{ padding: '6px 0' }}>{formatDate(incident.createdAt)}</td>
          </tr>
          <tr>
            <th style={{ padding: '6px 16px 6px 0', textAlign: 'left', fontWeight: 600 }}>Investigating</th>
            <td style={{ padding: '6px 0' }}>{formatDate(incident.investigatingAt)}</td>
          </tr>
          <tr>
            <th style={{ padding: '6px 16px 6px 0', textAlign: 'left', fontWeight: 600 }}>Resolved</th>
            <td style={{ padding: '6px 0' }}>{formatDate(incident.resolvedAt)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {incident.state === 'Open' && (
          <button
            onClick={() => { void handleTransition('Investigating'); }}
            disabled={transitioning}
            style={{ padding: '8px 20px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            {transitioning ? 'Updating…' : 'Mark as Investigating'}
          </button>
        )}
        {incident.state === 'Investigating' && (
          <button
            onClick={() => { void handleTransition('Resolved'); }}
            disabled={transitioning}
            style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            {transitioning ? 'Updating…' : 'Mark as Resolved'}
          </button>
        )}
        <button
          onClick={() => { navigate('/'); }}
          style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
