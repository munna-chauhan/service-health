import crypto from 'node:crypto';
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

export async function registryRoutes(
  fastify: FastifyInstance,
  opts: { prisma: PrismaClient },
): Promise<void> {
  const { prisma } = opts;

  fastify.post<{ Body: { name?: string; description?: string; team?: string } }>(
    '/api/services',
    async (request, reply) => {
      const name = ((request.body?.name as string) ?? '').trim();
      if (!name) {
        return reply.status(400).send({
          statusCode: 400,
          message: 'Validation failed',
          field: 'name',
          fieldMessage: 'Name is required',
        });
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      try {
        const service = await prisma.service.create({
          data: {
            name,
            description: (request.body?.description as string) ?? null,
            team: (request.body?.team as string) ?? null,
            tokenHash,
          },
        });
        return reply.status(201).send({
          id: service.id,
          name: service.name,
          description: service.description,
          team: service.team,
          token: rawToken,
          createdAt: service.createdAt,
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          return reply.status(409).send({
            statusCode: 409,
            message: 'Conflict',
            field: 'name',
            fieldMessage: 'A service with this name already exists',
          });
        }
        if (isDatabaseError(err)) {
          return reply.status(503).send({ statusCode: 503, message: 'Database unavailable.' });
        }
        throw err;
      }
    },
  );

  fastify.get('/api/services', async (_request, reply) => {
    try {
      const services = await prisma.service.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, description: true, team: true, createdAt: true },
      });
      return reply.status(200).send({ services });
    } catch (err) {
      if (isDatabaseError(err)) {
        return reply.status(503).send({ statusCode: 503, message: 'Database unavailable.' });
      }
      throw err;
    }
  });

  fastify.delete<{ Params: { id: string } }>(
    '/api/services/:id',
    async (request, reply) => {
      try {
        const affected = await prisma.$executeRaw`
          UPDATE services SET deleted_at = NOW()
          WHERE id = ${request.params.id}::uuid AND deleted_at IS NULL
        `;
        if (affected === 0) {
          return reply.status(404).send({ statusCode: 404, message: 'Service not found' });
        }
        return reply.status(204).send();
      } catch (err) {
        if (isDatabaseError(err)) {
          return reply.status(503).send({ statusCode: 503, message: 'Database unavailable.' });
        }
        throw err;
      }
    },
  );
}
