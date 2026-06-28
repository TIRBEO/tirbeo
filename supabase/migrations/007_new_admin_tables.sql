-- Run this in Main DB Dashboard SQL Editor (mvogfnbqpaiedkkslecn)

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author_name TEXT DEFAULT 'Admin',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read published posts"
    ON public.blog_posts FOR SELECT
    USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage posts"
    ON public.blog_posts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- App configs table (for per-app settings)
CREATE TABLE IF NOT EXISTS public.app_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT UNIQUE NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read app_configs"
    ON public.app_configs FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can write app_configs"
    ON public.app_configs FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can read active announcements" ON public.announcements FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Content approval queue
CREATE TABLE IF NOT EXISTS public.content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID,
  title TEXT NOT NULL,
  submitted_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admins can manage approvals" ON public.content_approvals FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
