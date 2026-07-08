import { fetchFromSupabase } from "./supabase";

export type SiteConfig = {
  hero: {
    headline1: string;
    headline2: string;
    headline2Gradient: string;
    subtitle: string;
    cta1Text: string;
    cta1Url: string;
    cta2Text: string;
    cta2Url: string;
    bgImage: string;
    scrollText: string;
  };
  about: {
    headline: string;
    headlineGradient: string;
    paragraphs: string[];
    textColor: string;
  };
  features: {
    headline: string;
    subtitle: string;
    items: { label: string; desc: string }[];
  };
  newsletter: {
    badge: string;
    headline: string;
    subtext: string;
    placeholder: string;
    buttonLabel: string;
    disclaimer: string;
    accentColor: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    showNewsletterForm: boolean;
  };
};

const defaultConfig: SiteConfig = {
  hero: {
    headline1: "One platform.",
    headline2: "Infinite possibilities.",
    headline2Gradient: "#fff,#F97316,#F25604",
    subtitle:
      "Connect with people who inspire you, share the moments that matter, and become part of communities that make the internet feel personal again.",
    cta1Text: "Join the platform",
    cta1Url: "/login",
    cta2Text: "Explore the platform",
    cta2Url: "#about",
    bgImage: "/bgpc.png",
    scrollText: "Scroll to explore",
  },
  about: {
    headline: "Built for meaningful connection",
    headlineGradient: "#F97316,#F25604",
    paragraphs: [
      "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome.",
      "Every feature is designed with people first. Whether you are discovering local communities, meeting like-minded individuals, or sharing your own ideas with the world, Tirbeo provides a clean, distraction-free space.",
      "We prioritize privacy, performance, and simplicity above all else. From end-to-end secure messaging to a blazing-fast experience on every device, Tirbeo is engineered to be reliable, intuitive, and respectful of your time.",
      "Our mission is straightforward: create a platform where people connect because they genuinely want to, not because an algorithm tells them to.",
    ],
    textColor: "#F97316",
  },
  features: {
    headline: "Built with purpose",
    subtitle: "Every feature is designed to foster genuine connection — not to keep you hooked.",
    items: [
      { label: "Real-time Chat", desc: "Instant messaging with end-to-end encryption" },
      { label: "Community Spaces", desc: "Create and join topic-based communities" },
      { label: "Voice Channels", desc: "Crystal-clear voice conversations" },
      { label: "Media Sharing", desc: "Share photos, videos, and files securely" },
      { label: "Smart Notifications", desc: "Stay informed without the noise" },
      { label: "Profile Customization", desc: "Express yourself with custom profiles" },
    ],
  },
  newsletter: {
    badge: "Newsletter",
    headline: "Never miss an update",
    subtext: "Subscribe for launch announcements, feature drops, and exclusive early access.",
    placeholder: "Enter your email",
    buttonLabel: "Subscribe",
    disclaimer: "No spam. Unsubscribe anytime.",
    accentColor: "#F97316",
  },
  footer: {
    tagline: "Connecting communities through meaningful conversations, real-time collaboration, and shared experiences.",
    copyright: "All rights reserved.",
    showNewsletterForm: true,
  },
};

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const result = await fetchFromSupabase("site_config", {
      select: "config",
      eq: ["app", "landing"],
      single: true,
      schema: "public",
    });

    if (!result?.config) {
      console.warn("Site config not found in Supabase, using defaults");
      return defaultConfig;
    }

    return mergeConfig(defaultConfig, result.config as Partial<SiteConfig>);
  } catch (e) {
    console.warn("Site config fetch error, using defaults:", e);
    return defaultConfig;
  }
}

function mergeConfig(defaults: SiteConfig, overrides: Partial<SiteConfig>): SiteConfig {
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof SiteConfig)[]) {
    if (overrides[key] && typeof overrides[key] === "object" && !Array.isArray(overrides[key])) {
      result[key] = { ...(defaults[key] as any), ...(overrides[key] as any) };
    } else if (overrides[key] !== undefined) {
      (result as any)[key] = overrides[key];
    }
  }
  return result;
}
