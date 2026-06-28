-- ============================================================
-- Migration 014: Admin users listing function
-- Provides a secure way to list all auth.users to admin panel
-- ============================================================

-- List all users for admin panel (admin+ only)
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE(
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admins can list all users';
  END IF;

  RETURN QUERY
  SELECT au.id::uuid, au.email::text, au.created_at::timestamptz, au.last_sign_in_at::timestamptz
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Lookup a single user by email for adding to admin_users
CREATE OR REPLACE FUNCTION public.lookup_user_by_email(target_email text)
RETURNS TABLE(
  id uuid,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admins can look up users';
  END IF;

  RETURN QUERY
  SELECT au.id::uuid, au.email::text
  FROM auth.users au
  WHERE au.email = target_email
  LIMIT 1;
END;
$$;

-- user_profiles table: auto-created on signup for easy listing
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: admin users (admin+) can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE role IN ('admin', 'super_admin', 'manager', 'editor', 'viewer'))
  );

-- RLS: admins can write profiles
CREATE POLICY "Admins can write profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update profiles"
  ON public.user_profiles FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
