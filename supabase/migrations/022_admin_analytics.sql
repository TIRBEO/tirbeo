-- ============================================================
-- Tirbeo Admin Analytics — Migration 022
-- Visitor tracking, daily metrics, chart data RPCs
-- ============================================================

-- 1. PAGE VIEWS (individual page visits)
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON public.page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read page_views" ON public.page_views;
CREATE POLICY "Admins read page_views" ON public.page_views
  FOR SELECT USING (admin_role_at_least(auth.uid(), 'viewer'));

-- 2. DAILY METRICS (pre-aggregated)
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  visitors INT DEFAULT 0,
  page_views INT DEFAULT 0,
  unique_pages INT DEFAULT 0,
  registrations INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_metrics(date DESC);

ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read daily_metrics" ON public.daily_metrics;
CREATE POLICY "Admins read daily_metrics" ON public.daily_metrics
  FOR SELECT USING (admin_role_at_least(auth.uid(), 'viewer'));

-- 3. RPC: Get daily visitors
CREATE OR REPLACE FUNCTION public.get_daily_visitors(days INT DEFAULT 30)
RETURNS TABLE(date DATE, count BIGINT)
LANGUAGE SQL STABLE
AS $$
  SELECT d.date::DATE, COALESCE(pv.cnt, 0)::BIGINT
  FROM generate_series(CURRENT_DATE - days + 1, CURRENT_DATE, '1 day'::INTERVAL) d(date)
  LEFT JOIN (
    SELECT created_at::DATE as dt, COUNT(DISTINCT visitor_id) as cnt
    FROM public.page_views
    WHERE created_at >= CURRENT_DATE - days
    GROUP BY created_at::DATE
  ) pv ON d.date = pv.dt
  ORDER BY d.date;
$$;

-- 4. RPC: Get daily page views
CREATE OR REPLACE FUNCTION public.get_daily_page_views(days INT DEFAULT 30)
RETURNS TABLE(date DATE, count BIGINT)
LANGUAGE SQL STABLE
AS $$
  SELECT d.date::DATE, COALESCE(pv.cnt, 0)::BIGINT
  FROM generate_series(CURRENT_DATE - days + 1, CURRENT_DATE, '1 day'::INTERVAL) d(date)
  LEFT JOIN (
    SELECT created_at::DATE as dt, COUNT(*) as cnt
    FROM public.page_views
    WHERE created_at >= CURRENT_DATE - days
    GROUP BY created_at::DATE
  ) pv ON d.date = pv.dt
  ORDER BY d.date;
$$;

-- 5. RPC: Get top pages
CREATE OR REPLACE FUNCTION public.get_top_pages(days INT DEFAULT 7, max_count INT DEFAULT 10)
RETURNS TABLE(path TEXT, views BIGINT)
LANGUAGE SQL STABLE
AS $$
  SELECT pv.path, COUNT(*)::BIGINT as views
  FROM public.page_views pv
  WHERE pv.created_at >= CURRENT_DATE - days
  GROUP BY pv.path
  ORDER BY views DESC
  LIMIT max_count;
$$;

-- 6. RPC: Get visitor summary
CREATE OR REPLACE FUNCTION public.get_visitor_summary()
RETURNS TABLE(total_visitors BIGINT, total_page_views BIGINT, avg_daily NUMERIC)
LANGUAGE SQL STABLE
AS $$
  SELECT
    COUNT(DISTINCT visitor_id)::BIGINT,
    COUNT(*)::BIGINT,
    ROUND(COUNT(DISTINCT visitor_id)::NUMERIC / GREATEST(COUNT(DISTINCT created_at::DATE), 1), 1)
  FROM public.page_views;
$$;

-- 7. SEED DEMO DATA (only if tables are empty)
INSERT INTO public.page_views (path, visitor_id, created_at)
SELECT
  paths[1 + floor(random() * array_length(paths, 1))::int],
  'demo_v_' || (1 + floor(random() * 80)::int),
  (CURRENT_DATE - (random() * 30)::int)::TIMESTAMPTZ + (random() * 86400)::int * INTERVAL '1 second'
FROM (
  SELECT ARRAY['/', '/docs', '/content/navigation', '/content/pages', '/content/features', '/content/pricing', '/content/faq', '/content/testimonials', '/content/team', '/content/timeline', '/content/blog', '/content/announcements', '/content/newsletter', '/settings/auth', '/settings/email', '/admin/admins', '/admin/users', '/admin/audit-log', '/admin/system-health'] as paths
) p,
generate_series(1, 800)
WHERE NOT EXISTS (SELECT 1 FROM public.page_views LIMIT 1);

INSERT INTO public.daily_metrics (date, visitors, page_views, unique_pages)
SELECT
  d::DATE,
  (8 + floor(random() * 55))::int,
  (20 + floor(random() * 250))::int,
  (3 + floor(random() * 12))::int
FROM generate_series(CURRENT_DATE - 29, CURRENT_DATE, '1 day'::INTERVAL) d
WHERE NOT EXISTS (SELECT 1 FROM public.daily_metrics LIMIT 1)
ON CONFLICT (date) DO NOTHING;
