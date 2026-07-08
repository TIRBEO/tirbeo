-- Tirbeo Content Management Schema
-- Adds content tables that can be managed from admin panel
-- All tables have RLS policies for secure access

-- 1. Subscribers (Newsletter)
CREATE TABLE IF NOT EXISTS tirbeo.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'landing' CHECK (source IN ('landing', 'footer', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Site Configuration (Landing Page Content)
CREATE TABLE IF NOT EXISTS tirbeo.site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Demo Content (Seed data for demo/preview)
CREATE TABLE IF NOT EXISTS tirbeo.demo_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section, key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON tirbeo.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON tirbeo.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_site_config_app ON tirbeo.site_config(app);
CREATE INDEX IF NOT EXISTS idx_demo_content_section ON tirbeo.demo_content(section);

-- Enable Realtime for content tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS tirbeo.subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS tirbeo.site_config;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS tirbeo.demo_content;
