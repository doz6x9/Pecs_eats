-- Likes table: one row per user per post (toggle like)
CREATE TABLE IF NOT EXISTS public.likes (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Index for counting likes per post and checking if current user liked
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- RLS: anyone can read; only authenticated users can insert/delete their own
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like (insert)"
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike (delete own)"
  ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Notification reads: track which notifications the user has "clicked" (read)
-- notification_id is the composite id we use in the app (e.g. req_xxx, com_xxx, like_xxx, added_xxx)
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id text NOT NULL,
  read_at timestamptz DEFAULT now(),
  UNIQUE (user_id, notification_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON public.notification_reads(user_id);

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notification_reads"
  ON public.notification_reads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification_reads"
  ON public.notification_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
