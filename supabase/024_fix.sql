-- ============================================================
-- Tirbeo 024 Fix — create missing tables, add missing columns
-- ============================================================

-- SITES
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, domain TEXT DEFAULT '',
  description TEXT DEFAULT '', logo_url TEXT DEFAULT '/logos.png',
  favicon_url TEXT DEFAULT '/logos.png', is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active sites" ON public.sites;
CREATE POLICY "Public read active sites" ON public.sites
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write sites" ON public.sites;
CREATE POLICY "Admins write sites" ON public.sites
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_sites_slug ON public.sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_active ON public.sites(is_active);
INSERT INTO public.sites (name, slug, domain, description) VALUES
  ('Tirbeo Main', 'main', 'tirbeo.com', 'Main Tirbeo platform site')
ON CONFLICT (slug) DO NOTHING;

-- SITE DOMAINS
CREATE TABLE IF NOT EXISTS public.site_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage site_domains" ON public.site_domains;
CREATE POLICY "Admins manage site_domains" ON public.site_domains
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_site_domains_site ON public.site_domains(site_id);

-- Fix existing tables (add missing columns)
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;

-- TIMELINE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  date TEXT NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '',
  icon TEXT DEFAULT '', sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read timeline" ON public.timeline;
CREATE POLICY "Public read timeline" ON public.timeline
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write timeline" ON public.timeline;
CREATE POLICY "Admins write timeline" ON public.timeline
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- USER SESSIONS
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL,
  ip_address TEXT, user_agent TEXT, device_type TEXT DEFAULT 'unknown',
  is_active BOOLEAN DEFAULT true, last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read user_sessions" ON public.user_sessions;
CREATE POLICY "Admins read user_sessions" ON public.user_sessions
  FOR SELECT USING (admin_role_at_least(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users read own sessions" ON public.user_sessions;
CREATE POLICY "Users read own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users delete own sessions" ON public.user_sessions;
CREATE POLICY "Users delete own sessions" ON public.user_sessions
  FOR DELETE USING (user_id = auth.uid());

-- BACKUPS
CREATE TABLE IF NOT EXISTS public.backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'auto', 'scheduled')),
  size_bytes BIGINT DEFAULT 0, file_url TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage backups" ON public.backups;
CREATE POLICY "Admins manage backups" ON public.backups
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));

-- RLS policies for existing tables
DROP POLICY IF EXISTS "Public read features" ON public.features;
CREATE POLICY "Public read features" ON public.features
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write features" ON public.features;
CREATE POLICY "Admins write features" ON public.features
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Public read pricing_plans" ON public.pricing_plans;
CREATE POLICY "Public read pricing_plans" ON public.pricing_plans
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write pricing_plans" ON public.pricing_plans;
CREATE POLICY "Admins write pricing_plans" ON public.pricing_plans
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write faqs" ON public.faqs;
CREATE POLICY "Admins write faqs" ON public.faqs
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Public read team_members" ON public.team_members;
CREATE POLICY "Public read team_members" ON public.team_members
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write team_members" ON public.team_members;
CREATE POLICY "Admins write team_members" ON public.team_members
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write testimonials" ON public.testimonials;
CREATE POLICY "Admins write testimonials" ON public.testimonials
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements
  FOR SELECT USING (COALESCE(is_published, false) = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write announcements" ON public.announcements;
CREATE POLICY "Admins write announcements" ON public.announcements
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- site_id on existing tables
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE doc_categories ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;

-- RPC
CREATE OR REPLACE FUNCTION public.get_sites_with_stats()
RETURNS TABLE(id UUID, name TEXT, slug TEXT, domain TEXT, is_active BOOLEAN,
  total_users BIGINT, total_posts BIGINT, created_at TIMESTAMPTZ)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.name, s.slug, s.domain, s.is_active,
    COALESCE((SELECT COUNT(*) FROM user_profiles), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM blog_posts WHERE site_id = s.id), 0)::BIGINT,
    s.created_at
  FROM sites s ORDER BY s.name;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_features_site ON public.features(site_id);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_site ON public.pricing_plans(site_id);
CREATE INDEX IF NOT EXISTS idx_faqs_site ON public.faqs(site_id);
CREATE INDEX IF NOT EXISTS idx_team_members_site ON public.team_members(site_id);
CREATE INDEX IF NOT EXISTS idx_timeline_site ON public.timeline(site_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_site ON public.testimonials(site_id);
CREATE INDEX IF NOT EXISTS idx_announcements_site ON public.announcements(site_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
