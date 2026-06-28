-- ============================================================
-- Tirbeo — User Profiles & API Keys
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  avatar_url TEXT,
  company TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Update api_keys RLS to allow users to manage their own keys
DROP POLICY IF EXISTS "Users can read own api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can create own api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update own api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete own api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Admins can manage api_keys" ON public.api_keys;

CREATE POLICY "Users can read own api_keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Users can create own api_keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api_keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api_keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all api_keys" ON public.api_keys
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin')));

-- Add is_active column if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'name') THEN
    ALTER TABLE public.api_keys ADD COLUMN name TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'last_used_at') THEN
    ALTER TABLE public.api_keys ADD COLUMN last_used_at TIMESTAMPTZ;
  END IF;
END $$;

-- Sync existing auth users into user_profiles
INSERT INTO public.user_profiles (user_id, display_name)
  SELECT id, COALESCE(raw_user_meta_data->>'display_name', email) FROM auth.users
  ON CONFLICT (user_id) DO NOTHING;

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
