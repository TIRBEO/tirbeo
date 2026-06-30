-- ============================================================
-- Tirbeo Newsletter & Email — Migration 019
-- Fully idempotent — safe to run multiple times
-- ============================================================

-- 1. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe (insert)
DROP POLICY IF EXISTS "Public subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Public subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Public can unsubscribe (update by token)
DROP POLICY IF EXISTS "Public unsubscribe" ON public.newsletter_subscribers;
CREATE POLICY "Public unsubscribe" ON public.newsletter_subscribers
  FOR UPDATE USING (true);

-- Admins can read/manage
DROP POLICY IF EXISTS "Admins read newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins read newsletter_subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admins write newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins write newsletter_subscribers" ON public.newsletter_subscribers
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 2. NEWSLETTER CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage newsletter_campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins manage newsletter_campaigns" ON public.newsletter_campaigns
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);

-- 3. EMAIL SETTINGS (single row, like site_config)
CREATE TABLE IF NOT EXISTS public.email_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  provider TEXT NOT NULL DEFAULT 'resend' CHECK (provider IN ('resend', 'sendgrid', 'smtp')),
  api_key TEXT DEFAULT '',
  from_email TEXT DEFAULT 'noreply@tirbeo.com',
  from_name TEXT DEFAULT 'Tirbeo',
  smtp_host TEXT DEFAULT '',
  smtp_port INT DEFAULT 587,
  smtp_user TEXT DEFAULT '',
  smtp_pass TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_email_row CHECK (id = 1)
);

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read email_settings" ON public.email_settings;
CREATE POLICY "Admins read email_settings" ON public.email_settings
  FOR SELECT USING (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admins write email_settings" ON public.email_settings;
CREATE POLICY "Admins write email_settings" ON public.email_settings
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));

-- Insert default
INSERT INTO public.email_settings (id, provider, from_email, from_name)
VALUES (1, 'resend', 'noreply@tirbeo.com', 'Tirbeo')
ON CONFLICT (id) DO NOTHING;

-- 4. Add site_url and nav to site_config if not already there
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS site_url TEXT DEFAULT '';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS nav JSONB DEFAULT '[]'::jsonb;

-- 5. Add app_enabled column to app_configs for toggling apps
ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;
ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS label TEXT DEFAULT '';
ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
