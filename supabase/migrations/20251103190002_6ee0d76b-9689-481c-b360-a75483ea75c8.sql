-- Create rescue team members table
CREATE TABLE public.rescue_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  village TEXT NOT NULL,
  profile_pic_url TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  rank TEXT NOT NULL DEFAULT 'volunteer',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rescue_team_members ENABLE ROW LEVEL SECURITY;

-- Policies for rescue team members
CREATE POLICY "Admins can manage rescue team members"
ON public.rescue_team_members
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Rescue team members can view all members"
ON public.rescue_team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rescue_team_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Rescue team members can update own profile"
ON public.rescue_team_members
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create rescue team chat messages table
CREATE TABLE public.rescue_team_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rescue_team_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for rescue team chat
CREATE POLICY "Rescue team members can view messages"
ON public.rescue_team_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rescue_team_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Rescue team members can send messages"
ON public.rescue_team_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM rescue_team_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can delete their own messages"
ON public.rescue_team_chat_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.rescue_team_chat_messages;

-- Add trigger for updated_at
CREATE TRIGGER update_rescue_team_members_updated_at
BEFORE UPDATE ON public.rescue_team_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();