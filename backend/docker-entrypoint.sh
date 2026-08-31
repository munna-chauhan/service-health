#!/bin/sh
set -e

# Sync schema to DB
./node_modules/.bin/prisma db push --schema /app/schema.prisma --accept-data-loss

# Apply partial unique index (Prisma doesn't support partial indexes natively)
# DATABASE_URL format: postgresql://user:pass@host:port/dbname
# Use node to run the raw SQL, fail loudly on error
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS services_name_active_unique ON services (name) WHERE deleted_at IS NULL')
  .then(() => { console.log('Partial unique index applied'); return p.\$disconnect(); })
  .then(() => process.exit(0))
  .catch((err) => { console.error('Index creation failed:', err.message); process.exit(1); });
"

exec node dist/server.js
