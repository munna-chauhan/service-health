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
      <h1 className="page__title">Create Incident</h1>
      {generalError && <ErrorBanner message={generalError} />}
      <form onSubmit={(e) => { void handleSubmit(e); }} className="form">
        <div className="form__field">
          <label htmlFor="title" className="form__label">
            Title *
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`form__control${fieldErrors.title ? ' form__control--error' : ''}`}
          />
          {fieldErrors.title && (
            <p className="form__error">{fieldErrors.title}</p>
          )}
        </div>

        <div className="form__field">
          <label htmlFor="severity" className="form__label">
            Severity *
          </label>
          <select
            id="severity"
            name="severity"
            value={form.severity}
            onChange={handleChange}
            className={`form__control${fieldErrors.severity ? ' form__control--error' : ''}`}
          >
            <option value="">Select severity</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
          {fieldErrors.severity && (
            <p className="form__error">{fieldErrors.severity}</p>
          )}
        </div>

        {fieldErrors.serviceId && (
          <p className="form__error">{fieldErrors.serviceId}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="button button--primary"
        >
          {submitting ? 'Creating…' : 'Create Incident'}
        </button>
      </form>
    </div>
  );
}
