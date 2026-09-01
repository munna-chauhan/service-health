import React from 'react';

interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps): React.ReactElement {
  return <div role="alert" className="error-banner">{message}</div>;
}
