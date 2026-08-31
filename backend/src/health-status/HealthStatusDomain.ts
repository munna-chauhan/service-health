import { PrismaClient, Prisma } from '@prisma/client';
import type { IngestionAdapter, HealthEventInput, IngestionAck } from '../ingestion/IngestionAdapter';

function isDatabaseError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code.startsWith('P1')) {
    return true;
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

export { isDatabaseError };

export class HealthStatusDomain implements IngestionAdapter {
  constructor(private readonly prisma: PrismaClient) {}

  async ingest(event: HealthEventInput): Promise<IngestionAck> {
    const { serviceId, status, idempotencyKey, message } = event;

    if (!idempotencyKey) {
      const created = await this.prisma.$transaction(async (tx) => {
        const healthEvent = await tx.healthEvent.create({
          data: { serviceId, status, message: message ?? null, reportedAt: new Date() },
        });
        await tx.service.update({
          where: { id: serviceId },
          data: { currentStatus: status, lastReportAt: new Date() },
        });
        return healthEvent;
      });
      return { eventId: created.id, accepted: true, idempotent: false };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const idem = await tx.$executeRaw`
        INSERT INTO idempotency_keys (id, service_id, key, ack_body, created_at)
        VALUES (gen_random_uuid(), ${serviceId}::uuid, ${idempotencyKey}, '{"accepted":true,"idempotent":false}'::jsonb, NOW())
        ON CONFLICT (service_id, key) DO NOTHING
      `;
      if (idem === 0) {
        return { idempotent: true, eventId: '' };
      }
      const healthEvent = await tx.healthEvent.create({
        data: { serviceId, status, message: message ?? null, reportedAt: new Date() },
      });
      await tx.service.update({
        where: { id: serviceId },
        data: { currentStatus: status, lastReportAt: new Date() },
      });
      return { idempotent: false, eventId: healthEvent.id };
    });

    return { eventId: result.eventId, accepted: true, idempotent: result.idempotent };
  }
}
