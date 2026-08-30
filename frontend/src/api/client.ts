const BASE_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '';

export class ApiError extends Error {
  statusCode: number;
  field?: string;
  fieldMessage?: string;

  constructor(statusCode: number, message: string, field?: string, fieldMessage?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.field = field;
    this.fieldMessage = fieldMessage;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (body['message'] as string | undefined) ?? `HTTP ${res.status}`,
      body['field'] as string | undefined,
      body['fieldMessage'] as string | undefined,
    );
  }

  return body as T;
}

export interface DashboardService {
  id: string;
  name: string;
  description: string | null;
  team: string | null;
  computedStatus: 'healthy' | 'degraded' | 'unhealthy' | 'Unknown';
  lastReportAt: string | null;
  incidentCount: number;
  createdAt: string;
}

export interface DashboardResponse {
  services: DashboardService[];
}

export interface RegisterServiceBody {
  name: string;
  description?: string;
  team?: string;
}

export interface RegisterServiceResponse {
  id: string;
  name: string;
  description: string | null;
  team: string | null;
  token: string;
  createdAt: string;
}

export interface CreateIncidentBody {
  serviceId: string;
  title: string;
  severity?: string;
}

export interface TransitionIncidentBody {
  status: string;
}

export function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/api/dashboard');
}

export function registerService(body: RegisterServiceBody): Promise<RegisterServiceResponse> {
  return request<RegisterServiceResponse>('/api/services', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteService(id: string): Promise<void> {
  return request<void>(`/api/services/${id}`, { method: 'DELETE' });
}

export function createIncident(body: CreateIncidentBody): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transitionIncident(
  id: string,
  body: TransitionIncidentBody,
): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/api/incidents/${id}/transition`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
