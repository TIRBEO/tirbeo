import { supabase } from "./supabase";

export interface SiteConfig {
  site_name: string;
  tagline: string | null;
  logo_url: string;
  seo_title: string;
  seo_description: string;
  social_links: Record<string, string>;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  sort_order: number;
}

export interface Section {
  id: string;
  page_slug: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  sort_order: number;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string | null;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string | null;
  avatar_url: string | null;
  sort_order: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string;
  features: string[];
  cta_label: string;
  cta_href: string | null;
  is_popular: boolean;
  sort_order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
}

export interface FooterSection {
  id: string;
  title: string;
  sort_order: number;
  links: { id: string; label: string; href: string }[];
}

export interface TimelineEvent {
  id: string;
  year: string;
  event: string;
  description: string | null;
  sort_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  color: string | null;
  social_links: Record<string, string>;
  sort_order: number;
}

// -- Fetchers --
export async function getSiteConfig(): Promise<SiteConfig | null> {
  const { data } = await supabase.from("site_config").select("*").single();
  return data;
}

export async function getSections(pageSlug: string): Promise<Section[]> {
  const { data } = await supabase
    .from("sections")
    .select("*")
    .eq("page_slug", pageSlug)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Section[]) || [];
}

export async function getFeatures(sectionId: string): Promise<Feature[]> {
  const { data } = await supabase
    .from("features")
    .select("*")
    .eq("section_id", sectionId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Feature[]) || [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Testimonial[]) || [];
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as PricingPlan[]) || [];
}

export async function getFAQs(): Promise<FAQ[]> {
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as FAQ[]) || [];
}

export async function getNavLinks(): Promise<NavLink[]> {
  const { data } = await supabase
    .from("nav_links")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as NavLink[]) || [];
}

export async function getFooterTree(): Promise<FooterSection[]> {
  const { data: sections } = await supabase.from("footer_sections").select("*").order("sort_order", { ascending: true });
  const { data: links } = await supabase.from("footer_links").select("*").eq("is_active", true).order("sort_order", { ascending: true });
  if (!sections) return [];
  return sections.map((s) => ({
    ...s,
    links: (links || []).filter((l: { section_id: string; id: string; label: string; href: string }) => l.section_id === s.id).map(({ id, label, href }: { id: string; label: string; href: string }) => ({ id, label, href })),
  }));
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const { data } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as TimelineEvent[]) || [];
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as TeamMember[]) || [];
}
