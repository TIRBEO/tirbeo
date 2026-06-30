-- ============================================================
-- Tirbeo Admin User Management — Migration 023
-- RPCs for listing auth users, lookup, and password management
-- ============================================================

-- 1. List ALL registered users from auth.users (admin only)
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE(id UUID, email TEXT, created_at TIMESTAMPTZ, last_sign_in_at TIMESTAMPTZ)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT u.id, u.email::TEXT, u.created_at, u.last_sign_in_at
  FROM auth.users u
  WHERE admin_role_at_least(auth.uid(), 'viewer')
  ORDER BY u.created_at DESC;
$$;

-- 2. Lookup user by email (admin only)
CREATE OR REPLACE FUNCTION public.lookup_user_by_email(target_email TEXT)
RETURNS TABLE(id UUID, email TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT u.id, u.email::TEXT
  FROM auth.users u
  WHERE u.email = target_email
    AND admin_role_at_least(auth.uid(), 'editor')
  LIMIT 1;
$$;

-- 3. Admin update user password (admin+ only, uses pgcrypto for bcrypt hash)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.admin_update_user_password(target_user_id UUID, new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
BEGIN
  IF NOT admin_role_at_least(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = NOW(),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$;
