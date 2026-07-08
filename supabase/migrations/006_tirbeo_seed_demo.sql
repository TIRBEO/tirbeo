-- Seed Demo Content for Tirbeo Landing Page
-- Run after 004_tirbeo_content.sql and 005_tirbeo_content_rls.sql

-- ============================================
-- Site Config: Landing Page Default Content
-- ============================================
INSERT INTO tirbeo.site_config (app, config) VALUES ('landing', '{
  "hero": {
    "headline1": "One platform.",
    "headline2": "Infinite possibilities.",
    "headline2Gradient": "#fff,#F97316,#F25604",
    "subtitle": "Connect with people who inspire you, share the moments that matter, and become part of communities that make the internet feel personal again.",
    "cta1Text": "Join the platform",
    "cta1Url": "/login",
    "cta2Text": "Explore the platform",
    "cta2Url": "#about",
    "bgImage": "/bgpc.png",
    "scrollText": "Scroll to explore"
  },
  "about": {
    "headline": "Built for meaningful connection",
    "headlineGradient": "#F97316,#F25604",
    "paragraphs": [
      "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome. Instead of endless scrolling, our platform encourages meaningful interactions that create real value and lasting connections. Every feature is designed with people in mind — not engagement metrics.",
      "Every feature is designed with people first. Whether you are discovering local communities, meeting like-minded individuals, or sharing your own ideas with the world, Tirbeo provides a clean, distraction-free space where authentic conversations can naturally grow.",
      "We prioritize privacy, performance, and simplicity above all else. From end-to-end secure messaging to a blazing-fast experience on every device, Tirbeo is engineered to be reliable, intuitive, and respectful of your time and attention.",
      "Our mission is straightforward: create a platform where people connect because they genuinely want to, not because an algorithm tells them to. Connection should be intentional, organic, and human."
    ],
    "textColor": "#F97316"
  },
  "features": {
    "headline": "Built with purpose",
    "subtitle": "Every feature is designed to foster genuine connection — not to keep you hooked.",
    "items": [
      {"label": "Real-time Chat", "desc": "Instant messaging with end-to-end encryption"},
      {"label": "Community Spaces", "desc": "Create and join topic-based communities"},
      {"label": "Voice Channels", "desc": "Crystal-clear voice conversations"},
      {"label": "Media Sharing", "desc": "Share photos, videos, and files securely"},
      {"label": "Smart Notifications", "desc": "Stay informed without the noise"},
      {"label": "Profile Customization", "desc": "Express yourself with custom profiles"}
    ]
  },
  "newsletter": {
    "badge": "Newsletter",
    "headline": "Never miss an update",
    "subtext": "Subscribe for launch announcements, feature drops, and exclusive early access.",
    "placeholder": "Enter your email",
    "buttonLabel": "Subscribe",
    "disclaimer": "No spam. Unsubscribe anytime.",
    "accentColor": "#F97316"
  },
  "footer": {
    "tagline": "Connecting communities through meaningful conversations, real-time collaboration, and shared experiences.",
    "copyright": "All rights reserved.",
    "showNewsletterForm": true
  }
}') ON CONFLICT (app) DO NOTHING;

-- ============================================
-- Demo Content: Feature Cards
-- ============================================
INSERT INTO tirbeo.demo_content (section, key, value) VALUES
('features', 'cards_row1', '{
  "items": [
    {"label": "Real-time Chat", "desc": "Instant messaging with end-to-end encryption", "color": "#F25604"},
    {"label": "Community Spaces", "desc": "Create and join topic-based communities", "color": "#F97316"},
    {"label": "Voice Channels", "desc": "Crystal-clear voice conversations", "color": "#7A3EF2"},
    {"label": "Media Sharing", "desc": "Share photos, videos, and files securely", "color": "#2F4FC4"},
    {"label": "Smart Notifications", "desc": "Stay informed without the noise", "color": "#F25604"},
    {"label": "Profile Customization", "desc": "Express yourself with custom profiles", "color": "#F97316"}
  ]
}'),
('features', 'cards_row2', '{
  "items": [
    {"label": "End-to-End Encryption", "desc": "Your conversations stay private, always", "color": "#7A3EF2"},
    {"label": "Zero Data Tracking", "desc": "We never sell or share your data", "color": "#2F4FC4"},
    {"label": "Open Source", "desc": "Transparent code, auditable by anyone", "color": "#F25604"},
    {"label": "No Algorithmic Feed", "desc": "You control what you see", "color": "#F97316"},
    {"label": "Ad-Free Experience", "desc": "No ads, no distractions, no tracking", "color": "#7A3EF2"},
    {"label": "Data Portability", "desc": "Take your data anywhere, anytime", "color": "#2F4FC4"}
  ]
}'),
('about', 'paragraphs', '{
  "items": [
    "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome.",
    "Every feature is designed with people first. Whether you are discovering local communities, meeting like-minded individuals, or sharing your own ideas with the world, Tirbeo provides a clean, distraction-free space.",
    "We prioritize privacy, performance, and simplicity above all else. From end-to-end secure messaging to a blazing-fast experience on every device, Tirbeo is engineered to be reliable, intuitive, and respectful of your time.",
    "Our mission is straightforward: create a platform where people connect because they genuinely want to, not because an algorithm tells them to."
  ]
}') ON CONFLICT (section, key) DO NOTHING;

-- ============================================
-- Demo Content: Sticky Cards (Platform Features)
-- ============================================
INSERT INTO tirbeo.demo_content (section, key, value) VALUES
('platform', 'steps', '{
  "items": [
    {
      "num": "01",
      "label": "Connect",
      "name": "Real-time Conversation",
      "description": "Instant messaging with end-to-end encryption. Every message is private, every conversation is yours.",
      "color": "#F25604"
    },
    {
      "num": "02",
      "label": "Discover",
      "name": "Communities & Spaces",
      "description": "Find your people in topic-based communities. From local neighborhoods to global interests.",
      "color": "#F97316"
    },
    {
      "num": "03",
      "label": "Create",
      "name": "Share & Collaborate",
      "description": "Share ideas, media, and moments that matter. Collaborate in real-time with tools designed for genuine interaction.",
      "color": "#7A3EF2"
    }
  ]
}') ON CONFLICT (section, key) DO NOTHING;
