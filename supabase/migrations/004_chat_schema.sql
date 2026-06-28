-- Messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Anyone can read messages') THEN
    CREATE POLICY "Anyone can read messages"
      ON public.messages FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Authenticated users can insert messages') THEN
    CREATE POLICY "Authenticated users can insert messages"
      ON public.messages FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END$$;

-- Enable realtime for messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.messages;
EXCEPTION
  WHEN unique_violation THEN
    -- Table already in publication, skip
  WHEN duplicate_object THEN
    -- Table already in publication, skip
END$$;
