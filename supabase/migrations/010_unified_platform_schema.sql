-- ════════════════════════════════════════════════════════════
-- TIRBEO PLATFORM — Complete Schema Migration
-- Single source of truth. Replaces ALL previous migrations.
-- ════════════════════════════════════════════════════════════

-- Drop ALL old tables first (both PascalCase and snake_case)
DROP SCHEMA IF EXISTS tirbeo CASCADE;

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public'
            AND tablename IN (
              'User','Workspace','Membership','Session','Route','Log','Blocklist',
              'SiteConfig','AppRole','UserRole','Otp','SignupOtp','EmailConfig',
              'EmailTemplate','Notification','NotificationPreference','ContentReport',
              'Media','AuditEvent','RecoveryCode','Subscriber','Integration',
              'ThemeConfig','SavedTheme','users','workspaces','memberships','sessions',
              'routes','logs','blocklist','site_configs','app_roles','user_roles','otps',
              'signup_otps','email_configs','email_templates','notifications',
              'notification_preferences','content_reports','media','audit_events',
              'recovery_codes','subscribers','integrations','theme_configs',
              'districts','profiles','admin_users','audit_logs'
            )) LOOP
    EXECUTE 'DROP TABLE IF EXISTS public."' || r.tablename || '" CASCADE';
  END LOOP;
END $$;

-- Also drop old enums
DROP TYPE IF EXISTS "WorkspaceRole" CASCADE;
DROP TYPE IF EXISTS "workspace_role" CASCADE;
DROP TYPE IF EXISTS "SessionStatus" CASCADE;
DROP TYPE IF EXISTS "ReportStatus" CASCADE;
DROP TYPE IF EXISTS "Severity" CASCADE;

-- ════════════════════════════════════════════════════════════
-- ENUMS
-- ════════════════════════════════════════════════════════════

CREATE TYPE workspace_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');
CREATE TYPE severity_level AS ENUM ('info', 'warning', 'error', 'critical');

-- ════════════════════════════════════════════════════════════
-- CORE USER
-- ════════════════════════════════════════════════════════════

CREATE TABLE users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL DEFAULT '',
  name            TEXT,
  photo_url       TEXT,
  bio             TEXT,

  -- Identity & contacts
  secondary_email TEXT,
  phone_number    TEXT,
  phone_verified  BOOLEAN DEFAULT false,
  email_verified  BOOLEAN DEFAULT false,
  gender          TEXT,
  birthday        TIMESTAMPTZ,

  -- OAuth links
  google_id       TEXT UNIQUE,
  github_id       TEXT UNIQUE,

  -- Work
  occupation      TEXT,
  company_name    TEXT,
  company_role    TEXT,
  industry        TEXT,
  company_size    TEXT,

  -- Social links
  website         TEXT,
  linkedin        TEXT,
  github_username TEXT,
  twitter         TEXT,

  -- Locale
  country         TEXT,
  timezone        TEXT,
  language        TEXT DEFAULT 'en',

  -- Preferences
  theme           TEXT DEFAULT 'system',
  date_format     TEXT DEFAULT 'MM/DD/YYYY',
  time_format     TEXT DEFAULT '12h',
  font_size       TEXT DEFAULT 'default',
  reduce_motion   BOOLEAN DEFAULT false,
  high_contrast   BOOLEAN DEFAULT false,
  preferences     JSONB DEFAULT '{}',

  -- Security
  totp_secret     TEXT,
  is_2fa_enabled  BOOLEAN DEFAULT false,
  is_banned       BOOLEAN DEFAULT false,
  is_suspended    BOOLEAN DEFAULT false,
  suspend_reason  TEXT,
  suspended_until TIMESTAMPTZ,

  -- Status
  admin_role      TEXT,
  last_active_at  TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  last_login_ip   TEXT,
  login_count     INTEGER DEFAULT 0,

  -- Gamification
  karma_points    INTEGER DEFAULT 0,
  is_verified     BOOLEAN DEFAULT false,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_admin_role ON users(admin_role);
CREATE INDEX idx_users_last_active ON users(last_active_at);
CREATE INDEX idx_users_is_banned ON users(is_banned);
CREATE INDEX idx_users_created ON users(created_at);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_github_id ON users(github_id);

-- ════════════════════════════════════════════════════════════
-- MULTI-PASSWORD
-- ════════════════════════════════════════════════════════════

