-- ============================================================
-- Tirbeo Universal Config System — Migration 020
-- SINGLE source of truth for ALL configurable values.
-- No redundancy. One table to rule them all.
-- ============================================================

-- 1. UNIVERSAL CONFIG: key-value store with types, categories, labels
CREATE TABLE IF NOT EXISTS public.config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text','number','boolean','json','url','email','color','image')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general','brand','seo','social','urls','email','chat','storage','display','feature','integrations')),
  label TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read config" ON public.config;
CREATE POLICY "Public read config" ON public.config
  FOR SELECT USING (is_secret = false);

DROP POLICY IF EXISTS "Admins read config" ON public.config;
CREATE POLICY "Admins read config" ON public.config
  FOR SELECT USING (admin_role_at_least(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admins write config" ON public.config;
CREATE POLICY "Admins write config" ON public.config
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));

-- Helper function: get config value by key (public, returns null for secrets)
CREATE OR REPLACE FUNCTION public.get_config(key_name text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM config WHERE key = key_name AND is_secret = false;
$$;

-- Helper function: get all public config as JSON
CREATE OR REPLACE FUNCTION public.get_all_config()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_object_agg(key, value)
  FROM config
  WHERE is_secret = false;
$$;

CREATE INDEX IF NOT EXISTS idx_config_category ON public.config(category);
CREATE INDEX IF NOT EXISTS idx_config_key ON public.config(key);

-- ============================================================
-- SEED ALL CONFIG KEYS
-- ============================================================
INSERT INTO public.config (key, value, type, category, label, description, is_secret) VALUES
  -- === BRAND ===
  ('brand_name', 'Tirbeo', 'text', 'brand', 'Brand Name', 'The name of your brand/site', false),
  ('brand_tagline', 'Connect. Create. Collaborate.', 'text', 'brand', 'Tagline', 'Short tagline shown across the site', false),
  ('logo_url', '/logos.png', 'image', 'brand', 'Logo URL', 'URL to the logo image', false),
  ('favicon_url', '/logos.png', 'image', 'brand', 'Favicon URL', 'URL to the favicon image', false),
  ('brand_description', 'A modern workspace for the communities you care about.', 'text', 'brand', 'Brand Description', 'Short brand description', false),

  -- === SEO ===
  ('seo_title', 'Tirbeo — Connect. Create. Collaborate.', 'text', 'seo', 'Default SEO Title', 'Default title tag for SEO', false),
  ('seo_description', 'A modern workspace for the communities you care about.', 'text', 'seo', 'Default SEO Description', 'Default meta description', false),
  ('seo_keywords', 'community, chat, collaboration, workspace', 'text', 'seo', 'SEO Keywords', 'Comma-separated keywords', false),

  -- === SOCIAL ===
  ('social_twitter', '', 'url', 'social', 'Twitter / X URL', 'https://twitter.com/yourhandle', false),
  ('social_github', 'https://github.com/TIRBEO', 'url', 'social', 'GitHub URL', 'https://github.com/yourorg', false),
  ('social_discord', 'https://discord.gg/tirbeo', 'url', 'social', 'Discord URL', 'https://discord.gg/yourinvite', false),
  ('social_linkedin', '', 'url', 'social', 'LinkedIn URL', 'https://linkedin.com/company/yourcompany', false),

  -- === URLS ===
  ('site_url', 'https://tirbeo.com', 'url', 'urls', 'Main Site URL', 'Main website URL', false),
  ('accounts_url', 'https://account.tirbeo.com', 'url', 'urls', 'Accounts App URL', 'Accounts / auth app URL', false),
  ('dashboard_url', 'https://dashboard.tirbeo.com', 'url', 'urls', 'Dashboard App URL', 'Dashboard app URL', false),
  ('chat_url', 'https://chat.tirbeo.com', 'url', 'urls', 'Chat App URL', 'Chat app URL', false),
  ('admin_url', '', 'url', 'urls', 'Admin Panel URL', 'Admin panel URL', false),
  ('docs_url', 'https://docs.tirbeo.com', 'url', 'urls', 'Docs App URL', 'Documentation app URL', false),
  ('blog_url', 'https://blog.tirbeo.com', 'url', 'urls', 'Blog App URL', 'Blog app URL', false),
  ('about_url', 'https://about.tirbeo.com', 'url', 'urls', 'About App URL', 'About page app URL', false),
  ('landing_url', 'https://tirbeo.com', 'url', 'urls', 'Landing Page URL', 'Landing / marketing page URL', false),

  -- === EMAIL ===
  ('support_email', 'support@tirbeo.com', 'email', 'email', 'Support Email', 'Displayed on contact pages', false),
  ('careers_email', 'careers@tirbeo.com', 'email', 'email', 'Careers Email', 'For job applications', false),
  ('noreply_email', 'noreply@tirbeo.com', 'email', 'email', 'No-Reply Sender Email', 'Outgoing email from address', false),

  -- === CHAT ===
  ('max_upload_size_mb', '25', 'number', 'chat', 'Max Upload Size (MB)', 'Maximum file upload size in megabytes', false),
  ('message_retention_days', '365', 'number', 'chat', 'Message Retention (Days)', 'Days before messages are auto-deleted', false),
  ('default_channel_general', 'general', 'text', 'chat', 'Default General Channel', 'Name of the default general channel', false),
  ('default_channel_announcements', 'announcements', 'text', 'chat', 'Announcements Channel Name', 'Name of the announcements channel', false),
  ('default_channel_random', 'random', 'text', 'chat', 'Random Channel Name', 'Name of the random/off-topic channel', false),
  ('chat_welcome_message', 'Welcome to {channel}!', 'text', 'chat', 'Channel Welcome Message', 'Message shown when joining a channel', false),
  ('max_message_length', '4000', 'number', 'chat', 'Max Message Length', 'Maximum characters per message', false),
  ('file_allowed_types', '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip,.mp4,.mov', 'text', 'chat', 'Allowed File Types', 'Comma-separated list of allowed file extensions', false),

  -- === STORAGE ===
  ('storage_attachments_bucket', 'chat_attachments', 'text', 'storage', 'Attachments Bucket Name', 'Supabase Storage bucket for file attachments', false),
  ('storage_avatars_bucket', 'avatars', 'text', 'storage', 'Avatars Bucket Name', 'Supabase Storage bucket for user avatars', false),

  -- === DISPLAY ===
  ('default_theme', 'dark', 'text', 'display', 'Default Theme', 'Default theme for new users (dark/light/system)', false),
  ('default_language', 'en', 'text', 'display', 'Default Language', 'Default language code (en, es, fr, etc.)', false),

  -- === FEATURE TOGGLES ===
  ('registration_enabled', 'true', 'boolean', 'feature', 'User Registration', 'Allow new users to sign up', false),
  ('maintenance_mode', 'false', 'boolean', 'feature', 'Maintenance Mode', 'Show maintenance page to visitors', false),
  ('chat_enabled', 'true', 'boolean', 'feature', 'Chat Feature', 'Enable or disable the chat app', false),
  ('blog_enabled', 'true', 'boolean', 'feature', 'Blog Feature', 'Enable or disable the blog', false),
  ('docs_enabled', 'true', 'boolean', 'feature', 'Docs Feature', 'Enable or disable documentation', false),
  ('landing_marquee_enabled', 'true', 'boolean', 'feature', 'Landing Marquee', 'Show brand marquee on landing page', false),
  ('landing_stats_enabled', 'true', 'boolean', 'feature', 'Landing Stats', 'Show statistics section on landing page', false),
  ('landing_showcase_enabled', 'true', 'boolean', 'feature', 'Landing Showcase', 'Show preview showcase on landing page', false),

  -- === SESSION ===
  ('session_key_prefix', 'tirbeo', 'text', 'general', 'Session Key Prefix', 'Prefix for localStorage session keys', false),

  -- === LANDING PAGE NUMBERS ===
  ('stat_messages_sent', '12847', 'number', 'display', 'Stat: Messages Sent', 'Number shown for messages sent stat', false),
  ('stat_communities', '254831', 'number', 'display', 'Stat: Communities', 'Number shown for communities stat', false),
  ('stat_response_time', '4.2ms', 'text', 'display', 'Stat: Response Time', 'Number shown for response time stat', false),
  ('stat_uptime', '99.99%', 'text', 'display', 'Stat: Uptime', 'Uptime percentage shown', false),

  -- === MISC ===
  ('marquee_logos', '["Lumen","Northfold","Caravel","Circa","Rune","Sparrow","Veltra","Aerolab"]', 'json', 'display', 'Marquee Brand Logos', 'JSON array of brand names shown in the marquee', false)

ON CONFLICT (key) DO NOTHING;

-- 2. MARQUEE LOGOS (individual entries, replaces the JSON-based approach)
CREATE TABLE IF NOT EXISTS public.marquee_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.marquee_logos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read marquee_logos" ON public.marquee_logos;
CREATE POLICY "Public read marquee_logos" ON public.marquee_logos
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins write marquee_logos" ON public.marquee_logos;
CREATE POLICY "Admins write marquee_logos" ON public.marquee_logos
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- 3. LANDING STATS (individual stat items)
CREATE TABLE IF NOT EXISTS public.landing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  suffix TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.landing_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read landing_stats" ON public.landing_stats;
CREATE POLICY "Public read landing_stats" ON public.landing_stats
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins write landing_stats" ON public.landing_stats;
CREATE POLICY "Admins write landing_stats" ON public.landing_stats
  FOR ALL USING (admin_role_at_least(auth.uid(), 'editor'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'editor'));

-- Seed landing_stats
INSERT INTO public.landing_stats (label, value, suffix, sort_order) VALUES
  ('Messages Sent', '12,847', '', 0),
  ('Communities', '254,831', '', 1),
  ('Avg Response', '4.2', 'ms', 2),
  ('Uptime', '99.99', '%', 3)
ON CONFLICT DO NOTHING;

-- Seed marquee_logos
INSERT INTO public.marquee_logos (name, sort_order) VALUES
  ('Lumen', 0), ('Northfold', 1), ('Caravel', 2), ('Circa', 3),
  ('Rune', 4), ('Sparrow', 5), ('Veltra', 6), ('Aerolab', 7)
ON CONFLICT DO NOTHING;

-- 4. Keep site_config for backward compat but add view that merges with config
-- The config table is now the primary source. site_config is preserved for existing queries.

-- 5. Indexes for landing_stats and marquee_logos
CREATE INDEX IF NOT EXISTS idx_marquee_logos_sort ON public.marquee_logos(sort_order);
CREATE INDEX IF NOT EXISTS idx_landing_stats_sort ON public.landing_stats(sort_order);
