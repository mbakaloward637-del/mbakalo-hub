-- Create beneficiaries table
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  location TEXT NOT NULL,
  village TEXT,
  needs TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create assistance_records table (track help provided to beneficiaries)
CREATE TABLE public.assistance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  assistance_type TEXT NOT NULL,
  description TEXT NOT NULL,
  items_provided TEXT[],
  value_estimate INTEGER,
  date_provided DATE NOT NULL,
  volunteer_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donations_inventory table (track in-kind donations)
CREATE TABLE public.donations_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pieces',
  donor_name TEXT,
  donor_contact TEXT,
  date_received DATE NOT NULL,
  expiry_date DATE,
  storage_location TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteers table
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  availability TEXT NOT NULL DEFAULT 'weekends',
  status TEXT NOT NULL DEFAULT 'active',
  total_tasks_completed INTEGER DEFAULT 0,
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  target_amount INTEGER,
  raised_amount INTEGER DEFAULT 0,
  target_items TEXT[],
  collected_items JSONB DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for beneficiaries
CREATE POLICY "Admins can manage beneficiaries"
ON public.beneficiaries FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Volunteers can view beneficiaries"
ON public.beneficiaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- RLS Policies for assistance_records
CREATE POLICY "Admins can manage assistance records"
ON public.assistance_records FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Volunteers can view assistance records"
ON public.assistance_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- RLS Policies for donations_inventory
CREATE POLICY "Admins can manage donations inventory"
ON public.donations_inventory FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Volunteers can view donations inventory"
ON public.donations_inventory FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- RLS Policies for volunteers
CREATE POLICY "Admins can manage volunteers"
ON public.volunteers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Volunteers can view all volunteers"
ON public.volunteers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Volunteers can update own profile"
ON public.volunteers FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for campaigns
CREATE POLICY "Admins can manage campaigns"
ON public.campaigns FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active campaigns"
ON public.campaigns FOR SELECT
USING (status = 'active' OR has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_beneficiaries_status ON public.beneficiaries(status);
CREATE INDEX idx_beneficiaries_location ON public.beneficiaries(location);
CREATE INDEX idx_assistance_records_beneficiary ON public.assistance_records(beneficiary_id);
CREATE INDEX idx_assistance_records_date ON public.assistance_records(date_provided);
CREATE INDEX idx_donations_inventory_category ON public.donations_inventory(category);
CREATE INDEX idx_donations_inventory_status ON public.donations_inventory(status);
CREATE INDEX idx_volunteers_status ON public.volunteers(status);
CREATE INDEX idx_volunteers_user ON public.volunteers(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- Create updated_at trigger for beneficiaries
CREATE TRIGGER update_beneficiaries_updated_at
BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for donations_inventory
CREATE TRIGGER update_donations_inventory_updated_at
BEFORE UPDATE ON public.donations_inventory
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for volunteers
CREATE TRIGGER update_volunteers_updated_at
BEFORE UPDATE ON public.volunteers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for campaigns
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();