-- Run this in Apps DB Dashboard SQL Editor (cvbtbwmkjdocrjnohzgb)
-- Removes admin/config tables that now live in Main DB

DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.site_config CASCADE;
DROP TABLE IF EXISTS public.nav_links CASCADE;
DROP TABLE IF EXISTS public.footer_sections CASCADE;
DROP TABLE IF EXISTS public.footer_links CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.features CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.pricing_plans CASCADE;
DROP TABLE IF EXISTS public.doc_categories CASCADE;
DROP TABLE IF EXISTS public.doc_articles CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
