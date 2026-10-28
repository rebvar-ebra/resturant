-- Access-control tables are visible to the owning user (app.user_id) OR
-- within an active tenant context (app.tenant_id). Business tables remain
-- strictly tenant-scoped. See ADR-0001.

DROP POLICY memberships_tenant_isolation ON memberships;
CREATE POLICY memberships_access ON memberships
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
  );

DROP POLICY membership_locations_tenant_isolation ON membership_locations;
CREATE POLICY membership_locations_access ON membership_locations
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.tenant_id = membership_locations.tenant_id
        AND m.id = membership_locations.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.tenant_id = membership_locations.tenant_id
        AND m.id = membership_locations.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  );
