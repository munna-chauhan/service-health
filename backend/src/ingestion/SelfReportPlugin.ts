import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';
import type { IngestionAdapter } from './IngestionAdapter';

const AUTH_ERROR = { statusCode: 401, message: 'Unauthorized' };

const VALID_STATUSES = ['healthy', 'degraded', 'unhealthy'];

function isDatabaseError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code.startsWith('P1')) {
    return true;
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

export async function selfReportPlugin(
  fastify: FastifyInstance,
  opts: { prisma: PrismaClient; adapter: IngestionAdapter },
): Promise<void> {
  const { prisma, adapter } = opts;

  fastify.post<{
    Body: { status: string; message?: string };
    Headers: { authorization?: string; 'idempotency-key'?: string };
  }>('/api/health', async (request, reply) => {
    const authHeader = request.headers['authorization'] ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send(AUTH_ERROR);
    }
    const rawToken = authHeader.slice(7);
    if (!rawToken) {
      return reply.status(401).send(AUTH_ERROR);
    }

    const presentedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const serviceRow = await prisma.service.findFirst({
      where: { tokenHash: presentedHash, deletedAt: null },
      select: { id: true, tokenHash: true },
    });

    if (!serviceRow) {
      return reply.status(401).send(AUTH_ERROR);
    }

    const storedBuf = Buffer.from(serviceRow.tokenHash);
    const presentedBuf = Buffer.from(presentedHash);
    if (storedBuf.length !== presentedBuf.length || !crypto.timingSafeEqual(storedBuf, presentedBuf)) {
      return reply.status(401).send(AUTH_ERROR);
    }

    const body = request.body ?? {};
    const status = (body as Record<string, unknown>)['status'] as string | undefined;

    if (!status || !VALID_STATUSES.includes(status)) {
      return reply.status(422).send({
        statusCode: 422,
        message: 'Validation failed',
        field: 'status',
        fieldMessage: 'Invalid status value',
      });
    }

    const idempotencyKey = request.headers['idempotency-key'];
    if (!idempotencyKey) {
      return reply.status(400).send({
        statusCode: 400,
        message: 'Idempotency-Key header is required',
      });
    }

    try {
      const result = await adapter.report(serviceRow.id, status, idempotencyKey);
      return reply.status(200).send({ accepted: true, idempotent: result.idempotent });
    } catch (err) {
      if (isDatabaseError(err)) {
        return reply.status(503).send({ statusCode: 503, message: 'Service temporarily unavailable' });
      }
      throw err;
    }
  });
}
