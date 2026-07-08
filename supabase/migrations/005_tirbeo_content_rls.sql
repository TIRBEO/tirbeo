-- RLS Policies for Content Tables
-- Run after 004_tirbeo_content.sql

-- ============================================
-- Subscribers RLS
-- ============================================
ALTER TABLE tirbeo.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public newsletter signup)
CREATE POLICY "Anyone can subscribe"
  ON tirbeo.subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view subscribers"
  ON tirbeo.subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'moderator', 'editor')
    )
  );

-- Only super_admins can update/delete subscribers
CREATE POLICY "Super admins can manage subscribers"
  ON tirbeo.subscribers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete subscribers"
  ON tirbeo.subscribers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- ============================================
-- Site Config RLS
-- ============================================
ALTER TABLE tirbeo.site_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read site config (public)
CREATE POLICY "Anyone can view site config"
  ON tirbeo.site_config
  FOR SELECT
  TO anon
  USING (true);

-- Only admins can modify site config
CREATE POLICY "Admins can update site config"
  ON tirbeo.site_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update site config"
  ON tirbeo.site_config
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Demo Content RLS
-- ============================================
ALTER TABLE tirbeo.demo_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read active demo content
CREATE POLICY "Anyone can view active demo content"
  ON tirbeo.demo_content
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Only admins can modify demo content
CREATE POLICY "Admins can manage demo content"
  ON tirbeo.demo_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid()
    )
  );
