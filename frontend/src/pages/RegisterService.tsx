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
        <h1>Service Registered</h1>
        <p>
          <strong>{registeredService.name}</strong> was registered successfully.
        </p>
        <div
          style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '1rem',
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#92400e' }}>
            Bearer Token — copy it now, it will not be shown again
          </p>
          <code
            style={{
              display: 'block',
              wordBreak: 'break-all',
              background: '#fffbeb',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            {registeredService.token}
          </code>
          <button
            onClick={() => { void handleCopy(); }}
            style={{ marginTop: '8px', padding: '6px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {copied ? 'Copied!' : 'Copy Token'}
          </button>
        </div>
        <button
          onClick={() => {
            setRegisteredService(null);
            setForm({ name: '', description: '', team: '' });
          }}
          style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Register Another
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Register Service</h1>
      {generalError && <ErrorBanner message={generalError} />}
      <form onSubmit={(e) => { void handleSubmit(e); }} style={{ maxWidth: '480px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: fieldErrors.name ? '1px solid #ef4444' : '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.name && (
            <p style={{ color: '#ef4444', margin: '4px 0 0', fontSize: '0.875rem' }}>{fieldErrors.name}</p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="team" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Team
          </label>
          <input
            id="team"
            name="team"
            value={form.team}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '8px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
}
