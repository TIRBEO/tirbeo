-- ============================================================
-- Tirbeo Chat — File Attachments — Migration 011
-- Run this in Main DB Dashboard SQL Editor (mvogfnbqpaiedkkslecn)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_message ON public.message_attachments(message_id);

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read attachments"
  ON public.message_attachments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert attachments"
  ON public.message_attachments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create the storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to chat_attachments
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat_attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can read chat attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat_attachments');
