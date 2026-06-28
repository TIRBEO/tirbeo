-- ============================================================
-- Tirbeo Blog — Posts table
-- ============================================================

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published posts" ON blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admin write blog_posts" ON blog_posts FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'editor'))
);

-- Seed posts
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, tags, published_at, is_published) VALUES
(
  'Introducing Tirbeo — A New Way to Build Community',
  'introducing-tirbeo',
  'After months of quiet building, we''re excited to share what we''ve been working on: a modern workspace designed for the communities you care about.',
  E'After months of quiet building, we''re excited to share what we''ve been working on.\n\n## Why Tirbeo?\n\nMost community platforms optimise for engagement at the cost of depth. We optimise for meaning. Tirbeo brings together chat, collaboration tools, and community management in one calm, considered space.\n\n## What makes us different?\n\n- **Threaded conversations** that respect your attention\n- **Customisable channels** for every purpose\n- **Built-in moderation** tools that keep communities healthy\n- **Real-time sync** across all your devices\n\nWe believe the tools we use shape how we relate. It''s time for better tools.\n\n*— The Tirbeo Team*',
  'Alex Rivera',
  ARRAY['product', 'announcement'],
  now(),
  true
),
(
  'Building for Depth: Our Design Philosophy',
  'building-for-depth',
  'Why we chose calm over chaos, meaning over metrics, and community over engagement.',
  E'## Design choices that matter\n\nEvery pixel in Tirbeo was chosen with intention. We believe great design isn''t just about how things look — it''s about how they make people feel.\n\n### Calm as a feature\n\nWe rejected the dopamine-driven patterns that dominate social platforms. No badges, no streaks, no notification spam. Instead, we designed for flow states — environments where you can focus, connect, and create without the noise.\n\n### Privacy by default\n\nYour conversations are your own. We built Tirbeo with end-to-end encryption, private channels, and granular permissions from day one.\n\n### Accessibility first\n\nTirbeo is built to be usable by everyone. We follow WCAG guidelines, support screen readers, and provide customisable themes for different visual needs.\n\n*— Sarah Chen, CTO*',
  'Sarah Chen',
  ARRAY['design', 'philosophy'],
  now() - interval ''1 day'',
  true
),
(
  'How We Built Real-Time Chat at Scale',
  'real-time-chat-at-scale',
  'A technical deep-dive into the architecture powering Tirbeo''s real-time messaging system.',
  E'## The architecture behind the chat\n\nTirbeo''s chat system handles millions of messages daily. Here''s how we built it.\n\n### Supabase Realtime\n\nWe use Supabase Realtime for WebSocket-based message delivery. Each channel subscribes to its own PostgreSQL publication, ensuring messages are delivered instantly.\n\n### Message pipeline\n\n1. Message is inserted via REST API\n2. PostgreSQL trigger fires the publication\n3. Supabase Realtime broadcasts to subscribers\n4. Client-side cache updates optimistically\n\n### What''s next?\n\nWe''re working on message search indexing, read receipts, and end-to-end encryption for private channels.\n\n*— Ren Nakamura, Engineering*',
  'Ren Nakamura',
  ARRAY['engineering', 'technical'],
  now() - interval ''3 days'',
  true
),
(
  'Community Spotlight: How Designers United Uses Tirbeo',
  'community-spotlight-designers-united',
  'A thriving community of 2,000+ designers shares how they use Tirbeo for feedback, collaboration, and growth.',
  E'## Community Spotlight\n\nDesigners United started as a small Discord server. Today, they''re one of the most active communities on Tirbeo, with over 2,000 members.\n\n### What they love\n\n- **Threaded feedback channels** — members post work-in-progress and get structured feedback without losing context\n- **Resource libraries** — pinned channels with templates, assets, and learning materials\n- **Portfolio reviews** — regular scheduled events where members present their work\n\n> "Tirbeo gave us the structure we needed without the noise. Our members actually read each other''s feedback now."\n> — Jamie, Community Lead\n\nWant to share your community''s story? Reach out to us at community@tirbeo.com.',
  'Mira Reyes',
  ARRAY['community', 'spotlight'],
  now() - interval ''7 days'',
  true
);
