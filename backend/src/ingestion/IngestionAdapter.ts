/**
 * Input shape for a health event submitted to an ingestion adapter.
 */
export interface HealthEventInput {
  /** UUID of the service reporting its health status. */
  serviceId: string;
  /** Status value: one of 'healthy', 'degraded', 'unhealthy'. */
  status: string;
  /** Optional caller-provided key for deduplication. */
  idempotencyKey?: string;
  /** Optional human-readable message accompanying the status. */
  message?: string;
}

/**
 * Acknowledgement returned by an ingestion adapter after persisting a health event.
 */
export interface IngestionAck {
  /** Unique identifier assigned to the persisted health event. */
  eventId: string;
  /** True when the event was accepted and persisted. */
  accepted: boolean;
  /** True when the request was a duplicate of a previously accepted event. */
  idempotent: boolean;
}

/**
 * Contract for all health-event ingestion sources.
 *
 * Implement this interface in a file outside backend/src/health-status/ to add a
 * new health source without modifying any file inside the health-status domain directory.
 */
export interface IngestionAdapter {
  /**
   * Delivers a service health report to the persistence layer.
   * @param event Health event input containing service ID, status, and optional metadata.
   * @returns Resolves with the acknowledgement when the report is persisted.
   */
  ingest(event: HealthEventInput): Promise<IngestionAck>;
}
