import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../api/client';
import type { DashboardService } from '../api/client';

const POLL_INTERVAL_MS = 30_000;

interface UseDashboardResult {
  services: DashboardService[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardResult {
  const [services, setServices] = useState<DashboardService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await getDashboard();
      setServices(data.services);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
    const interval = setInterval(() => { void fetch(); }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetch]);

  return { services, loading, error, refresh: fetch };
}
