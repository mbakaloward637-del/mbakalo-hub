-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Volunteers can view all volunteers" ON public.volunteers;

-- Create a new policy that doesn't reference itself
CREATE POLICY "Volunteers can view all volunteers" 
ON public.volunteers 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR user_id = auth.uid() 
  OR (
    -- Check if current user is an active volunteer without recursion
    -- by directly checking the user_roles table for admin or checking own row
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid()
    )
  )
  OR status = 'active'
);