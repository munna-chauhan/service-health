import React, { useState } from 'react';
import { registerService, ApiError } from '../api/client';
import type { RegisterServiceResponse } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';

interface FormState {
  name: string;
  description: string;
  team: string;
}

interface FieldErrors {
  name?: string;
  description?: string;
  team?: string;
}

export default function RegisterService(): React.ReactElement {
  const [form, setForm] = useState<FormState>({ name: '', description: '', team: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredService, setRegisteredService] = useState<RegisterServiceResponse | null>(null);
  const [copied, setCopied] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!form.name.trim()) {
      setFieldErrors({ name: 'Name is required' });
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerService({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        team: form.team.trim() || undefined,
      });
      setRegisteredService(result);
    } catch (err) {
      if (err instanceof ApiError && err.field) {
        setFieldErrors({ [err.field]: err.fieldMessage ?? err.message });
      } else {
        setGeneralError(err instanceof Error ? err.message : 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (!registeredService) return;
    await navigator.clipboard.writeText(registeredService.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (registeredService) {
    return (
      <div>
        <h1 className="page__title">Service Registered</h1>
        <p>
          <strong>{registeredService.name}</strong> was registered successfully.
        </p>
        <div className="token-panel">
          <p className="token-panel__notice">
            Bearer Token — copy it now, it will not be shown again
          </p>
          <code className="token-panel__value">
            {registeredService.token}
          </code>
          <button
            type="button"
            onClick={() => { void handleCopy(); }}
            className="button button--warning"
          >
            {copied ? 'Copied!' : 'Copy Token'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setRegisteredService(null);
            setForm({ name: '', description: '', team: '' });
          }}
          className="button button--neutral"
        >
          Register Another
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page__title">Register Service</h1>
      {generalError && <ErrorBanner message={generalError} />}
      <form onSubmit={(e) => { void handleSubmit(e); }} className="form">
        <div className="form__field">
          <label htmlFor="name" data-for="name" className="form__label">
            Name *
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`form__control${fieldErrors.name ? ' form__control--error' : ''}`}
          />
          {fieldErrors.name && (
            <p className="form__error">{fieldErrors.name}</p>
          )}
        </div>

        <div className="form__field">
          <label htmlFor="description" className="form__label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="form__control"
          />
        </div>

        <div className="form__field">
          <label htmlFor="team" data-for="team" className="form__label">
            Team
          </label>
          <input
            id="team"
            name="team"
            value={form.team}
            onChange={handleChange}
            className="form__control"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="button button--primary"
        >
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
}
