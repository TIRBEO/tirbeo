-- Bootstrap first admin user (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.bootstrap_admin(target_user_id UUID, target_email TEXT, target_role TEXT DEFAULT 'super_admin')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM admin_users) > 0 THEN
    RAISE EXCEPTION 'Admin users already exist';
  END IF;
  INSERT INTO admin_users (user_id, email, role) VALUES (target_user_id, target_email, target_role);
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin TO authenticated;
