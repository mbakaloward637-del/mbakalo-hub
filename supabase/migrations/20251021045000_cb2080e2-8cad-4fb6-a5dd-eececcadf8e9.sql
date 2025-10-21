-- Create leaders table
CREATE TABLE public.leaders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  office TEXT NOT NULL,
  hours TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

-- Leaders are viewable by everyone
CREATE POLICY "Leaders are viewable by everyone" 
ON public.leaders 
FOR SELECT 
USING (true);

-- Only admins can insert leaders
CREATE POLICY "Admins can insert leaders" 
ON public.leaders 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update leaders
CREATE POLICY "Admins can update leaders" 
ON public.leaders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete leaders
CREATE POLICY "Admins can delete leaders" 
ON public.leaders 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create youth opportunities table
CREATE TABLE public.youth_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  type TEXT NOT NULL,
  duration TEXT NOT NULL,
  stipend TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youth_opportunities ENABLE ROW LEVEL SECURITY;

-- Opportunities are viewable by everyone
CREATE POLICY "Opportunities are viewable by everyone" 
ON public.youth_opportunities 
FOR SELECT 
USING (true);

-- Only admins can manage opportunities
CREATE POLICY "Admins can insert opportunities" 
ON public.youth_opportunities 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update opportunities" 
ON public.youth_opportunities 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete opportunities" 
ON public.youth_opportunities 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));