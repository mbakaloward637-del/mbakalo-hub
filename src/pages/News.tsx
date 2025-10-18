import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, Users, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string | null;
  category: string;
  priority: string;
  created_at: string;
}

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading news...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabsContent value="all" className="space-y-6 mt-0">
              {articles.length === 0 ? (
                <Card className="shadow-medium">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No news articles yet. Check back soon!</p>
                  </CardContent>
                </Card>
              ) : (
                articles.map((article) => (
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
                        <span className="text-sm text-muted-foreground">
                          {getTimeAgo(article.created_at)}
                        </span>
                      </div>
                      <CardTitle className="text-2xl">{article.title}</CardTitle>
                      <CardDescription className="text-base">{article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Newspaper className="h-4 w-4" />
                        <span>Mbakalo Rescue Team</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="development" className="space-y-6 mt-0">
              {articles.filter(a => a.category === "Development" || a.category === "Water").map((article) => (
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
              {articles.filter(a => a.category === "Governance").map((article) => (
                <Card key={article.id} className="shadow-medium">
                  <CardHeader>
                    <Badge className="w-fit mb-2">{article.category}</Badge>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="health" className="space-y-6 mt-0">
              {articles.filter(a => a.category === "Health").map((article) => (
                <Card key={article.id} className="shadow-medium">
                  <CardHeader>
                    <Badge className="w-fit mb-2">{article.category}</Badge>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </div>

          <div className="space-y-6">
            <Card className="shadow-strong">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ward Leadership</CardTitle>
                    <CardDescription>Mbakalo Rescue Team</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Office Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 9AM - 5PM</p>
                </div>
              </CardContent>
            </Card>

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

            <Card className="shadow-medium border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Transparency Commitment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All ward projects, budgets, and expenditures are published monthly for public review.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
