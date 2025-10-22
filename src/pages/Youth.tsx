import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Award, Users, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Youth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    youthMembers: 0,
    activeOpportunities: 0,
    totalRegistrations: 0,
    acceptedRegistrations: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchStats();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      
      const { data } = await supabase
        .from("youth_registrations")
        .select("opportunity_id")
        .eq("user_id", user.id);
      
      if (data) {
        setRegistrations(new Set(data.map(r => r.opportunity_id)));
      }
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    
    // Count youth members from profiles
    const { count: membersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Count active opportunities
    const { count: opportunitiesCount } = await supabase
      .from("youth_opportunities")
      .select("*", { count: "exact", head: true });

    // Count total registrations
    const { count: registrationsCount } = await supabase
      .from("youth_registrations")
      .select("*", { count: "exact", head: true });

    // Count accepted/completed registrations
    const { count: acceptedCount } = await supabase
      .from("youth_registrations")
      .select("*", { count: "exact", head: true })
      .in("status", ["accepted", "completed"]);

    setStats({
      youthMembers: membersCount || 0,
      activeOpportunities: opportunitiesCount || 0,
      totalRegistrations: registrationsCount || 0,
      acceptedRegistrations: acceptedCount || 0
    });
    
    setStatsLoading(false);
  };

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["youth-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youth_opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleRegister = async (opportunityId: string) => {
    if (!userId) {
      toast.error("Please login to register");
      return;
    }

    try {
      const { error } = await supabase
        .from("youth_registrations")
        .insert({
          user_id: userId,
          opportunity_id: opportunityId,
          status: "pending"
        });

      if (error) throw error;

      setRegistrations(new Set([...registrations, opportunityId]));
      toast.success("Registered successfully!");
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Failed to register");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Youth Development</h1>
          <p className="text-muted-foreground">Empowering the next generation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-12">
          {statsLoading ? (
            <div className="col-span-4 flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary p-3 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.youthMembers}</p>
                      <p className="text-xs text-muted-foreground">Youth Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary p-3 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeOpportunities}</p>
                      <p className="text-xs text-muted-foreground">Active Opportunities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent p-3 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                      <p className="text-xs text-muted-foreground">Total Registrations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-light p-3 rounded-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.acceptedRegistrations}</p>
                      <p className="text-xs text-muted-foreground">Successful Placements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Current Opportunities</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : opportunities && opportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {opportunities.map((opp: any) => (
                <Card key={opp.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{opp.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{opp.company}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{opp.type}</Badge>
                      <Badge variant="secondary">{opp.duration}</Badge>
                    </div>
                    <p className="text-lg font-semibold text-primary mt-2">{opp.stipend}</p>
                    
                    {userId && (
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleRegister(opp.id)}
                        disabled={registrations.has(opp.id)}
                      >
                        {registrations.has(opp.id) ? "Already Registered" : "Register"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No opportunities available at the moment</p>
          )}
        </div>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Join Mbakalo Youth Network</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Connect with fellow youth and access exclusive opportunities</p>
            <Button variant="secondary">Register Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
