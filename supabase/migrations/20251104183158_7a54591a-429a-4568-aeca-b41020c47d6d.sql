-- Fix infinite recursion in rescue_team_members RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Rescue team members can view all members" ON rescue_team_members;
DROP POLICY IF EXISTS "Rescue team members can update own profile" ON rescue_team_members;

-- Create new policies that don't cause recursion
-- Allow admins and users to view their own record, plus allow viewing if status is active
CREATE POLICY "Team members and admins can view members"
ON rescue_team_members
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR user_id = auth.uid()
  OR status = 'active'
);

-- Users can update their own profile
CREATE POLICY "Members can update own profile"
ON rescue_team_members
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());