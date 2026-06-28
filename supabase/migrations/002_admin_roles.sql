-- ============================================================
-- Tirbeo Admin Role Hierarchy — Migration 002
-- Fully idempotent — safe to run multiple times
-- ============================================================

-- 0. Helper: security definer functions to avoid RLS recursion
-- These bypass RLS since they're created by the superuser
CREATE OR REPLACE FUNCTION public.admin_user_role(uid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM admin_users WHERE user_id = uid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.admin_user_exists(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = uid);
$$;

CREATE OR REPLACE FUNCTION public.admin_role_at_least(uid uuid, min_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = uid
    AND CASE min_role
      WHEN 'super_admin' THEN role = 'super_admin'
      WHEN 'admin' THEN role IN ('super_admin', 'admin')
      WHEN 'manager' THEN role IN ('super_admin', 'admin', 'manager')
      WHEN 'editor' THEN role IN ('super_admin', 'admin', 'manager', 'editor')
      WHEN 'viewer' THEN role IN ('super_admin', 'admin', 'manager', 'editor', 'viewer')
      ELSE false
    END
  );
$$;

-- 1. Add new roles to existing admin_users constraint
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('super_admin', 'admin', 'manager', 'editor', 'viewer'));

-- 2. Add columns (idempotent via IF NOT EXISTS)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action, created_at);

-- 4. RLS on audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read audit_log" ON admin_audit_log;
CREATE POLICY "Admin read audit_log" ON admin_audit_log FOR SELECT USING (
  admin_role_at_least(auth.uid(), 'admin')
);

-- 5. Update content table policies to include all new roles
-- Use security definer helpers to avoid infinite recursion
DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN ('admin_users', 'admin_audit_log', 'schema_migrations')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin write %I" ON %I', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "Admin write %I" ON %I FOR ALL USING (
        admin_role_at_least(auth.uid(), ''editor'')
      ) WITH CHECK (
        admin_role_at_least(auth.uid(), ''editor'')
      )
    ', tbl, tbl);
  END LOOP;
END $$;

-- 6. admin_users policies — these do NOT query admin_users to avoid recursion
DROP POLICY IF EXISTS "Admin read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin write admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin delete admin_users" ON admin_users;

-- Use the security definer helpers
CREATE POLICY "Admin read admin_users" ON admin_users FOR SELECT USING (
  admin_user_exists(auth.uid())
);

-- Allow insert if admin_users is empty (first user bootstrap)
CREATE POLICY "Admin write admin_users" ON admin_users FOR INSERT WITH CHECK (
  admin_role_at_least(auth.uid(), 'admin')
  OR (SELECT count(*) FROM admin_users) = 0
);

CREATE POLICY "Admin update admin_users" ON admin_users FOR UPDATE USING (
  admin_role_at_least(auth.uid(), 'admin')
) WITH CHECK (
  admin_role_at_least(auth.uid(), 'super_admin')
  OR (admin_role_at_least(auth.uid(), 'admin') AND role IN ('editor', 'viewer'))
);

CREATE POLICY "Admin delete admin_users" ON admin_users FOR DELETE USING (
  admin_role_at_least(auth.uid(), 'super_admin')
);

-- 7. Seed: promote first existing admin to super_admin
UPDATE admin_users SET role = 'super_admin'
WHERE id = (SELECT id FROM admin_users ORDER BY created_at ASC LIMIT 1)
AND role != 'super_admin';
