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
  logoUrl?: string;
  linkColumns?: { title: string; links: { label: string; href: string }[] }[];
}

export interface StageItem {
  label: string;
  color: string;
  heading: string;
  body: string;
}

export interface FeaturesConfig {
  headline: string;
  subtitle: string;
  items: FeatureItem[];
  stages?: StageItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqConfig {
  heading?: string;
  subheading?: string;
  items?: FaqItem[];
}

export interface PreloaderConfig {
  enabled?: boolean;
  greetings?: string;
  cycleIntervalMs?: number;
  durationMs?: number;
  textColor?: string;
  backgroundColor?: string;
}

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  favicon?: string;
}

export interface LandingConfig {
  navbar: NavbarConfig;
  hero: HeroConfig;
  about: AboutConfig;
  features: FeaturesConfig;
  newsletter: NewsletterConfig;
  footer: FooterConfig;
  faq?: FaqConfig;
  preloader?: PreloaderConfig;
  seo?: SeoConfig;
}

const DEFAULTS: LandingConfig = {
  navbar: {
    siteName: 'Tirbeo',
    logoUrl: '',
    ctaText: 'Get Started',
    ctaUrl: '/login',
    dropdowns: [
      { label: 'Products', items: [{ label: 'Tirbeo Chat', description: 'Real-time messaging', link: '/login' }] },
      { label: 'Solutions', items: [
        { label: 'For Developers', description: 'Open source collaboration', link: '/login' },
        { label: 'For Designers', description: 'Feedback rounds', link: '/login' },
        { label: 'For Educators', description: 'Student communities', link: '/login' },
        { label: 'For Startups', description: 'Async updates', link: '/login' },
      ]},
      { label: 'Resources', items: [
        { label: 'Documentation', description: 'Complete guides', link: '/login' },
        { label: 'Help Center', description: 'FAQs', link: '/login' },
        { label: 'Blog', description: 'Updates', link: '/login' },
        { label: 'Changelog', description: "What's new", link: '/login' },
      ]},
      { label: 'About', items: [
        { label: 'Our Story', description: 'The journey', link: '/login' },
        { label: 'Team', description: 'Meet the people', link: '/login' },
        { label: 'Careers', description: 'Join us', link: '/login' },
        { label: 'Contact', description: 'Get in touch', link: '/login' },
      ]},
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
    bgImage: '',
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

const SECTIONS: (keyof LandingConfig)[] = ['navbar', 'hero', 'about', 'features', 'newsletter', 'footer', 'faq', 'preloader', 'seo'];

export async function fetchLandingConfig(): Promise<LandingConfig> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-tirbeo.vercel.app';
    const res = await fetch(`${apiUrl}/api/public/landing-config`, { next: { revalidate: 30 } });
    if (res.ok) {
      const raw = await res.json();
      const merged = { ...DEFAULTS };
      for (const key of SECTIONS) {
        if (raw[key] && typeof raw[key] === 'object') {
          (merged as any)[key] = { ...merged[key], ...raw[key] };
        }
      }
      return merged;
    }
  } catch {}
  return DEFAULTS;
}

export const getLandingConfig = fetchLandingConfig;
