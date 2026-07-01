-- ============================================================
-- Tirbeo Multi-Site & Content Management — Migration 024
-- Sites table for multi-tenant, content management tables
-- Fully idempotent
-- ============================================================

-- 1. SITES TABLE (multi-tenant support)
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT DEFAULT '',
  description TEXT DEFAULT '',
  logo_url TEXT DEFAULT '/logos.png',
  favicon_url TEXT DEFAULT '/logos.png',
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
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

-- Seed default site
INSERT INTO public.sites (name, slug, domain, description) VALUES
  ('Tirbeo Main', 'main', 'tirbeo.com', 'Main Tirbeo platform site')
ON CONFLICT (slug) DO NOTHING;

-- 2. SITE DOMAINS (custom domains per site)
CREATE TABLE IF NOT EXISTS public.site_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage site_domains" ON public.site_domains;
CREATE POLICY "Admins manage site_domains" ON public.site_domains
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_site_domains_site ON public.site_domains(site_id);

-- 3. CONTENT: Features
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read features" ON public.features;
CREATE POLICY "Public read features" ON public.features
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write features" ON public.features;
CREATE POLICY "Admins write features" ON public.features
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- Fix site_id on existing content tables
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;

-- 4. CONTENT: Pricing Plans
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month' CHECK (interval IN ('month', 'year', 'once')),
  description TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  highlighted BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pricing_plans" ON public.pricing_plans;
CREATE POLICY "Public read pricing_plans" ON public.pricing_plans
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write pricing_plans" ON public.pricing_plans;
CREATE POLICY "Admins write pricing_plans" ON public.pricing_plans
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 5. CONTENT: FAQ
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write faqs" ON public.faqs;
CREATE POLICY "Admins write faqs" ON public.faqs
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 6. CONTENT: Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read team_members" ON public.team_members;
CREATE POLICY "Public read team_members" ON public.team_members
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write team_members" ON public.team_members;
CREATE POLICY "Admins write team_members" ON public.team_members
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 7. CONTENT: Timeline
CREATE TABLE IF NOT EXISTS public.timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read timeline" ON public.timeline;
CREATE POLICY "Public read timeline" ON public.timeline
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write timeline" ON public.timeline;
CREATE POLICY "Admins write timeline" ON public.timeline
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 8. CONTENT: Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials
  FOR SELECT USING (is_active = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write testimonials" ON public.testimonials;
CREATE POLICY "Admins write testimonials" ON public.testimonials
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 9. CONTENT: Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure missing columns exist on existing table
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements
  FOR SELECT USING (COALESCE(is_published, false) = true OR admin_role_at_least(auth.uid(), 'viewer'));
DROP POLICY IF EXISTS "Admins write announcements" ON public.announcements;
CREATE POLICY "Admins write announcements" ON public.announcements
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 10. USER SESSIONS TABLE for login tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT DEFAULT 'unknown',
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT now(),
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

-- 11. BACKUPS TABLE
CREATE TABLE IF NOT EXISTS public.backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'auto', 'scheduled')),
  size_bytes BIGINT DEFAULT 0,
  file_url TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage backups" ON public.backups;
CREATE POLICY "Admins manage backups" ON public.backups
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));

-- 12. Add site_id to existing tables
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE doc_categories ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'channels') THEN
    ALTER TABLE channels ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 13. RPC: List sites with stats
CREATE OR REPLACE FUNCTION public.get_sites_with_stats()
RETURNS TABLE(
  id UUID, name TEXT, slug TEXT, domain TEXT, is_active BOOLEAN,
  total_users BIGINT, total_posts BIGINT, created_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    s.id, s.name, s.slug, s.domain, s.is_active,
    COALESCE((SELECT COUNT(*) FROM users), 0)::BIGINT as total_users,
    COALESCE((SELECT COUNT(*) FROM blog_posts WHERE site_id = s.id), 0)::BIGINT as total_posts,
    s.created_at
  FROM sites s
  ORDER BY s.name;
$$;

-- 14. Indexes
CREATE INDEX IF NOT EXISTS idx_features_site ON public.features(site_id);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_site ON public.pricing_plans(site_id);
CREATE INDEX IF NOT EXISTS idx_faqs_site ON public.faqs(site_id);
CREATE INDEX IF NOT EXISTS idx_team_members_site ON public.team_members(site_id);
CREATE INDEX IF NOT EXISTS idx_timeline_site ON public.timeline(site_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_site ON public.testimonials(site_id);
CREATE INDEX IF NOT EXISTS idx_announcements_site ON public.announcements(site_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
