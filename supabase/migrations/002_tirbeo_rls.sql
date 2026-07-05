-- Row Level Security for Tirbeo Core
-- Run after 001_tirbeo_schema.sql

-- Enable RLS on all tables
ALTER TABLE tirbeo.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tirbeo.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tirbeo.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tirbeo.audit_logs ENABLE ROW LEVEL SECURITY;

-- Districts: readable by all, writable by super_admin only
CREATE POLICY "Districts are publicly readable"
  ON tirbeo.districts FOR SELECT
  USING (true);

CREATE POLICY "Districts are manageable by super_admin"
  ON tirbeo.districts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Profiles are publicly readable"
  ON tirbeo.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON tirbeo.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON tirbeo.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin Users: only super_admin can manage
CREATE POLICY "Admin users are readable by authenticated"
  ON tirbeo.admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users are manageable by super_admin"
  ON tirbeo.admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Audit Logs: insertable by all, readable by admins
CREATE POLICY "Audit logs are insertable by authenticated"
  ON tirbeo.audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Audit logs are readable by admins"
  ON tirbeo.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tirbeo.admin_users
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'moderator')
    )
  );
