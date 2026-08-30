/**
 * Contract for all health-event ingestion sources.
 *
 * Implement this interface in a file outside backend/src/health-status/ to add a
 * new health source without modifying any file inside the health-status domain directory.
 */
export interface IngestionAdapter {
  /**
   * Delivers a service health report to the persistence layer.
   * @param serviceId UUID of the authenticated service
   * @param status One of: healthy, degraded, unhealthy
   * @param idempotencyKey Caller-provided deduplication key
   * @returns Resolves with the acknowledgement when the report is persisted
   */
  report(
    serviceId: string,
    status: string,
    idempotencyKey: string,
  ): Promise<{ accepted: boolean; idempotent: boolean }>;
}
