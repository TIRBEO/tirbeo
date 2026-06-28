-- Run this in Main DB Dashboard SQL Editor (mvogfnbqpaiedkkslecn)

-- ============== API KEYS ==============
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_value TEXT UNIQUE NOT NULL,
  prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage api_keys" ON public.api_keys FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== BACKUPS ==============
CREATE TABLE IF NOT EXISTS public.backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full', 'incremental')),
  size_bytes BIGINT DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL
);

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage backups" ON public.backups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== EXPORTS ==============
CREATE TABLE IF NOT EXISTS public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL,
  format TEXT NOT NULL,
  schedule TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL
);

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage exports" ON public.exports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== INTEGRATIONS ==============
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage integrations" ON public.integrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== REPORTS ==============
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'pdf',
  config JSONB DEFAULT '{}',
  file_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  generated_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage reports" ON public.reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== TRASH ITEMS ==============
CREATE TABLE IF NOT EXISTS public.trash_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID,
  entity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  deleted_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.trash_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage trash" ON public.trash_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== SYSTEM HEALTH LOGS ==============
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('operational', 'degraded', 'down')),
  response_time_ms INT,
  checked_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read system_health" ON public.system_health FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== IMPERSONATION LOGS ==============
CREATE TABLE IF NOT EXISTS public.impersonation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage impersonation_logs" ON public.impersonation_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- ============== AUTH SETTINGS (for MFA / phone / verification) ==============
CREATE TABLE IF NOT EXISTS public.auth_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_methods TEXT[] DEFAULT ARRAY['totp'],
  phone_verification_enabled BOOLEAN DEFAULT false,
  otp_verification_enabled BOOLEAN DEFAULT true,
  session_duration_hours INT DEFAULT 72,
  password_min_length INT DEFAULT 8,
  max_login_attempts INT DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL
);

ALTER TABLE public.auth_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage auth_settings" ON public.auth_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Insert default auth settings if not exist
INSERT INTO public.auth_settings (id, mfa_enabled, mfa_methods, phone_verification_enabled, otp_verification_enabled)
SELECT gen_random_uuid(), false, ARRAY['totp'], false, true
WHERE NOT EXISTS (SELECT 1 FROM public.auth_settings);

-- ============== INDEXES ==============
CREATE INDEX IF NOT EXISTS idx_trash_entity ON public.trash_items(entity_type);
CREATE INDEX IF NOT EXISTS idx_trash_deleted ON public.trash_items(deleted_at);
CREATE INDEX IF NOT EXISTS idx_exports_data_type ON public.exports(data_type);
CREATE INDEX IF NOT EXISTS idx_backups_type ON public.backups(type);
CREATE INDEX IF NOT EXISTS idx_system_health_service ON public.system_health(service);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active);
