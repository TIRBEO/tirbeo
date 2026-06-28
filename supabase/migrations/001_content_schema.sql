-- ============================================================
-- Tirbeo Content Management System — Database Schema
-- Single database for all apps (landing, about, docs, admin, etc.)
-- ============================================================

-- 1. SITE CONFIG
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'Tirbeo',
  tagline TEXT,
  logo_url TEXT DEFAULT '/logo.png',
  favicon_url TEXT DEFAULT '/favicon.ico',
  seo_title TEXT DEFAULT 'Tirbeo — Connect. Create. Collaborate.',
  seo_description TEXT DEFAULT 'A modern workspace for the communities you care about.',
  seo_keywords TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 2. NAVIGATION
CREATE TABLE nav_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FOOTER
CREATE TABLE footer_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES footer_sections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PAGES (SEO + metadata per route)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PAGE SECTIONS (reusable content blocks per page)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT REFERENCES pages(slug) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hero','features','how-it-works','testimonials','faq','pricing','cta','stats','story','values','timeline','team'
  title TEXT,
  subtitle TEXT,
  body TEXT, -- rich text / markdown
  metadata JSONB DEFAULT '{}'::jsonb, -- flexible config per section type
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FEATURES (feature cards under a features section)
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  icon TEXT,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT, -- optional accent color
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TEAM MEMBERS
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  avatar_url TEXT,
  color TEXT, -- avatar background color
  social_links JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TIMELINE EVENTS
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  event TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. TESTIMONIALS
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. FAQS
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PRICING PLANS
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2),
  price_yearly NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  features JSONB DEFAULT '[]'::jsonb,
  cta_label TEXT DEFAULT 'Get Started',
  cta_href TEXT,
  is_popular BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. DOCS PAGES (hierarchical documentation)
CREATE TABLE doc_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE doc_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES doc_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT, -- markdown body
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- 13. ADMIN USERS (who can access the admin panel)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_sections_page ON sections(page_slug);
CREATE INDEX idx_features_section ON features(section_id);
CREATE INDEX idx_footer_links_section ON footer_links(section_id);
CREATE INDEX idx_doc_articles_category ON doc_articles(category_id);
CREATE INDEX idx_doc_articles_slug ON doc_articles(category_id, slug);
CREATE INDEX idx_nav_links_active ON nav_links(is_active, sort_order);
CREATE INDEX idx_admin_users_user ON admin_users(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Public can read all published content
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public read" ON nav_links FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON footer_sections FOR SELECT USING (true);
CREATE POLICY "Public read" ON footer_links FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public read" ON sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON features FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON timeline_events FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON pricing_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON doc_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON doc_articles FOR SELECT USING (is_published = true);

-- Admin write policies (admins and editors can CRUD content)
CREATE POLICY "Admin write site_config" ON site_config FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write nav_links" ON nav_links FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write footer_sections" ON footer_sections FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write footer_links" ON footer_links FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write pages" ON pages FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write sections" ON sections FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write features" ON features FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write team_members" ON team_members FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write timeline_events" ON timeline_events FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write testimonials" ON testimonials FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write faqs" ON faqs FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write pricing_plans" ON pricing_plans FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write doc_categories" ON doc_categories FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write doc_articles" ON doc_articles FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

-- Admin users table: admins only
CREATE POLICY "Admin read admin_users" ON admin_users FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor', 'viewer'))
);

CREATE POLICY "Admin write admin_users" ON admin_users FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'admin')
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'admin')
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Initial site config
INSERT INTO site_config (site_name, tagline, seo_description)
VALUES ('Tirbeo', 'Connect. Create. Collaborate.', 'A modern workspace for the communities you care about.')
ON CONFLICT (id) DO NOTHING;

-- Navigation
INSERT INTO nav_links (label, href, sort_order) VALUES
  ('Home', '/', 0),
  ('Product', '/#features', 1),
  ('About', '/about', 2),
  ('Docs', '/docs', 3),
  ('Blog', '/blog', 4);

