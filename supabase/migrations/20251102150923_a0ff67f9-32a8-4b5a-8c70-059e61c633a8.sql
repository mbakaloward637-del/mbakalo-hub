-- Create youth profiles table
CREATE TABLE IF NOT EXISTS public.youth_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  village TEXT NOT NULL,
  profile_pic_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create youth chat messages table
CREATE TABLE IF NOT EXISTS public.youth_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_chat_messages ENABLE ROW LEVEL SECURITY;

-- Youth profiles policies
CREATE POLICY "Youth profiles are viewable by everyone"
  ON public.youth_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own youth profile"
  ON public.youth_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own youth profile"
  ON public.youth_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Youth chat policies
CREATE POLICY "Chat messages are viewable by everyone"
  ON public.youth_chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.youth_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON public.youth_chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_youth_profiles_user_id ON public.youth_profiles(user_id);
CREATE INDEX idx_youth_chat_messages_created_at ON public.youth_chat_messages(created_at DESC);
CREATE INDEX idx_youth_chat_messages_user_id ON public.youth_chat_messages(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_youth_profiles_updated_at
  BEFORE UPDATE ON public.youth_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.youth_chat_messages;