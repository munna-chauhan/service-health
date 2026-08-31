#!/bin/sh
set -e

# Use absolute schema path to bypass package.json prisma.schema config
./node_modules/.bin/prisma db push --schema /app/schema.prisma --accept-data-loss

node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS services_name_active_unique ON services (name) WHERE deleted_at IS NULL')
  .then(() => p.\$disconnect())
  .catch(() => p.\$disconnect());
"

exec node dist/server.js
