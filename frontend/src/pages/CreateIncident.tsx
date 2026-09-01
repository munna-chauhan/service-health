import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createIncident, ApiError } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';

interface FormState {
  title: string;
  severity: string;
}

interface FieldErrors {
  title?: string;
  severity?: string;
  serviceId?: string;
}

export default function CreateIncident(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId') ?? '';

  const [form, setForm] = useState<FormState>({ title: '', severity: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const localErrors: FieldErrors = {};
    if (!form.title.trim()) localErrors.title = 'Title is required';
    if (!form.severity) localErrors.severity = 'Severity is required';
    if (!serviceId) localErrors.serviceId = 'ServiceId is required';

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createIncident({ serviceId, title: form.title.trim(), severity: form.severity });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 422 && err.errors && err.errors.length > 0) {
        const mapped: FieldErrors = {};
        for (const e of err.errors) {
          mapped[e.field as keyof FieldErrors] = e.message;
        }
        setFieldErrors(mapped);
      } else {
        setGeneralError(err instanceof Error ? err.message : 'Failed to create incident');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Create Incident</h1>
      {generalError && <ErrorBanner message={generalError} />}
      <form onSubmit={(e) => { void handleSubmit(e); }} style={{ maxWidth: '480px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: fieldErrors.title ? '1px solid #ef4444' : '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.title && (
            <p style={{ color: '#ef4444', margin: '4px 0 0', fontSize: '0.875rem' }}>{fieldErrors.title}</p>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="severity" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Severity <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="severity"
            name="severity"
            value={form.severity}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: fieldErrors.severity ? '1px solid #ef4444' : '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Select severity</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
          {fieldErrors.severity && (
            <p style={{ color: '#ef4444', margin: '4px 0 0', fontSize: '0.875rem' }}>{fieldErrors.severity}</p>
          )}
        </div>

        {fieldErrors.serviceId && (
          <p style={{ color: '#ef4444', margin: '0 0 1rem', fontSize: '0.875rem' }}>{fieldErrors.serviceId}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '8px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          {submitting ? 'Creating…' : 'Create Incident'}
        </button>
      </form>
    </div>
  );
}
