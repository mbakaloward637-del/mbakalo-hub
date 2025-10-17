import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Users } from "lucide-react";

const leaders = [
  {
    name: "Hon. Jane Wanjiku",
    position: "Member of County Assembly",
    role: "Ward Representative",
    email: "mca@mbakaloward.go.ke",
    phone: "+254 712 345 678",
    office: "Mbakalo Ward Office",
    hours: "Mon-Fri: 9AM - 5PM",
    priority: "high",
  },
  {
    name: "Chief Peter Kamau",
    position: "Area Chief",
    role: "Administration",
    email: "chief@mbakalo.go.ke",
    phone: "+254 723 456 789",
    office: "Chief's Camp, Mbakalo",
    hours: "Mon-Sat: 8AM - 5PM",
    priority: "high",
  },
  {
    name: "John Mwangi",
    position: "Ward Development Committee Chair",
    role: "Community Leadership",
    email: "wdc@mbakalo.org",
    phone: "+254 734 567 890",
    office: "Community Hall",
    hours: "By Appointment",
    priority: "normal",
  },
  {
    name: "Grace Akinyi",
    position: "Youth Development Officer",
    role: "Youth Programs",
    email: "youth@mbakalo.org",
    phone: "+254 745 678 901",
    office: "Youth Center",
    hours: "Tue-Sat: 10AM - 4PM",
    priority: "normal",
  },
];

const committees = [
  {
    name: "Ward Development Committee",
    chair: "John Mwangi",
    members: 12,
    focus: "Infrastructure & Development",
  },
  {
    name: "Youth Affairs Committee",
    chair: "Grace Akinyi",
    members: 8,
    focus: "Youth Empowerment",
  },
  {
    name: "Water & Sanitation Committee",
    chair: "Mary Njeri",
    members: 10,
    focus: "Water Projects",
  },
  {
    name: "Education Committee",
    chair: "David Ochieng",
    members: 9,
    focus: "School Development",
  },
];

export default function Leaders() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaders.map((leader, index) => (
            <Card 
              key={index} 
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
      </div>

      {/* Ward Committees */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Ward Committees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {committees.map((committee, index) => (
            <Card key={index} className="shadow-medium">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{committee.name}</CardTitle>
                    <CardDescription>Chair: {committee.chair}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{committee.members}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{committee.focus}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
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
