-- ============================================================
-- Tirbeo Admin Panel Consolidation — Migration 018
-- Adds missing columns, fixes RLS patterns, adds helpers
-- Fully idempotent — safe to run multiple times
-- ============================================================

-- 1. Missing site_config columns
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS site_url TEXT DEFAULT '';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS nav JSONB DEFAULT '[]'::jsonb;

-- Update default logo to match current branding
UPDATE site_config SET logo_url = '/logos.png' WHERE logo_url = '/logo.png';

-- 2. Fix content_approvals RLS — use security definer helpers
ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage approvals" ON content_approvals;
DROP POLICY IF EXISTS "Admins read content_approvals" ON content_approvals;
DROP POLICY IF EXISTS "Admins write content_approvals" ON content_approvals;

CREATE POLICY "Admins read content_approvals" ON content_approvals FOR SELECT USING (
  admin_role_at_least(auth.uid(), 'viewer')
);

CREATE POLICY "Editor write content_approvals" ON content_approvals FOR INSERT WITH CHECK (
  admin_role_at_least(auth.uid(), 'editor')
);

CREATE POLICY "Manager update content_approvals" ON content_approvals FOR UPDATE USING (
  admin_role_at_least(auth.uid(), 'manager')
);

CREATE POLICY "Manager delete content_approvals" ON content_approvals FOR DELETE USING (
  admin_role_at_least(auth.uid(), 'manager')
);

-- 3. Add indexes for content_approvals
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON content_approvals(status);
CREATE INDEX IF NOT EXISTS idx_content_approvals_submitted_by ON content_approvals(submitted_by);

-- 4. Impersonation function
CREATE OR REPLACE FUNCTION public.impersonate_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user auth.users;
  result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admins can impersonate';
  END IF;

  SELECT * INTO target_user FROM auth.users WHERE id = target_user_id;
  IF target_user.id IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  -- Log the impersonation
  INSERT INTO public.impersonation_logs (admin_id, target_user_id)
  VALUES (
    (SELECT id FROM public.admin_users WHERE user_id = auth.uid() LIMIT 1),
    target_user_id
  );

  result := jsonb_build_object(
    'id', target_user.id,
    'email', target_user.email,
    'created_at', target_user.created_at
  );

  RETURN result;
END;
$$;

-- 5. Ensure user_profiles trigger exists on auth.users (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_config_id ON site_config(id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
