-- Create moderation queue table
CREATE TABLE public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'post', 'comment', 'news', etc.
  content_id UUID NOT NULL,
  content_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'investigating', 'debunked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage moderation queue
CREATE POLICY "Admins can view moderation queue"
ON public.moderation_queue
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert to moderation queue"
ON public.moderation_queue
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update moderation queue"
ON public.moderation_queue
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update posts table to add moderation trigger
CREATE OR REPLACE FUNCTION public.queue_post_for_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'unverified' THEN
    INSERT INTO public.moderation_queue (type, content_id, content_text, status)
    VALUES ('post', NEW.id, NEW.title || ': ' || NEW.content, 'pending');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_created_queue_moderation
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_post_for_moderation();