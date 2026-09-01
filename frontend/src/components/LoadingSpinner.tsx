import React from 'react';

export default function LoadingSpinner(): React.ReactElement {
  return (
    <div role="status" aria-label="Loading" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      Loading…
    </div>
  );
}
