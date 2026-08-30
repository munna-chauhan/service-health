import React from 'react';

export default function LoadingSpinner(): React.ReactElement {
  return (
    <div role="status" aria-label="Loading" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
      Loading…
    </div>
  );
}
