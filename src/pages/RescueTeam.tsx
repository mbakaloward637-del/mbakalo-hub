import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RescueTeamChat } from "@/components/rescue-team/RescueTeamChat";
import { RescueTeamManagement } from "@/components/rescue-team/RescueTeamManagement";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const RescueTeam = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!roles);

      // Check if team member
      const { data: member } = await supabase
        .from('rescue_team_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setIsMember(!!member);
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin && !isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground">
            This page is only accessible to Mbakalo Rescue Team members. Please contact an administrator if you believe you should have access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-10 w-10 text-red-500" />
          <h1 className="text-4xl font-bold">Mbakalo Rescue Team</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Emergency response coordination and team management
        </p>
      </div>

      <Tabs defaultValue={isAdmin ? "management" : "chat"} className="space-y-6">
        <TabsList className="grid w-full max-w-md" style={{ gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr' }}>
          {isAdmin && (
            <TabsTrigger value="management">
              <Users className="h-4 w-4 mr-2" />
              Team Management
            </TabsTrigger>
          )}
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Team Chat
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="management">
            <RescueTeamManagement />
          </TabsContent>
        )}

        <TabsContent value="chat">
          <RescueTeamChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RescueTeam;
