export interface NavbarConfig {
  siteName: string;
  logoUrl: string;
  ctaText: string;
  ctaUrl: string;
  dropdowns: { label: string; items: { label: string; description: string; link: string }[] }[];
}

export interface HeroConfig {
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
}

export interface AboutConfig {
  headline: string;
  headlineGradient: string;
  paragraphs: string[];
  textColor: string;
}

export interface FeatureItem {
  label: string;
  desc: string;
  color?: string;
}

export interface FeaturesConfig {
  headline: string;
  subtitle: string;
  items: FeatureItem[];
}

export interface NewsletterConfig {
  badge: string;
  headline: string;
  subtext: string;
  placeholder: string;
  buttonLabel: string;
  disclaimer: string;
  accentColor: string;
}

export interface FooterConfig {
  tagline: string;
  copyright: string;
  showNewsletterForm: boolean;
}

export interface LandingConfig {
  navbar: NavbarConfig;
  hero: HeroConfig;
  about: AboutConfig;
  features: FeaturesConfig;
  newsletter: NewsletterConfig;
  footer: FooterConfig;
}

const DEFAULTS: LandingConfig = {
  navbar: {
    siteName: 'Tirbeo',
    logoUrl: '',
    ctaText: 'Get Started',
    ctaUrl: '/login',
    dropdowns: [
      { label: 'Products', items: [{ label: 'Tirbeo Chat', description: 'Real-time messaging', link: '/chat' }] },
      { label: 'Solutions', items: [{ label: 'For Developers', description: 'Open source collaboration', link: '/solutions' }] },
    ],
  },
  hero: {
    headline1: 'One platform.',
    headline2: 'Infinite possibilities.',
    headline2Gradient: '#fff,#F97316,#F25604',
    subtitle: 'Connect with people who inspire you, share the moments that matter, and become part of communities that make the internet feel personal again.',
    cta1Text: 'Join the platform',
    cta1Url: '/login',
    cta2Text: 'Explore the platform',
    cta2Url: '#about',
    bgImage: '/bgpc.png',
    scrollText: 'Scroll to explore',
  },
  about: {
    headline: 'Built for meaningful connection',
    headlineGradient: '#F97316,#F25604',
    paragraphs: ['Tirbeo is built to make social networking feel personal again.'],
    textColor: '#F97316',
  },
  features: {
    headline: 'Built with purpose',
    subtitle: 'Every feature is designed to foster genuine connection.',
    items: [],
  },
  newsletter: {
    badge: 'Newsletter',
    headline: 'Never miss an update',
    subtext: 'Subscribe for launch announcements.',
    placeholder: 'Enter your email',
    buttonLabel: 'Subscribe',
    disclaimer: 'No spam. Unsubscribe anytime.',
    accentColor: '#F97316',
  },
  footer: {
    tagline: 'Connecting communities.',
    copyright: 'All rights reserved.',
    showNewsletterForm: true,
  },
};

export async function fetchLandingConfig(): Promise<LandingConfig> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-tirbeo.vercel.app';
    const res = await fetch(`${apiUrl}/api/public/landing`, { next: { revalidate: 30 } });
    if (res.ok) {
      const raw = await res.json();
      return { ...DEFAULTS, ...raw };
    }
  } catch {}
  return DEFAULTS;
}
