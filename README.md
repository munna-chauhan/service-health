# service-health

A service health monitoring platform. Register services, report health status, and track incidents through a single dashboard.

## Quick start

```bash
docker compose up
```

The stack is ready when `http://localhost` loads the dashboard. All three containers (database, backend, frontend) start in the correct order automatically — the backend waits for PostgreSQL to pass its healthcheck before running migrations.

## Registration walkthrough

1. Navigate to **Register Service** and submit a service name.
2. Copy the bearer token from the success screen — it is shown exactly once.
3. Submit a health report:

```bash
curl -X POST http://localhost:3000/api/health \
  -H "Authorization: Bearer <your-token>" \
  -H "Idempotency-Key: first-report" \
  -H "Content-Type: application/json" \
  -d '{ "status": "healthy" }'
```

4. Refresh the dashboard. The service row shows status **healthy** within 30 seconds.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `HEALTH_STALE_THRESHOLD_SECONDS` | `180` | Seconds of silence before a service status becomes Unknown |
| `VITE_API_URL` | `http://localhost:3000` | Backend URL baked into the frontend at build time |

## Notes

- The `changeme` database password in `docker-compose.yml` is a placeholder suitable only for isolated local development where port 5432 is not exposed to the host.
- The bearer token is shown only once at registration. Store it securely before navigating away.
- Soft-deleting a service removes it from all listings but preserves all historical health events and incidents.
