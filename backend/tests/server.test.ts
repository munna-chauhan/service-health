import { buildApp } from '../src/server';

const mockPrisma = {
  service: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  incident: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  idempotencyKey: {
    findUnique: jest.fn(),
  },
  healthEvent: {
    create: jest.fn(),
  },
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([]),
  $transaction: jest.fn(),
  $disconnect: jest.fn().mockResolvedValue(undefined),
} as any;

describe('server', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp(mockPrisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/dashboard returns 200 with services array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/dashboard' });
    expect(res.statusCode).toBe(200);
    const body = res.json<{ services: unknown[] }>();
    expect(Array.isArray(body.services)).toBe(true);
  });

  it('GET /api/services returns 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/services' });
    expect(res.statusCode).toBe(200);
  });
});
