-- ============================================================
-- Tirbeo DB Consolidation — Migration 009
-- Run this in Main DB Dashboard SQL Editor (mvogfnbqpaiedkkslecn)
-- 
-- Purpose: Migrate messages + realtime from Apps DB to Main DB
-- so we can decommission the separate Apps DB project.
-- ============================================================

-- Messages table (with channel support pre-schema for Phase 1)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID, -- will FK to channels table in Phase 1
  content TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_email TEXT NOT NULL,
  thread_parent_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read messages"
    ON public.messages FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(thread_parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- Enable Realtime for messages
DO $$ BEGIN
  CREATE PUBLICATION supabase_realtime;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.messages;
EXCEPTION WHEN unique_violation THEN NULL;
END $$;
