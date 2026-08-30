import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { HealthStatusDomain } from './health-status/HealthStatusDomain';
import { registryRoutes } from './registry/RegistryRoutes';
import { dashboardRoutes } from './dashboard/DashboardRoutes';
import { incidentRoutes } from './incidents/IncidentRoutes';
import { selfReportPlugin } from './ingestion/SelfReportPlugin';

export async function buildApp(prismaOverride?: PrismaClient): Promise<FastifyInstance> {
  const prisma = prismaOverride ?? new PrismaClient();
  const domain = new HealthStatusDomain(prisma);

  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      redact: ['req.headers.authorization'],
    },
  });

  await app.register(cors, { origin: process.env.CORS_ORIGIN ?? '*' });

  await app.register(registryRoutes, { prisma });
  await app.register(dashboardRoutes, { prisma });
  await app.register(incidentRoutes, { prisma });
  await app.register(selfReportPlugin, { prisma, adapter: domain });

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}

async function start(): Promise<void> {
  const app = await buildApp();

  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });

  await app.listen({
    port: parseInt(process.env.PORT ?? '3000', 10),
    host: '0.0.0.0',
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
