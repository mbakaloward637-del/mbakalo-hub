import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, Users, TrendingUp } from "lucide-react";

const programs = [
  {
    title: "Digital Skills Training",
    description: "Learn web development, graphic design, and digital marketing",
    category: "Skills",
    duration: "3 months",
    slots: "15 available",
    startDate: "April 1, 2025",
    fee: "Free",
  },
  {
    title: "Entrepreneurship Bootcamp",
    description: "Start and grow your business with expert mentorship",
    category: "Business",
    duration: "6 weeks",
    slots: "20 available",
    startDate: "March 20, 2025",
    fee: "KSh 2,000",
  },
  {
    title: "Youth Leadership Academy",
    description: "Develop leadership skills and community engagement",
    category: "Leadership",
    duration: "2 months",
    slots: "25 available",
    startDate: "April 15, 2025",
    fee: "Free",
  },
];

const opportunities = [
  {
    title: "ICT Intern",
    company: "County Government",
    type: "Internship",
    duration: "6 months",
    stipend: "KSh 15,000/month",
  },
  {
    title: "Youth Group Coordinator",
    company: "Mbakalo Youth Network",
    type: "Volunteer",
    duration: "Ongoing",
    stipend: "Certificate",
  },
  {
    title: "Agricultural Extension Worker",
    company: "Local NGO",
    type: "Contract",
    duration: "1 year",
    stipend: "KSh 25,000/month",
  },
];

const successStories = [
  {
    name: "Kevin Otieno",
    achievement: "Started successful poultry business",
    program: "Entrepreneurship Bootcamp 2024",
    impact: "Employs 3 youth from the ward",
  },
  {
    name: "Susan Wambui",
    achievement: "Web developer at Nairobi tech startup",
    program: "Digital Skills Training 2024",
    impact: "Mentoring 10 youth in coding",
  },
];

export default function Youth() {
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

      {/* Training Programs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Available Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <Card key={index} className="shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-3 bg-primary">{program.category}</Badge>
                <CardTitle className="text-xl">{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{program.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{program.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee:</span>
                    <span className="font-medium text-primary">{program.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slots:</span>
                    <span className="font-medium">{program.slots}</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-primary">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Job Opportunities */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Current Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.map((job, index) => (
            <Card key={index} className="shadow-medium">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={job.type === "Internship" ? "default" : "secondary"}>
                    {job.type}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{job.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compensation:</span>
                  <span className="font-medium">{job.stipend}</span>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {successStories.map((story, index) => (
            <Card key={index} className="shadow-medium border-primary">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">
                      {story.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{story.name}</CardTitle>
                    <CardDescription>{story.program}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{story.achievement}</p>
                <p className="text-sm text-muted-foreground">Impact: {story.impact}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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
