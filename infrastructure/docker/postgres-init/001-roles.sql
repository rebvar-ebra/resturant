-- Runtime and migration roles per spec §14.2: least privilege, separate migration role.
-- The runtime role is NOT a superuser and does not own tables; RLS applies to it.

CREATE ROLE restaurant_app LOGIN PASSWORD 'local_only';
CREATE ROLE restaurant_migration LOGIN PASSWORD 'local_only_migration';

GRANT CONNECT ON DATABASE restaurantos TO restaurant_app;
GRANT CONNECT ON DATABASE restaurantos TO restaurant_migration;

GRANT USAGE ON SCHEMA public TO restaurant_app;
GRANT USAGE, CREATE ON SCHEMA public TO restaurant_migration;

-- Migration role owns objects; runtime role gets DML only.
ALTER DEFAULT PRIVILEGES FOR ROLE restaurant_migration IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO restaurant_app;
ALTER DEFAULT PRIVILEGES FOR ROLE restaurant_migration IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO restaurant_app;