-- Footer sections
INSERT INTO footer_sections (id, title, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Product', 0),
  ('a0000000-0000-0000-0000-000000000002', 'Company', 1),
  ('a0000000-0000-0000-0000-000000000003', 'Legal', 2);

INSERT INTO footer_links (section_id, label, href, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Features', '/#features', 0),
  ('a0000000-0000-0000-0000-000000000001', 'Pricing', '/#pricing', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Changelog', '/changelog', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Roadmap', '/roadmap', 3),
  ('a0000000-0000-0000-0000-000000000002', 'About', '/about', 0),
  ('a0000000-0000-0000-0000-000000000002', 'Blog', '/blog', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Careers', '/careers', 2),
  ('a0000000-0000-0000-0000-000000000002', 'Press', '/press', 3),
  ('a0000000-0000-0000-0000-000000000003', 'Privacy', '/privacy', 0),
  ('a0000000-0000-0000-0000-000000000003', 'Terms', '/terms', 1),
  ('a0000000-0000-0000-0000-000000000003', 'Security', '/security', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Status', '/status', 3);

-- Pages
INSERT INTO pages (slug, title, seo_title, seo_description) VALUES
  ('home', 'Home', 'Tirbeo — Connect. Create. Collaborate.', 'A modern workspace for the communities you care about.'),
  ('about', 'About', 'About Tirbeo — Our Story & Team', 'Learn about the team behind Tirbeo and our mission.'),
  ('docs', 'Documentation', 'Tirbeo Documentation', 'Guides, API reference, and tutorials for Tirbeo.');

-- Home sections
INSERT INTO sections (page_slug, type, title, subtitle, sort_order) VALUES
  ('home', 'hero', 'Connect. Create. Collaborate.', 'A modern workspace for the communities you care about.', 0),
  ('home', 'features', 'Everything you need', 'Powerful tools to bring your community together.', 1),
  ('home', 'how-it-works', 'How it works', 'Get started in minutes.', 2),
  ('home', 'testimonials', 'Loved by communities', 'Hear from people already using Tirbeo.', 3),
  ('home', 'faq', 'Frequently asked questions', 'Everything you need to know.', 4),
  ('home', 'pricing', 'Simple, transparent pricing', 'No hidden fees. No surprises.', 5),
  ('home', 'cta', 'Ready to get started?', 'Join thousands of communities already on Tirbeo.', 6);

-- About sections
INSERT INTO sections (page_slug, type, title, subtitle, sort_order) VALUES
  ('about', 'hero', 'Our story', 'From an idea to a mission.', 0),
  ('about', 'stats', 'By the numbers', '', 1),
  ('about', 'values', 'Principles that guide every decision.', '', 2),
  ('about', 'timeline', 'The road so far.', '', 3),
  ('about', 'team', 'A small team with a large ambition.', '', 4),
  ('about', 'cta', 'Ready to get started?', 'Join thousands of communities already on Tirbeo.', 5);

-- Features (for the home page features section)
INSERT INTO features (section_id, icon, title, description, sort_order) VALUES
  ((SELECT id FROM sections WHERE page_slug='home' AND type='features' LIMIT 1), 'MessageCircle', 'Real-time Chat', 'Instant messaging with threads, reactions, and rich embeds.', 0),
  ((SELECT id FROM sections WHERE page_slug='home' AND type='features' LIMIT 1), 'Users', 'Community Hub', 'Create and manage communities with custom roles and permissions.', 1),
  ((SELECT id FROM sections WHERE page_slug='home' AND type='features' LIMIT 1), 'Shield', 'Moderation Tools', 'Keep your community safe with powerful moderation and auto-moderation.', 2),
  ((SELECT id FROM sections WHERE page_slug='home' AND type='features' LIMIT 1), 'Zap', 'Integrations', 'Connect your favorite tools with our extensive API and webhooks.', 3);

-- FAQ items
INSERT INTO faqs (question, answer, category, sort_order) VALUES
  ('What is Tirbeo?', 'Tirbeo is a modern workspace designed for communities. It brings together chat, collaboration tools, and community management in one place.', 'General', 0),
  ('Is Tirbeo free?', 'Tirbeo offers a free tier with essential features. Premium plans unlock advanced moderation, integrations, and analytics.', 'Pricing', 1),
  ('Can I integrate Tirbeo with other tools?', 'Yes! Tirbeo provides a comprehensive API and webhooks. You can connect with Slack, Discord, GitHub, and more.', 'Technical', 2),
  ('How do I create a community?', 'Simply sign up, create your community, and invite members. The whole process takes less than 5 minutes.', 'Getting Started', 3),
  ('Is my data secure?', 'Absolutely. Tirbeo uses end-to-end encryption for messages and follows industry best practices for data security.', 'Security', 4);

-- Pricing plans
INSERT INTO pricing_plans (name, description, price_monthly, price_yearly, features, cta_label, is_popular, sort_order) VALUES
  ('Starter', 'Perfect for small communities getting started.', 0, 0, '["Up to 100 members", "Basic chat", "1 community", "Standard support"]', 'Get Started Free', false, 0),
  ('Pro', 'For growing communities that need more power.', 12, 120, '["Up to 1,000 members", "Advanced chat with threads", "5 communities", "Priority support", "Custom roles", "Analytics"]', 'Start Free Trial', true, 1),
  ('Enterprise', 'For large organizations with advanced needs.', 49, 490, '["Unlimited members", "All Pro features", "Unlimited communities", "Dedicated support", "Custom integrations", "SLA guarantee"]', 'Contact Sales', false, 2);

-- Timeline events
INSERT INTO timeline_events (year, event, description, sort_order) VALUES
  ('2024', 'The idea is born', 'A small team of engineers and designers came together with a shared vision: build the ultimate community platform.', 0),
  ('2025', 'First prototype', 'After months of iteration, the first working prototype was demoed to a small group of beta testers.', 1),
  ('2026', 'Public launch', 'Tirbeo opens its doors to the public, welcoming communities from around the world.', 2);

-- Team members
INSERT INTO team_members (name, role, bio, color, sort_order) VALUES
  ('Alex Rivera', 'CEO & Co-Founder', 'Building the future of online communities.', '#6366f1', 0),
  ('Sarah Chen', 'CTO & Co-Founder', 'Turning complex systems into elegant solutions.', '#8b5cf6', 1),
  ('Marcus Johnson', 'Head of Design', 'Crafting experiences that feel like home.', '#ec4899', 2),
  ('Priya Patel', 'Head of Community', 'Bringing people together, one conversation at a time.', '#f59e0b', 3);
