-- List admin users (SECURITY DEFINER, no RLS)
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE(user_id UUID, email TEXT, role TEXT)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, email, role FROM admin_users ORDER BY created_at;
$$;

GRANT EXECUTE ON FUNCTION public.list_admin_users TO authenticated;

-- Add admin user without admin check (for recovery / setup)
CREATE OR REPLACE FUNCTION public.add_admin_user(target_user_id UUID, target_email TEXT, target_role TEXT DEFAULT 'admin')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_users (user_id, email, role) VALUES (target_user_id, target_email, target_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_admin_user TO authenticated;
