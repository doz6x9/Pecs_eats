-- Ensure posts table has recipe columns (run this in Supabase SQL Editor if recipe doesn't show after saving)
-- If your posts table was created without these, add them:

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS has_recipe boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recipe_text text;

-- Optional: ensure updated_at exists so recipe-added time is tracked
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Allow post owners to UPDATE their own posts (required for adding/editing recipe)
-- Skip if you already have a policy that allows this
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Users can update own posts'
  ) THEN
    CREATE POLICY "Users can update own posts"
      ON public.posts
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
