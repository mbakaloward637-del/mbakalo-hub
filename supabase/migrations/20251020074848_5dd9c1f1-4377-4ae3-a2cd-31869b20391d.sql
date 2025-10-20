-- Create storage buckets for admin content
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('news-images', 'news-images', true),
  ('event-images', 'event-images', true),
  ('project-images', 'project-images', true);

-- Storage policies for news images
CREATE POLICY "Anyone can view news images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

CREATE POLICY "Admins can upload news images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for event images
CREATE POLICY "Anyone can view event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for project images
CREATE POLICY "Anyone can view project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Admins can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update project images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

-- Add image_url columns to tables
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_url TEXT;