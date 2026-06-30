-- ============================================================
-- Tirbeo Admin Panel Config — Migration 021
-- DB-driven nav, branding, and settings for admin panel
-- ============================================================

-- 1. ADMIN NAV ITEMS (navigation, fully configurable)
CREATE TABLE IF NOT EXISTS public.admin_nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  page_name TEXT, -- optional display name in page header; defaults to auto-derived from href
  group_name TEXT NOT NULL DEFAULT 'Content',
  min_role TEXT NOT NULL DEFAULT 'editor' CHECK (min_role IN ('viewer','editor','manager','admin','super_admin')),
  feature_toggle TEXT, -- config key like 'chat_enabled'; NULL = always visible
  sort_order INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_nav_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read nav_items" ON public.admin_nav_items;
CREATE POLICY "Admins read nav_items" ON public.admin_nav_items
  FOR SELECT USING (admin_role_at_least(auth.uid(), 'viewer'));

DROP POLICY IF EXISTS "Admins write nav_items" ON public.admin_nav_items;
CREATE POLICY "Admins write nav_items" ON public.admin_nav_items
  FOR ALL USING (admin_role_at_least(auth.uid(), 'admin'))
  WITH CHECK (admin_role_at_least(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_admin_nav_items_sort ON public.admin_nav_items(sort_order);

-- Seed ALL admin nav items (matches the current hardcoded nav)
INSERT INTO public.admin_nav_items (label, href, group_name, min_role, feature_toggle, sort_order) VALUES
  ('Overview', '/', 'Main', 'viewer', NULL, 0),
  ('Docs', '/docs', 'Content', 'editor', 'docs_enabled', 0),
  ('Navigation', '/content/navigation', 'Content', 'editor', NULL, 1),
  ('Footer', '/content/footer', 'Content', 'editor', NULL, 2),
  ('Landing Pages', '/content/pages', 'Content', 'editor', NULL, 3),
  ('Features', '/content/features', 'Content', 'editor', NULL, 4),
  ('Pricing Plans', '/content/pricing', 'Content', 'editor', NULL, 5),
  ('FAQ', '/content/faq', 'Content', 'editor', NULL, 6),
  ('Testimonials', '/content/testimonials', 'Content', 'editor', NULL, 7),
  ('Team', '/content/team', 'Content', 'editor', NULL, 8),
  ('Timeline', '/content/timeline', 'Content', 'editor', NULL, 9),
  ('Blog', '/content/blog', 'Content', 'editor', 'blog_enabled', 10),
  ('Announcements', '/content/announcements', 'Content', 'editor', NULL, 11),
  ('Newsletter', '/content/newsletter', 'Content', 'editor', NULL, 12),
  ('Marquee Logos', '/content/marquee-logos', 'Content', 'editor', 'landing_marquee_enabled', 13),
  ('Landing Stats', '/content/landing-stats', 'Content', 'editor', 'landing_stats_enabled', 14),
  ('Apps Manager', '/content/apps', 'Content', 'editor', NULL, 15),
  ('Content Approval', '/admin/content-approval', 'Moderation', 'manager', NULL, 0),
  ('Site Config', '/site-config', 'Settings', 'admin', NULL, 0),
  ('Universal Config', '/config', 'Settings', 'admin', NULL, 1),
  ('Auth Settings', '/settings/auth', 'Settings', 'admin', NULL, 2),
  ('Email Settings', '/settings/email', 'Settings', 'admin', NULL, 3),
  ('API Keys', '/settings/api-keys', 'Settings', 'admin', NULL, 4),
  ('Integrations', '/settings/integrations', 'Settings', 'admin', NULL, 5),
  ('Admin Nav', '/admin/nav', 'Admin', 'admin', NULL, 0),
  ('Admins', '/admin/admins', 'Admin', 'admin', NULL, 1),
  ('Users', '/admin/users', 'Admin', 'admin', NULL, 2),
  ('Audit Log', '/admin/audit-log', 'Admin', 'admin', NULL, 3),
  ('System Health', '/admin/system-health', 'Admin', 'admin', NULL, 4)
ON CONFLICT DO NOTHING;

-- 2. Add config to store admin-specific settings
INSERT INTO public.config (key, value, type, category, label, description, is_secret) VALUES
  ('admin_brand_name', 'Tirbeo Admin', 'text', 'brand', 'Admin Panel Brand Name', 'Brand name shown in the admin panel header', false),
  ('admin_logo_url', '/logos.png', 'image', 'brand', 'Admin Panel Logo', 'Logo shown in the admin panel sidebar', false),
  ('admin_session_prefix', 'tirbeo_admin', 'text', 'general', 'Admin Session Key Prefix', 'Prefix for admin localStorage session key', false)
ON CONFLICT (key) DO NOTHING;

-- 3. Add admin_nav_items management to config for feature toggle labels
INSERT INTO public.config (key, value, type, category, label, description, is_secret) VALUES
  ('nav_group_labels', '{"Main":"Main","Content":"Content","Moderation":"Moderation","Settings":"Settings","Admin":"Admin"}', 'json', 'display', 'Admin Nav Group Labels', 'JSON object mapping group names to display labels', false)
ON CONFLICT (key) DO NOTHING;

-- 4. Admin UI config keys
INSERT INTO public.config (key, value, type, category, label, description, is_secret) VALUES
  ('admin_nav_style', 'dropdown', 'text', 'display', 'Admin Nav Style', 'Navigation style: "dropdown" (top bar with dropdowns) or "sidebar" (side panel)', false),
  ('admin_compact', 'false', 'boolean', 'display', 'Admin Compact Mode', 'If enabled, reduces spacing for a denser layout', false)
ON CONFLICT (key) DO NOTHING;
