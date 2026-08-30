import { PrismaClient, Prisma } from '@prisma/client';
import type { IngestionAdapter } from '../ingestion/IngestionAdapter';

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

  async report(
    serviceId: string,
    status: string,
    idempotencyKey: string,
  ): Promise<{ accepted: boolean; idempotent: boolean }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const idem = await tx.$executeRaw`
        INSERT INTO idempotency_keys (id, service_id, key, ack_body, created_at)
        VALUES (gen_random_uuid(), ${serviceId}::uuid, ${idempotencyKey}, '{"accepted":true,"idempotent":false}'::jsonb, NOW())
        ON CONFLICT (service_id, key) DO NOTHING
      `;
      if (idem === 0) {
        const existing = await tx.idempotencyKey.findUnique({
          where: { serviceId_key: { serviceId, key: idempotencyKey } },
        });
        return { idempotent: true, ackBody: existing!.ackBody };
      }
      await tx.healthEvent.create({
        data: { serviceId, status, reportedAt: new Date() },
      });
      await tx.service.update({
        where: { id: serviceId },
        data: { currentStatus: status, lastReportAt: new Date() },
      });
      return { idempotent: false, ackBody: { accepted: true, idempotent: false } };
    });
    return { accepted: true, idempotent: result.idempotent };
  }
}
