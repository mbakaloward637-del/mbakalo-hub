import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, Users, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Youth() {
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['youth-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('youth_opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Youth Development</h1>
        <p className="text-lg text-muted-foreground">
          Skills, opportunities, and empowerment for Mbakalo youth
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Youth Members", value: "450+", icon: Users, color: "bg-primary" },
          { label: "Training Programs", value: "12", icon: GraduationCap, color: "bg-secondary" },
          { label: "Job Placements", value: "89", icon: Briefcase, color: "bg-accent" },
          { label: "Businesses Started", value: "34", icon: TrendingUp, color: "bg-primary-light" },
        ].map((stat, index) => (
          <Card key={index} className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Opportunities */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Current Opportunities</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No opportunities available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="shadow-medium">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={opportunity.type === "Internship" ? "default" : "secondary"}>
                      {opportunity.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <CardDescription>{opportunity.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Duration:
                    </span>
                    <span>{opportunity.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Compensation:
                    </span>
                    <span className="font-medium">{opportunity.stipend}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <Card className="shadow-strong mt-12 bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Join Mbakalo Youth Network</CardTitle>
          <CardDescription className="text-primary-foreground/90">
            Connect with fellow youth, access exclusive opportunities, and shape your future
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" size="lg">
            Register Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
