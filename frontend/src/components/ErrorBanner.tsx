import React from 'react';

interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps): React.ReactElement {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '1rem',
      }}
    >
      {message}
    </div>
  );
}
