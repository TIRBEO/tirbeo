-- Tirbeo Core Schema
-- Run this in your Supabase SQL Editor

CREATE SCHEMA IF NOT EXISTS tirbeo;

-- 1. Districts of Nepal (Foundation for Localization)
CREATE TABLE tirbeo.districts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  province INTEGER NOT NULL CHECK (province BETWEEN 1 AND 7)
);

-- 2. Profiles (Extends Supabase Auth Users)
CREATE TABLE tirbeo.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  district_id INTEGER REFERENCES tirbeo.districts(id),
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  karma_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Admin Roles (Who can access Tirbeo Admin?)
CREATE TABLE tirbeo.admin_users (
  user_id UUID REFERENCES tirbeo.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('super_admin', 'moderator', 'editor')) DEFAULT 'editor',
  assigned_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Audit Log (Security for Production)
CREATE TABLE tirbeo.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for Profiles
ALTER PUBLICATION supabase_realtime ADD TABLE tirbeo.profiles;

-- Indexes for performance
CREATE INDEX idx_profiles_username ON tirbeo.profiles(username);
CREATE INDEX idx_profiles_district ON tirbeo.profiles(district_id);
CREATE INDEX idx_audit_logs_actor ON tirbeo.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON tirbeo.audit_logs(created_at DESC);
CREATE INDEX idx_districts_province ON tirbeo.districts(province);
