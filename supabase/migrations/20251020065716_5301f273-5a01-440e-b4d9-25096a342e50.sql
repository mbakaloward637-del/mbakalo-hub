-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  funeral_id UUID REFERENCES public.funeral_notices(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  mpesa_receipt_number TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT donations_project_or_funeral CHECK (
    (project_id IS NOT NULL AND funeral_id IS NULL) OR 
    (project_id IS NULL AND funeral_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Everyone can view donations for transparency
CREATE POLICY "Donations are viewable by everyone"
ON public.donations
FOR SELECT
USING (true);

-- Only admins can insert donations (through edge function)
CREATE POLICY "Admins can insert donations"
ON public.donations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update donations
CREATE POLICY "Admins can update donations"
ON public.donations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_donations_project_id ON public.donations(project_id);
CREATE INDEX idx_donations_funeral_id ON public.donations(funeral_id);
CREATE INDEX idx_donations_status ON public.donations(status);