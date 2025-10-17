import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, Users, Building } from "lucide-react";

const newsArticles = [
  {
    id: 1,
    title: "MCA Announces New Road Construction Plans for Mbakalo",
    excerpt: "Our Ward Representative has secured funding for 5km of new tarmac roads connecting Mbakalo to neighboring wards.",
    category: "Development",
    date: "2 hours ago",
    priority: "high",
    image: "road",
  },
  {
    id: 2,
    title: "Community Health Camp This Saturday",
    excerpt: "Free medical checkups, vaccinations, and health education at Mbakalo Primary School from 9 AM to 4 PM.",
    category: "Health",
    date: "5 hours ago",
    priority: "urgent",
    image: "health",
  },
  {
    id: 3,
    title: "Borehole Project Reaches 60% Completion",
    excerpt: "The community borehole project is on track. Water supply expected to begin next month serving 500+ households.",
    category: "Water",
    date: "1 day ago",
    priority: "medium",
    image: "water",
  },
  {
    id: 4,
    title: "Youth Training Program Enrollment Open",
    excerpt: "Digital skills and vocational training program now accepting applications. 50 slots available for youth aged 18-35.",
    category: "Youth",
    date: "1 day ago",
    priority: "medium",
    image: "education",
  },
  {
    id: 5,
    title: "Ward Development Committee Meeting Summary",
    excerpt: "Key decisions made on school renovation, market improvement, and security lighting installation.",
    category: "Governance",
    date: "2 days ago",
    priority: "low",
    image: "meeting",
  },
];

const mcaUpdates = [
  {
    title: "Quarterly Report Published",
    description: "Full transparency report on ward projects and budget utilization now available",
    date: "3 days ago",
  },
  {
    title: "Town Hall Meeting Scheduled",
    description: "Meet your MCA and discuss ward priorities. March 15th at Community Hall",
    date: "5 days ago",
  },
  {
    title: "New Youth Employment Initiative",
    description: "Partnership with county government to create 100 job opportunities",
    date: "1 week ago",
  },
];

export default function News() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">News & Politics</h1>
        <p className="text-lg text-muted-foreground">
          Stay informed with the latest updates from Mbakalo Ward
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="mca">MCA Updates</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main News Feed */}
          <div className="lg:col-span-2">
            <TabsContent value="all" className="space-y-6 mt-0">
              {newsArticles.map((article) => (
                <Card key={article.id} className="shadow-medium hover:shadow-strong transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex gap-2">
                        <Badge>{article.category}</Badge>
                        {article.priority === "urgent" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                        {article.priority === "high" && (
                          <Badge className="bg-primary">Important</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{article.date}</span>
                    </div>
                    <CardTitle className="text-2xl">{article.title}</CardTitle>
                    <CardDescription className="text-base">{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Newspaper className="h-4 w-4" />
                      <span>Read full article</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="development" className="space-y-6 mt-0">
              {newsArticles.filter(a => a.category === "Development" || a.category === "Water").map((article) => (
                <Card key={article.id} className="shadow-medium">
                  <CardHeader>
                    <Badge className="w-fit mb-2">{article.category}</Badge>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="governance" className="space-y-6 mt-0">
              {newsArticles.filter(a => a.category === "Governance").map((article) => (
                <Card key={article.id} className="shadow-medium">
                  <CardHeader>
                    <Badge className="w-fit mb-2">{article.category}</Badge>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="mca" className="space-y-6 mt-0">
              {mcaUpdates.map((update, index) => (
                <Card key={index} className="shadow-medium">
                  <CardHeader>
                    <CardTitle>{update.title}</CardTitle>
                    <CardDescription>{update.description}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">{update.date}</p>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* MCA Info */}
            <Card className="shadow-strong">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Hon. Jane Wanjiku</CardTitle>
                    <CardDescription>Mbakalo Ward MCA</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Office Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 9AM - 5PM</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">office@mbakaloward.go.ke</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Ward Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="text-sm">Active Projects</span>
                  </div>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm">Completed This Year</span>
                  </div>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">Beneficiaries</span>
                  </div>
                  <span className="font-bold">2,450+</span>
                </div>
              </CardContent>
            </Card>

            {/* Transparency Notice */}
            <Card className="shadow-medium border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Transparency Commitment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All ward projects, budgets, and expenditures are published monthly for public review. 
                  View our complete financial reports in the Leaders section.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
