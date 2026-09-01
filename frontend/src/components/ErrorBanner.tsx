import React from 'react';

interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps): React.ReactElement {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: 'var(--color-danger-bg)',
        color: 'var(--color-danger)',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '1rem',
      }}
    >
      {message}
    </div>
  );
}
