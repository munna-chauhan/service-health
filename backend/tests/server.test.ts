import crypto from 'node:crypto';
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

  it('POST /api/health with missing Authorization header returns 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/health',
      payload: { status: 'healthy' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/health with valid token but missing Idempotency-Key header returns 400', async () => {
    const rawToken = 'valid-test-token-12345';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    mockPrisma.service.findFirst.mockResolvedValueOnce({ id: 'svc-test-id', tokenHash });

    const res = await app.inject({
      method: 'POST',
      url: '/api/health',
      headers: { authorization: `Bearer ${rawToken}` },
      payload: { status: 'healthy' },
    });
    expect(res.statusCode).toBe(400);
  });
});
