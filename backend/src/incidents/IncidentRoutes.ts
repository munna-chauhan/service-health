import type { FastifyInstance } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';

const VALID_SEVERITIES = ['minor', 'major', 'critical'];
const VALID_TARGET_STATES = ['Investigating', 'Resolved'];

function isDatabaseError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code.startsWith('P1')) {
    return true;
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

export async function incidentRoutes(
  fastify: FastifyInstance,
  opts: { prisma: PrismaClient },
): Promise<void> {
  const { prisma } = opts;

  fastify.post<{
    Body: { title?: string; severity?: string; serviceId?: string; description?: string };
  }>('/api/incidents', async (request, reply) => {
    const { title, severity, serviceId, description } = request.body ?? {};
    const errors: Array<{ field: string; message: string }> = [];

    const trimmedTitle = (title as string | undefined ?? '').trim();
    if (!trimmedTitle) {
      errors.push({ field: 'title', message: 'Title is required' });
    }
    if (!severity) {
      errors.push({ field: 'severity', message: 'Severity is required' });
    } else if (!VALID_SEVERITIES.includes(severity as string)) {
      errors.push({ field: 'severity', message: 'Severity must be minor, major, or critical' });
    }
    if (!serviceId) {
      errors.push({ field: 'serviceId', message: 'ServiceId is required' });
    }

    if (errors.length > 0) {
      return reply.status(422).send({ statusCode: 422, message: 'Validation failed', fields: errors });
    }

    try {
      const service = await prisma.service.findFirst({
        where: { id: serviceId as string, deletedAt: null },
      });
      if (!service) {
        return reply.status(404).send({ statusCode: 404, message: 'Service not found' });
      }

      const incident = await prisma.incident.create({
        data: {
          title: trimmedTitle,
          severity: severity as string,
          serviceId: serviceId as string,
          description: (description as string | undefined) ?? null,
          state: 'Open',
          version: 1,
        },
      });
      return reply.status(201).send({
        id: incident.id,
        serviceId: incident.serviceId,
        title: incident.title,
        severity: incident.severity,
        state: incident.state,
        version: incident.version,
        createdAt: incident.createdAt,
      });
    } catch (err) {
      if (isDatabaseError(err)) {
        return reply.status(503).send({ statusCode: 503, message: 'Service temporarily unavailable' });
      }
      throw err;
    }
  });

  fastify.get<{ Querystring: { serviceId?: string } }>(
    '/api/incidents',
    async (request, reply) => {
      try {
        const where = request.query.serviceId
          ? { serviceId: request.query.serviceId }
          : {};
        const incidents = await prisma.incident.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
        return reply.status(200).send({ incidents });
      } catch (err) {
        if (isDatabaseError(err)) {
          return reply.status(503).send({ statusCode: 503, message: 'Service temporarily unavailable' });
        }
        throw err;
      }
    },
  );

  fastify.get<{ Params: { id: string } }>(
    '/api/incidents/:id',
    async (request, reply) => {
      try {
        const incident = await prisma.incident.findUnique({
          where: { id: request.params.id },
        });
        if (!incident) {
          return reply.status(404).send({ statusCode: 404, message: 'Incident not found' });
        }
        return reply.status(200).send(incident);
      } catch (err) {
        if (isDatabaseError(err)) {
          return reply.status(503).send({ statusCode: 503, message: 'Service temporarily unavailable' });
        }
        throw err;
      }
    },
  );

  fastify.post<{
    Params: { id: string };
    Body: { targetState?: string; version?: number };
  }>('/api/incidents/:id/transition', async (request, reply) => {
    const { targetState, version } = request.body ?? {};

    if (!targetState || !VALID_TARGET_STATES.includes(targetState as string)) {
      return reply.status(400).send({
        statusCode: 400,
        message: 'targetState must be Investigating or Resolved',
        field: 'targetState',
      });
    }
    if (version === undefined || typeof version !== 'number') {
      return reply.status(400).send({
        statusCode: 400,
        message: 'version is required',
        field: 'version',
      });
    }

    try {
      const current = await prisma.incident.findUnique({ where: { id: request.params.id } });
      if (!current) {
        return reply.status(404).send({ statusCode: 404, message: 'Incident not found' });
      }

      if (current.state === 'Resolved') {
        return reply.status(409).send({
          statusCode: 409,
          message: 'Incident is in a terminal state',
        });
      }

      if ((targetState as string) === current.state) {
        return reply.status(200).send(current);
      }

      let affected: number;
      if ((targetState as string) === 'Investigating') {
        affected = await prisma.$executeRaw`
          UPDATE incidents
          SET state = ${targetState}, version = version + 1, investigating_at = NOW()
          WHERE id = ${request.params.id}::uuid AND version = ${version}
        `;
      } else {
        affected = await prisma.$executeRaw`
          UPDATE incidents
          SET state = ${targetState}, version = version + 1, resolved_at = NOW()
          WHERE id = ${request.params.id}::uuid AND version = ${version}
        `;
      }

      if (affected === 0) {
        const reread = await prisma.incident.findUnique({ where: { id: request.params.id } });
        return reply.status(409).send({
          statusCode: 409,
          message: 'Stale version',
          currentVersion: reread?.version,
        });
      }

      const updated = await prisma.incident.findUnique({ where: { id: request.params.id } });
      return reply.status(200).send(updated);
    } catch (err) {
      if (isDatabaseError(err)) {
        return reply.status(503).send({ statusCode: 503, message: 'Service temporarily unavailable' });
      }
      throw err;
    }
  });
}
