import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  {
    id: 1,
    title: "Ward Leaders Meeting",
    description: "Monthly meeting to discuss ward development priorities and community concerns",
    date: "Tomorrow, March 10",
    time: "2:00 PM - 5:00 PM",
    location: "Chief's Camp, Mbakalo",
    category: "Governance",
    attendees: 45,
    priority: "high",
  },
  {
    id: 2,
    title: "Youth Football Tournament",
    description: "Inter-village football championship with prizes for winners",
    date: "Saturday, March 11",
    time: "9:00 AM - 6:00 PM",
    location: "Mbakalo Community Grounds",
    category: "Sports",
    attendees: 200,
    priority: "normal",
  },
  {
    id: 3,
    title: "Women's Group Fundraiser",
    description: "Supporting Mama Agnes Medical Fund through community contributions",
    date: "Tuesday, March 14",
    time: "3:00 PM - 6:00 PM",
    location: "Mbakalo Market Center",
    category: "Fundraising",
    attendees: 80,
    priority: "high",
  },
  {
    id: 4,
    title: "Free Health Screening Camp",
    description: "General checkups, blood pressure monitoring, and health education",
    date: "Saturday, March 18",
    time: "8:00 AM - 4:00 PM",
    location: "Mbakalo Primary School",
    category: "Health",
    attendees: 150,
    priority: "urgent",
  },
  {
    id: 5,
    title: "Youth Skills Training Workshop",
    description: "Digital marketing and entrepreneurship training for youth",
    date: "Monday, March 20",
    time: "10:00 AM - 4:00 PM",
    location: "Youth Development Center",
    category: "Education",
    attendees: 50,
    priority: "normal",
  },
  {
    id: 6,
    title: "Community Clean-Up Day",
    description: "Join neighbors in keeping Mbakalo clean and green",
    date: "Saturday, March 25",
    time: "7:00 AM - 12:00 PM",
    location: "Meet at Market Center",
    category: "Community",
    attendees: 120,
    priority: "normal",
  },
];

const categoryColors: Record<string, string> = {
  Governance: "bg-primary",
  Sports: "bg-accent",
  Fundraising: "bg-secondary",
  Health: "bg-status-verified",
  Education: "bg-primary-light",
  Community: "bg-primary-dark",
};

export default function Events() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Community Events</h1>
        <p className="text-lg text-muted-foreground">
          Stay connected with ward meetings, community activities, and important gatherings
        </p>
      </div>

      {/* Upcoming Events Grid */}
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
                  <Badge className={categoryColors[event.category]}>
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
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
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

      {/* Calendar View Placeholder */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Event Calendar</CardTitle>
          <CardDescription>View all events in calendar format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Calendar view coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
