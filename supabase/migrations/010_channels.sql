-- ============================================================
-- Tirbeo Chat — Channel Architecture — Migration 010
-- Run this in Main DB Dashboard SQL Editor (mvogfnbqpaiedkkslecn)
-- ============================================================

-- 1. CHANNELS
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text'
    CHECK (type IN ('text', 'announcement', 'thread', 'private')),
  topic TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CHANNEL MEMBERS
CREATE TABLE IF NOT EXISTS public.channel_members (
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

-- 3. UPDATE MESSAGES — add channel_id FK
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Channels: members can see channels they belong to, plus public channels
CREATE POLICY "View channels" ON public.channels FOR SELECT USING (
  is_private = false
  OR EXISTS (
    SELECT 1 FROM public.channel_members
    WHERE channel_id = id AND user_id = auth.uid()
  )
);

-- Channel members: users see their own memberships
CREATE POLICY "View own memberships" ON public.channel_members FOR SELECT USING (
  user_id = auth.uid()
);

-- ============================================================
-- SEED: Create default channels
-- ============================================================
INSERT INTO public.channels (name, type, topic) VALUES
  ('general', 'text', 'General community discussion'),
  ('announcements', 'announcement', 'Official announcements from the team'),
  ('random', 'text', 'Random stuff — memes, off-topic, and fun')
ON CONFLICT DO NOTHING;