CREATE TABLE user_passwords (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label          TEXT NOT NULL DEFAULT 'default',
  password_hash  TEXT NOT NULL,
  is_primary     BOOLEAN DEFAULT false,
  last_used_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_passwords_user ON user_passwords(user_id);

-- ════════════════════════════════════════════════════════════
-- USER SETTINGS
-- ════════════════════════════════════════════════════════════

CREATE TABLE user_settings (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id           TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  email_digest      TEXT DEFAULT 'daily',
  digest_time       TEXT DEFAULT '08:00',
  mention_notif     BOOLEAN DEFAULT true,
  comment_notif     BOOLEAN DEFAULT true,
  report_notif      BOOLEAN DEFAULT true,
  system_notif      BOOLEAN DEFAULT true,
  marketing_notif   BOOLEAN DEFAULT false,
  push_enabled      BOOLEAN DEFAULT true,
  sound_enabled     BOOLEAN DEFAULT true,

  profile_visibility TEXT DEFAULT 'public',
  show_online_status BOOLEAN DEFAULT true,
  show_last_seen     BOOLEAN DEFAULT true,
  allow_mentions     BOOLEAN DEFAULT true,
  allow_dms          BOOLEAN DEFAULT true,

  sidebar_collapsed  BOOLEAN DEFAULT false,
  default_page       TEXT DEFAULT '/dashboard',
  compact_mode       BOOLEAN DEFAULT false,

  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- DISTRICTS (Nepal)
-- ════════════════════════════════════════════════════════════

CREATE TABLE districts (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  province  INTEGER NOT NULL
);

CREATE INDEX idx_districts_province ON districts(province);

-- ════════════════════════════════════════════════════════════
-- SESSIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE sessions (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token        TEXT,
  status       session_status DEFAULT 'active',
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  user_agent   TEXT,
  ip_address   TEXT,
  location     TEXT,
  device_name  TEXT,
  revoked_at   TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ════════════════════════════════════════════════════════════
-- WORKSPACES
-- ════════════════════════════════════════════════════════════

CREATE TABLE workspaces (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_id    TEXT NOT NULL REFERENCES users(id),
  is_public   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

CREATE TABLE memberships (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role         workspace_role DEFAULT 'MEMBER',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

CREATE INDEX idx_memberships_workspace ON memberships(workspace_id);

CREATE TABLE workspace_invites (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          workspace_role DEFAULT 'MEMBER',
  invited_by_id TEXT NOT NULL REFERENCES users(id),
  token         TEXT NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspace_invites_workspace ON workspace_invites(workspace_id);
CREATE INDEX idx_workspace_invites_email ON workspace_invites(email);
CREATE INDEX idx_workspace_invites_token ON workspace_invites(token);

-- ════════════════════════════════════════════════════════════
-- AUTH: OTP, RECOVERY, CONNECTED ACCOUNTS, PASSWORD RESET
-- ════════════════════════════════════════════════════════════

CREATE TABLE otps (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  otp_hash   TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otps_user ON otps(user_id);
CREATE INDEX idx_otps_type ON otps(type);
CREATE INDEX idx_otps_expires ON otps(expires_at);

CREATE TABLE signup_otps (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email      TEXT NOT NULL,
  otp_hash   TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signup_otps_email ON signup_otps(email);
CREATE INDEX idx_signup_otps_expires ON signup_otps(expires_at);

CREATE TABLE recovery_codes (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  used       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at    TIMESTAMPTZ
);

CREATE INDEX idx_recovery_codes_user ON recovery_codes(user_id);
CREATE INDEX idx_recovery_codes_code ON recovery_codes(code);

CREATE TABLE connected_accounts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  provider_id   TEXT NOT NULL,
  email         TEXT,
  name          TEXT,
  photo_url     TEXT,
  access_token  TEXT,
  refresh_token TEXT,
  expires_at    TIMESTAMPTZ,
  scope         TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_connected_accounts_user ON connected_accounts(user_id);
CREATE INDEX idx_connected_accounts_provider ON connected_accounts(provider);

CREATE TABLE password_reset_tokens (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);

-- ════════════════════════════════════════════════════════════
-- ROLES & PERMISSIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE app_roles (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  color       TEXT DEFAULT '#4f7aff',
  icon        TEXT DEFAULT 'shield',
  is_system   BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_roles_name ON app_roles(name);

CREATE TABLE user_roles (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id        TEXT NOT NULL REFERENCES app_roles(id) ON DELETE CASCADE,
  assigned_by_id TEXT REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ════════════════════════════════════════════════════════════
-- API ROUTING, KEYS, RATE LIMITING
-- ════════════════════════════════════════════════════════════

CREATE TABLE routes (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  path           TEXT NOT NULL,
  method         TEXT NOT NULL DEFAULT 'GET',
  target         TEXT,
  description    TEXT,
  allowed_roles  TEXT[] DEFAULT ARRAY['member'],
  internal       BOOLEAN DEFAULT false,
  enabled        BOOLEAN DEFAULT true,
  rate_limit     INTEGER,
  cache_ttl      INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(path, method)
);

CREATE TABLE api_keys (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  key_hash    TEXT NOT NULL UNIQUE,
  key_prefix  TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at  TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

CREATE TABLE rate_limit_entries (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key        TEXT NOT NULL,
  window     TEXT NOT NULL,
  count      INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(key, window)
);

CREATE INDEX idx_rate_limit_key ON rate_limit_entries(key);
CREATE INDEX idx_rate_limit_expires ON rate_limit_entries(expires_at);

-- ════════════════════════════════════════════════════════════
-- LOGGING & AUDIT
-- ════════════════════════════════════════════════════════════

CREATE TABLE logs (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ip         TEXT,
  method     TEXT NOT NULL,
  path       TEXT NOT NULL,
  user_id    TEXT,
  status     INTEGER,
  duration   INTEGER,
  size       INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_created ON logs(created_at);
CREATE INDEX idx_logs_ip ON logs(ip);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_path ON logs(path);

CREATE TABLE audit_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  actor_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  metadata    JSONB DEFAULT '{}',
  severity    severity_level DEFAULT 'info',
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_action ON audit_events(action);
CREATE INDEX idx_audit_events_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_events_target ON audit_events(target_type, target_id);
CREATE INDEX idx_audit_events_severity ON audit_events(severity);
CREATE INDEX idx_audit_events_created ON audit_events(created_at);

CREATE TABLE security_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  location    TEXT,
  metadata    JSONB DEFAULT '{}',
  severity    severity_level DEFAULT 'info',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created ON security_events(created_at);

CREATE TABLE blocklist (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type        TEXT NOT NULL DEFAULT 'ip',
  value       TEXT NOT NULL,
  reason      TEXT,
  added_by_id TEXT REFERENCES users(id),
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(type, value)
);

CREATE INDEX idx_blocklist_type ON blocklist(type);
CREATE INDEX idx_blocklist_value ON blocklist(value);
CREATE INDEX idx_blocklist_expires ON blocklist(expires_at);

-- ════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,
  icon        TEXT,
  priority    TEXT DEFAULT 'normal',
  read        BOOLEAN DEFAULT false,
  read_at     TIMESTAMPTZ,
  email_sent  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

CREATE TABLE notification_preferences (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_digest    TEXT DEFAULT 'daily',
  digest_time     TEXT DEFAULT '08:00',
  mention         BOOLEAN DEFAULT true,
  comment         BOOLEAN DEFAULT true,
  report          BOOLEAN DEFAULT true,
  system          BOOLEAN DEFAULT true,
  marketing       BOOLEAN DEFAULT false,
  security        BOOLEAN DEFAULT true,
  product         BOOLEAN DEFAULT true,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- EMAIL SYSTEM
-- ════════════════════════════════════════════════════════════

CREATE TABLE email_configs (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  provider   TEXT DEFAULT 'resend',
  api_key    TEXT,
  smtp_host  TEXT,
  smtp_port  INTEGER,
  smtp_user  TEXT,
  smtp_pass  TEXT,
  from_email TEXT DEFAULT 'noreply@tirbeo.app',
  from_name  TEXT DEFAULT 'Tirbeo',
  enabled    BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_templates (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  html_body  TEXT NOT NULL,
  variables  JSONB DEFAULT '[]',
  from_email TEXT,
  from_name  TEXT,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_logs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  template_id TEXT,
  to_email    TEXT NOT NULL,
  from_email  TEXT NOT NULL,
  subject     TEXT NOT NULL,
  status      TEXT DEFAULT 'queued',
  provider_id TEXT,
  error       TEXT,
  metadata    JSONB DEFAULT '{}',
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_logs_to ON email_logs(to_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at);

-- ════════════════════════════════════════════════════════════
-- CONTENT MODERATION
-- ════════════════════════════════════════════════════════════

CREATE TABLE content_reports (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  reporter_id    TEXT NOT NULL REFERENCES users(id),
  target_type    TEXT NOT NULL,
  target_id      TEXT NOT NULL,
  reason         TEXT NOT NULL,
  description    TEXT,
  status         report_status DEFAULT 'pending',
  priority       TEXT DEFAULT 'normal',
  reviewed_by_id TEXT REFERENCES users(id),
  reviewed_at    TIMESTAMPTZ,
  action         TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_target ON content_reports(target_type, target_id);
CREATE INDEX idx_content_reports_created ON content_reports(created_at);

-- ════════════════════════════════════════════════════════════
-- MEDIA LIBRARY
-- ════════════════════════════════════════════════════════════

CREATE TABLE media (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  file_name      TEXT NOT NULL,
  original_name  TEXT,
  file_size      INTEGER NOT NULL,
  mime_type      TEXT NOT NULL,
  url            TEXT NOT NULL,
  storage_path   TEXT,
  thumbnail      TEXT,
  alt_text       TEXT,
  caption        TEXT,
  width          INTEGER,
  height         INTEGER,
  duration       INTEGER,
  uploaded_by    TEXT NOT NULL REFERENCES users(id),
  folder         TEXT DEFAULT 'general',
  tags           JSONB DEFAULT '[]',
  is_public      BOOLEAN DEFAULT true,
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_mime ON media(mime_type);
CREATE INDEX idx_media_uploaded ON media(uploaded_by);
CREATE INDEX idx_media_created ON media(created_at);

-- ════════════════════════════════════════════════════════════
-- INTEGRATIONS & WEBHOOKS
-- ════════════════════════════════════════════════════════════

CREATE TABLE integrations (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  connected     BOOLEAN DEFAULT false,
  access_token  TEXT,
  refresh_token TEXT,
  expires_at    TIMESTAMPTZ,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_integrations_user ON integrations(user_id);

CREATE TABLE webhooks (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  url               TEXT NOT NULL,
  secret            TEXT NOT NULL,
  events            JSONB DEFAULT '[]',
  is_active         BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  fail_count        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_user ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);

CREATE TABLE webhook_deliveries (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  webhook_id TEXT NOT NULL,
  event      TEXT NOT NULL,
  payload    JSONB NOT NULL,
  status     TEXT DEFAULT 'pending',
  response   TEXT,
  duration   INTEGER,
  retries    INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at);

-- ════════════════════════════════════════════════════════════
-- FEATURE FLAGS
-- ════════════════════════════════════════════════════════════

CREATE TABLE feature_flags (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key          TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN DEFAULT false,
  rollout_pct  INTEGER DEFAULT 100,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_active ON feature_flags(is_active);

CREATE TABLE user_feature_flags (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flag_id    TEXT NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, flag_id)
);

CREATE INDEX idx_user_feature_flags_user ON user_feature_flags(user_id);
CREATE INDEX idx_user_feature_flags_flag ON user_feature_flags(flag_id);

-- ════════════════════════════════════════════════════════════
-- SYSTEM CONFIG & SITE CONFIG
-- ════════════════════════════════════════════════════════════

CREATE TABLE system_configs (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key        TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL,
  category   TEXT DEFAULT 'general',
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_configs_key ON system_configs(key);
CREATE INDEX idx_system_configs_category ON system_configs(category);

CREATE TABLE site_configs (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  app        TEXT NOT NULL UNIQUE,
  config     JSONB NOT NULL DEFAULT '{}',
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_configs_app ON site_configs(app);

-- ════════════════════════════════════════════════════════════
-- THEMES
-- ════════════════════════════════════════════════════════════

CREATE TABLE theme_configs (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name               TEXT NOT NULL UNIQUE,
  is_active          BOOLEAN DEFAULT false,
  is_default         BOOLEAN DEFAULT false,

  bg_primary         TEXT DEFAULT '#08150F',
  bg_secondary       TEXT DEFAULT '#101c13',
  bg_card            TEXT DEFAULT '#12271D',
  bg_elevated        TEXT DEFAULT '#1a3326',

  text_primary       TEXT DEFAULT '#F2EEE8',
  text_secondary     TEXT DEFAULT '#B7C6BE',
  text_muted         TEXT DEFAULT '#6b8a7a',

  accent_primary     TEXT DEFAULT '#569578',
  accent_secondary   TEXT DEFAULT '#275d46',
  accent_hover       TEXT DEFAULT '#6aab8d',

  success            TEXT DEFAULT '#59C173',
  warning            TEXT DEFAULT '#F4B942',
  error              TEXT DEFAULT '#E45D5D',

  border_color       TEXT DEFAULT 'rgba(255,255,255,0.08)',
  border_hover       TEXT DEFAULT 'rgba(255,255,255,0.14)',
  border_radius      TEXT DEFAULT '16px',

  font_primary       TEXT DEFAULT 'Inter',
  font_heading       TEXT DEFAULT 'Plus Jakarta Sans',

  logo_url           TEXT,
  brand_name         TEXT DEFAULT 'Tirbeo',
  brand_tagline      TEXT DEFAULT 'Premium Social Platform',

  light_bg_primary   TEXT,
  light_bg_secondary TEXT,
  light_text_primary TEXT,
  light_accent_primary TEXT,

  email_header_bg    TEXT DEFAULT 'linear-gradient(135deg,#022B22,#275D46,#569578)',
  email_button_color TEXT DEFAULT '#569578',
  email_text_color   TEXT DEFAULT '#B7C6BE',

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_theme_configs_active ON theme_configs(is_active);

CREATE TABLE saved_themes (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  config     JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_saved_themes_user ON saved_themes(user_id);

-- ════════════════════════════════════════════════════════════
-- NEWSLETTER / SUBSCRIBERS
-- ════════════════════════════════════════════════════════════

CREATE TABLE subscribers (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  source     TEXT DEFAULT 'landing',
  status     TEXT DEFAULT 'active',
  tags       JSONB DEFAULT '[]',
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_created ON subscribers(created_at);

-- ════════════════════════════════════════════════════════════
-- API USAGE TRACKING
-- ════════════════════════════════════════════════════════════

CREATE TABLE api_usage_logs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  api_key_id  TEXT REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint    TEXT NOT NULL,
  method      TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  duration    INTEGER,
  ip          TEXT,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_usage_user ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_apikey ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_endpoint ON api_usage_logs(endpoint);
CREATE INDEX idx_api_usage_created ON api_usage_logs(created_at);

-- ════════════════════════════════════════════════════════════
-- ACTIVITY STREAKS
-- ════════════════════════════════════════════════════════════

CREATE TABLE activity_streaks (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id          TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_active_date TIMESTAMPTZ,
  total_active_days INTEGER DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- SCHEDULED TASKS
-- ════════════════════════════════════════════════════════════

CREATE TABLE scheduled_tasks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL UNIQUE,
  handler     TEXT NOT NULL,
  cron        TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_status TEXT,
  last_error  TEXT,
  run_count   INTEGER DEFAULT 0,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_tasks_active ON scheduled_tasks(is_active);
CREATE INDEX idx_scheduled_tasks_next_run ON scheduled_tasks(next_run_at);

-- ════════════════════════════════════════════════════════════
-- DAILY STATS (aggregated analytics)
-- ════════════════════════════════════════════════════════════

CREATE TABLE daily_stats (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date           TIMESTAMPTZ NOT NULL UNIQUE,
  total_users    INTEGER DEFAULT 0,
  active_users   INTEGER DEFAULT 0,
  new_signups    INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  error_count    INTEGER DEFAULT 0,
  avg_response_ms FLOAT DEFAULT 0,
  top_endpoints  JSONB DEFAULT '[]',
  top_errors     JSONB DEFAULT '[]',
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_stats_date ON daily_stats(date);

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users: public read, own writes
CREATE POLICY "users_select_public" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::TEXT = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid()::TEXT = id);

-- Sessions: own only
CREATE POLICY "sessions_own" ON sessions FOR ALL USING (user_id = auth.uid()::TEXT);

-- Workspaces: public read if is_public, owner/admin write
CREATE POLICY "workspaces_select" ON workspaces FOR SELECT USING (is_public = true OR owner_id = auth.uid()::TEXT);
CREATE POLICY "workspaces_insert_own" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid()::TEXT);
CREATE POLICY "workspaces_update_owner" ON workspaces FOR UPDATE USING (owner_id = auth.uid()::TEXT);
CREATE POLICY "workspaces_delete_owner" ON workspaces FOR DELETE USING (owner_id = auth.uid()::TEXT);

-- Memberships: workspace members can read
CREATE POLICY "memberships_select" ON memberships FOR SELECT USING (
  workspace_id IN (SELECT workspace_id FROM memberships WHERE user_id = auth.uid()::TEXT)
  OR user_id = auth.uid()::TEXT
);

-- Notifications: own only
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (user_id = auth.uid()::TEXT);

-- Notification preferences: own only
CREATE POLICY "notif_pref_own" ON notification_preferences FOR ALL USING (user_id = auth.uid()::TEXT);

-- Content reports: own reports + admin read all
CREATE POLICY "reports_select_own_or_admin" ON content_reports FOR SELECT USING (
  reporter_id = auth.uid()::TEXT
  OR reviewed_by_id = auth.uid()::TEXT
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::TEXT AND admin_role IS NOT NULL)
);
CREATE POLICY "reports_insert_own" ON content_reports FOR INSERT WITH CHECK (reporter_id = auth.uid()::TEXT);

-- Media: public read, owner write
CREATE POLICY "media_select" ON media FOR SELECT USING (is_public = true OR uploaded_by = auth.uid()::TEXT);
CREATE POLICY "media_insert_own" ON media FOR INSERT WITH CHECK (uploaded_by = auth.uid()::TEXT);
CREATE POLICY "media_update_own" ON media FOR UPDATE USING (uploaded_by = auth.uid()::TEXT);
CREATE POLICY "media_delete_own" ON media FOR DELETE USING (uploaded_by = auth.uid()::TEXT);

-- Audit events: admin read, system insert
CREATE POLICY "audit_select_admin" ON audit_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::TEXT AND admin_role IS NOT NULL)
);
CREATE POLICY "audit_insert_system" ON audit_events FOR INSERT WITH CHECK (true);

-- Security events: own read
CREATE POLICY "security_events_own" ON security_events FOR SELECT USING (user_id = auth.uid()::TEXT);

-- Districts: public read
CREATE POLICY "districts_select" ON districts FOR SELECT USING (true);

-- Saved themes: own only
CREATE POLICY "saved_themes_own" ON saved_themes FOR ALL USING (user_id = auth.uid()::TEXT);

-- Integrations: own only
CREATE POLICY "integrations_own" ON integrations FOR ALL USING (user_id = auth.uid()::TEXT);

-- API keys: own only
CREATE POLICY "api_keys_own" ON api_keys FOR ALL USING (user_id = auth.uid()::TEXT);

-- Activity streaks: own only
CREATE POLICY "activity_streaks_own" ON activity_streaks FOR ALL USING (user_id = auth.uid()::TEXT);

-- User settings: own only
CREATE POLICY "user_settings_own" ON user_settings FOR ALL USING (user_id = auth.uid()::TEXT);

-- ════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════

-- Default theme
INSERT INTO theme_configs (name, is_active, is_default) VALUES ('raycast-dark', true, true);

-- Default system configs
INSERT INTO system_configs (key, value, category) VALUES
  ('platform.name', '"Tirbeo"', 'general'),
  ('platform.version', '"1.0.0"', 'general'),
  ('auth.signup_enabled', 'true', 'auth'),
  ('auth.otp_expiry_minutes', '10', 'auth'),
  ('auth.max_login_attempts', '5', 'auth'),
  ('auth.lockout_minutes', '15', 'auth'),
  ('api.rate_limit_per_minute', '60', 'api'),
  ('api.max_body_size_mb', '10', 'api'),
  ('email.enabled', 'true', 'email'),
  ('storage.max_upload_mb', '50', 'storage'),
  ('moderation.auto_approve', 'true', 'security');

-- 77 Districts of Nepal
INSERT INTO districts (name, province) VALUES
('Taplejung',1),('Panchthar',1),('Ilam',1),('Jhapa',1),('Morang',1),('Sunsari',1),
('Udayapur',1),('Saptari',1),('Siraha',1),('Dhanusha',1),('Mahottari',1),('Sarlahi',1),
('Rautahat',2),('Bara',2),('Parsa',2),('Chitwan',2),('Gorkha',2),('Lamjung',2),
('Tanahu',2),('Nawalparasi East',2),('Kaski',3),('Myagdi',3),('Baglung',3),
('Parvat',3),('Mustang',3),('Manang',3),('Solukhumbu',3),('Khotang',3),
('Okhaldhunga',3),('Sindhuli',3),('Dolakha',3),('Rasuwa',3),('Dhading',3),
('Nuakot',3),('Sindhupalchok',3),('Kathmandu',3),('Bhaktapur',3),('Lalitpur',3),
('Makwanpur',3),('Ramechhap',3),('Dolpa',4),('Mugu',4),('Humla',4),('Jumla',4),
('Kalikot',4),('Dailekh',4),('Jajarkot',4),('Rukum East',4),('Salyan',4),
('Rolpa',4),('Surkhet',5),('Bardiya',5),('Banke',5),('Dang',5),('Pyuthan',5),
('Rolpa West',5),('Rukum West',5),('Sindhuli East',5),('Kapilvastu',5),
('Argakhachi',5),('Gulmi',6),('Palpa',6),('Rupandehi',6),('Nawalparasi West',6),
('Syangja',6),('Tanahu South',6),('Parasi',6),('Kanchanpur',7),('Kailali',7),
('Doti',7),('Achham',7),('Darchula',7),('Baitadi',7),('Dadeldhura',7),
('Bajhang',7),('Bajura',7),('Seti',7);

-- Default email templates
INSERT INTO email_templates (name, label, subject, html_body, variables) VALUES
('signup_otp', 'Signup OTP', 'Your Tirbeo verification code: {{otp}}',
 '<div style="text-align:center;padding:40px"><h1>Tirbeo</h1><p>Your verification code is:</p><h2 style="font-size:32px;letter-spacing:8px">{{otp}}</h2><p>This code expires in 10 minutes.</p></div>',
 '["otp"]'),
('password_reset', 'Password Reset', 'Reset your Tirbeo password',
 '<div style="text-align:center;padding:40px"><h1>Tirbeo</h1><p>Click below to reset your password:</p><a href="{{resetUrl}}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px">Reset Password</a><p>This link expires in 1 hour.</p></div>',
 '["resetUrl"]'),
('welcome', 'Welcome Email', 'Welcome to Tirbeo, {{name}}!',
 '<div style="text-align:center;padding:40px"><h1>Welcome to Tirbeo!</h1><p>Hi {{name}}, your account is ready.</p><a href="{{dashboardUrl}}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px">Go to Dashboard</a></div>',
 '["name","dashboardUrl"]'),
('security_alert', 'Security Alert', 'New sign-in to your Tirbeo account',
 '<div style="text-align:center;padding:40px"><h1>Security Alert</h1><p>A new sign-in was detected:</p><p><strong>Device:</strong> {{device}}</p><p><strong>Location:</strong> {{location}}</p><p><strong>Time:</strong> {{time}}</p><p>If this wasn''t you, secure your account immediately.</p></div>',
 '["device","location","time"]');

-- Default scheduled tasks
INSERT INTO scheduled_tasks (name, handler, cron, is_active) VALUES
('cleanup_sessions', 'cleanupExpiredSessions', '0 */6 * * *', true),
('email_digest', 'sendEmailDigest', '0 8 * * *', true),
('daily_stats', 'computeDailyStats', '0 0 * * *', true),
('rate_limit_cleanup', 'cleanupRateLimits', '*/15 * * * *', true),
('streak_update', 'updateActivityStreaks', '0 1 * * *', true);

-- ════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMPS (trigger function)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_workspaces_updated BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_memberships_updated BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_app_roles_updated BEFORE UPDATE ON app_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_email_configs_updated BEFORE UPDATE ON email_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_email_templates_updated BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_content_reports_updated BEFORE UPDATE ON content_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_media_updated BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_integrations_updated BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_theme_configs_updated BEFORE UPDATE ON theme_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_saved_themes_updated BEFORE UPDATE ON saved_themes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_subscribers_updated BEFORE UPDATE ON subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_webhooks_updated BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_feature_flags_updated BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_system_configs_updated BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_site_configs_updated BEFORE UPDATE ON site_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_scheduled_tasks_updated BEFORE UPDATE ON scheduled_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_passwords_updated BEFORE UPDATE ON user_passwords FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_settings_updated BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_workspace_invites_updated BEFORE UPDATE ON workspace_invites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_activity_streaks_updated BEFORE UPDATE ON activity_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
