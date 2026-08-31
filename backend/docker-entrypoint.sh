#!/bin/sh
set -e

npx prisma db push --schema ./schema.prisma --accept-data-loss

node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS services_name_active_unique ON services (name) WHERE deleted_at IS NULL')
  .then(() => p.\$disconnect())
  .catch(() => p.\$disconnect());
"

exec node dist/server.js
