import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  category: string;
  attendees: number;
  priority: string;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  Governance: "bg-primary",
  Sports: "bg-accent",
  Fundraising: "bg-secondary",
  Health: "bg-status-verified",
  Education: "bg-primary-light",
  Community: "bg-primary-dark",
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Community Events</h1>
        <p className="text-lg text-muted-foreground">
          Stay connected with ward meetings, community activities, and important gatherings
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="shadow-medium">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No events scheduled yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className={`shadow-medium hover:shadow-strong transition-all ${
                event.priority === "urgent" ? "border-secondary" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={categoryColors[event.category] || "bg-primary"}>
                      {event.category}
                    </Badge>
                    {event.priority === "urgent" && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                    {event.priority === "high" && (
                      <Badge className="bg-primary">Important</Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">{event.event_date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{event.event_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees} expected attendees</span>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Add to Calendar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
