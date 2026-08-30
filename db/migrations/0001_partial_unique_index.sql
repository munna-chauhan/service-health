CREATE UNIQUE INDEX services_name_active_unique ON services (name) WHERE deleted_at IS NULL;
