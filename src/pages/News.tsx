import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, Users, Building, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string | null;
  category: string;
  priority: string;
  image_url: string | null;
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

  const featuredArticle = articles.find(a => a.priority === "urgent" || a.priority === "high") || articles[0];
  const otherArticles = articles.filter(a => a.id !== featuredArticle?.id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-muted rounded w-1/3"></div>
          <div className="h-80 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Magazine Header */}
      <header className="mb-12 text-center border-b-4 border-primary pb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-1 w-16 bg-accent"></div>
          <span className="text-sm font-medium text-accent uppercase tracking-widest">Mbakalo Rescue Team</span>
          <div className="h-1 w-16 bg-accent"></div>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 text-primary">NEWS & POLITICS</h1>
        <p className="text-lg text-muted-foreground font-serif max-w-2xl mx-auto">
          Stay informed with the latest developments, governance updates, and community stories from Mbakalo Ward
        </p>
      </header>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-serif">
            All News
          </TabsTrigger>
          <TabsTrigger value="development" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-serif">
            Development
          </TabsTrigger>
          <TabsTrigger value="governance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-serif">
            Governance
          </TabsTrigger>
          <TabsTrigger value="health" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-serif">
            Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {articles.length === 0 ? (
            <Card className="shadow-medium">
              <CardContent className="p-12 text-center">
                <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl font-serif text-muted-foreground">No news articles yet. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {/* Featured Article - Magazine Hero */}
              {featuredArticle && (
                <article className="relative group">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl overflow-hidden">
                      {featuredArticle.image_url ? (
                        <img 
                          src={featuredArticle.image_url} 
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="h-24 w-24 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-accent text-white font-serif">{featuredArticle.category}</Badge>
                        {featuredArticle.priority === "urgent" && (
                          <Badge variant="destructive" className="font-serif">Breaking</Badge>
                        )}
                        {featuredArticle.priority === "high" && (
                          <Badge className="bg-primary font-serif">Featured</Badge>
                        )}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-lg text-muted-foreground font-serif mb-6 leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-serif">{getTimeAgo(featuredArticle.created_at)}</span>
                        </div>
                        <span>•</span>
                        <span className="font-serif">Mbakalo Rescue Team</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </article>
              )}

              {/* Section Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Latest Stories</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>

              {/* Article Grid - Magazine Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherArticles.map((article) => (
                  <article key={article.id} className="group">
                    <Card className="h-full border-0 shadow-none hover:shadow-medium transition-shadow overflow-hidden">
                      <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="font-serif text-xs">{article.category}</Badge>
                          <span className="text-xs text-muted-foreground font-serif">
                            {getTimeAgo(article.created_at)}
                          </span>
                        </div>
                        <CardTitle className="font-display text-xl leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground font-serif text-sm leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </article>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="development" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.filter(a => a.category === "Development" || a.category === "Water" || a.category === "Infrastructure").map((article) => (
              <Card key={article.id} className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 font-serif">{article.category}</Badge>
                  <CardTitle className="font-display">{article.title}</CardTitle>
                  <CardDescription className="font-serif">{article.excerpt}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          {articles.filter(a => a.category === "Development" || a.category === "Water" || a.category === "Infrastructure").length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground font-serif">No development articles yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="governance" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.filter(a => a.category === "Governance" || a.category === "Politics").map((article) => (
              <Card key={article.id} className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 font-serif">{article.category}</Badge>
                  <CardTitle className="font-display">{article.title}</CardTitle>
                  <CardDescription className="font-serif">{article.excerpt}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          {articles.filter(a => a.category === "Governance" || a.category === "Politics").length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground font-serif">No governance articles yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="health" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.filter(a => a.category === "Health" || a.category === "Medical").map((article) => (
              <Card key={article.id} className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 font-serif">{article.category}</Badge>
                  <CardTitle className="font-display">{article.title}</CardTitle>
                  <CardDescription className="font-serif">{article.excerpt}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          {articles.filter(a => a.category === "Health" || a.category === "Medical").length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground font-serif">No health articles yet.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Sidebar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
        <div className="lg:col-span-2">
          <div className="border-t-4 border-primary pt-8">
            <h3 className="text-2xl font-display font-bold mb-6">About Mbakalo Ward</h3>
            <p className="text-muted-foreground font-serif leading-relaxed">
              Mbakalo Ward is a vibrant community committed to sustainable development, transparent governance, 
              and the well-being of all its residents. Our rescue team works tirelessly to support those in need 
              and coordinate community relief efforts.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card className="shadow-strong border-l-4 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">Rescue Team</CardTitle>
                  <CardDescription className="font-serif">Mbakalo Ward</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium font-serif">Office Hours</p>
                <p className="text-sm text-muted-foreground font-serif">Mon-Fri: 9AM - 5PM</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-lg font-display">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="text-sm font-serif">Active Projects</span>
                </div>
                <span className="font-bold font-display">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-serif">Completed This Year</span>
                </div>
                <span className="font-bold font-display">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-serif">Beneficiaries</span>
                </div>
                <span className="font-bold font-display">2,450+</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-accent border-l-4">
            <CardHeader>
              <CardTitle className="text-lg font-display">Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground font-serif">
                All ward projects, budgets, and expenditures are published monthly for public review and accountability.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}