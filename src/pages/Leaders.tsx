import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Leaders() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaders')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Ward Leaders</h1>
        <p className="text-lg text-muted-foreground">
          Connect with your representatives and community leaders
        </p>
      </div>

      {/* Main Leaders */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Key Representatives</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading leaders...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No leaders found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaders.map((leader) => (
              <Card 
                key={leader.id} 
                className={`shadow-medium hover:shadow-strong transition-shadow ${
                  leader.priority === "high" ? "border-primary" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {leader.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{leader.name}</CardTitle>
                          <CardDescription>{leader.position}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-primary mb-3">{leader.role}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${leader.email}`} className="text-primary hover:underline">
                      {leader.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${leader.phone}`} className="hover:text-primary">
                      {leader.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{leader.office}</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="font-medium">Office Hours</p>
                    <p className="text-muted-foreground">{leader.hours}</p>
                  </div>
                  <Button className="w-full bg-gradient-primary">
                    Contact {leader.name.split(" ")[0]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Transparency Section */}
      <Card className="shadow-strong border-primary mt-12">
        <CardHeader>
          <CardTitle className="text-2xl">Transparency & Accountability</CardTitle>
          <CardDescription>
            Our commitment to open governance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Monthly Reports</h3>
              <p className="text-sm text-muted-foreground">
                All ward activities and expenditures published monthly
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Public Forums</h3>
              <p className="text-sm text-muted-foreground">
                Quarterly town halls for community feedback
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Open Budget</h3>
              <p className="text-sm text-muted-foreground">
                Complete budget breakdown accessible to all residents
              </p>
            </div>
          </div>
          <Button className="w-full" variant="outline">
            View Latest Transparency Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
