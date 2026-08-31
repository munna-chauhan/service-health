import type { FastifyInstance } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';

function isDatabaseError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code.startsWith('P1')) {
    return true;
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

export async function dashboardRoutes(
  fastify: FastifyInstance,
  opts: { prisma: PrismaClient },
): Promise<void> {
  const { prisma } = opts;

  fastify.get('/api/dashboard', async (_request, reply) => {
    const threshold = parseInt(process.env.HEALTH_STALE_THRESHOLD_SECONDS ?? '180', 10) * 1000;
    const staleThresholdMs = Number.isNaN(threshold) ? 180 * 1000 : threshold;

    try {
      const services = await prisma.service.findMany({
        where: { deletedAt: null },
        include: {
          _count: {
            select: {
              incidents: { where: { state: { not: 'Resolved' } } },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      const rows = services.map((svc) => {
        const computedStatus =
          !svc.lastReportAt || Date.now() - svc.lastReportAt.getTime() > staleThresholdMs
            ? 'Unknown'
            : (svc.currentStatus ?? 'Unknown');
        return {
          id: svc.id,
          name: svc.name,
          lastReportAt: svc.lastReportAt,
          status: computedStatus,
          computedStatus,
          nonResolvedIncidentCount: svc._count.incidents,
        };
      });

      return reply.status(200).send({ services: rows });
    } catch (err) {
      if (isDatabaseError(err)) {
        return reply.status(503).send({ statusCode: 503, message: 'Service temporarily unavailable' });
      }
      throw err;
    }
  });
}
