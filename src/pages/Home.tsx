import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Users,
  DollarSign,
  Newspaper,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  target_amount: number;
  raised_amount: number;
}

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  created_at: string;
  priority: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({
    members: 0,
    fundsRaised: 0,
    activeProjects: 0,
    eventsThisMonth: 0
  });

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchGalleryImages();
  }, []);

  useEffect(() => {
    if (galleryImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [galleryImages]);

  const fetchStats = async () => {
    // Count active members
    const { count: membersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Sum total funds raised from completed donations
    const { data: donationsData } = await supabase
      .from("donations")
      .select("amount")
      .eq("status", "completed");

    const totalRaised = donationsData?.reduce((sum, d) => sum + d.amount, 0) || 0;

    // Count active projects
    const { count: projectsCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Count events this month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const { count: eventsCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("event_date", firstDay)
      .lte("event_date", lastDay);

    setStats({
      members: membersCount || 0,
      fundsRaised: totalRaised,
      activeProjects: projectsCount || 0,
      eventsThisMonth: eventsCount || 0
    });
  };

  const fetchGalleryImages = async () => {
    const { data } = await supabase
      .from("gallery_images")
      .select("id, image_url, title")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setGalleryImages(data);
    }
  };

  const fetchData = async () => {
    // Fetch active projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(2);

    if (projectsData) setProjects(projectsData);

    // Fetch recent news
    const { data: newsData } = await supabase
      .from("news_articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (newsData) setNews(newsData);

    // Fetch upcoming events
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (eventsData) setEvents(eventsData);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };
  return (
    <div>
      {/* Hero Section with Auto-Cycling Gallery */}
      <section className="relative h-[500px] overflow-hidden">
        {galleryImages.length > 0 ? (
          galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image.image_url} 
                alt={image.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        
        {/* Subtle text background only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to Mbakalo Ward
          </h1>
          <p className="text-xl text-white/95 mb-8 max-w-2xl drop-shadow-md">
            Your digital home for community updates, transparent development, and staying connected.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/fundraising">
                <DollarSign className="mr-2 h-5 w-5" />
                Donate via M-Pesa
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20" asChild>
              <Link to="/news">
                <Newspaper className="mr-2 h-5 w-5" />
                Latest News
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Active Members", value: stats.members.toLocaleString(), color: "bg-primary" },
            { icon: DollarSign, label: "Funds Raised", value: `KSh ${stats.fundsRaised.toLocaleString()}`, color: "bg-secondary" },
            { icon: TrendingUp, label: "Projects Active", value: stats.activeProjects.toString(), color: "bg-accent" },
            { icon: Calendar, label: "Events This Month", value: stats.eventsThisMonth.toString(), color: "bg-primary-light" },
          ].map((stat, index) => (
            <Card key={index} className="shadow-medium">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Active Fundraising Projects */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Active Projects</h2>
            <p className="text-muted-foreground">Support our community development initiatives</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/fundraising">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <Card className="shadow-medium col-span-2">
              <CardContent className="p-8 text-center text-muted-foreground">
                No active projects at the moment. Check back soon!
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => {
              const progress = Math.round((project.raised_amount / project.target_amount) * 100);
              return (
                <Card key={project.id} className="shadow-medium hover:shadow-strong transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>Category: {project.category}</CardDescription>
                      </div>
                      <Badge className="bg-gradient-primary">{progress}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            KSh {project.raised_amount.toLocaleString()} / KSh {project.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-primary" asChild>
                        <Link to="/fundraising">Contribute Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Recent News & Events Grid */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent News */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Recent News</h2>
              <div className="space-y-4">
                {news.length === 0 ? (
                  <Card className="shadow-soft">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No news articles yet. Check back soon!
                    </CardContent>
                  </Card>
                ) : (
                  news.map((article) => (
                    <Card key={article.id} className="shadow-soft hover:shadow-medium transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={article.priority === "urgent" ? "destructive" : "secondary"}>
                                {article.category}
                              </Badge>
                              {article.priority === "urgent" && (
                                <Badge variant="secondary">Urgent</Badge>
                              )}
                            </div>
                            <h3 className="font-semibold mb-1">{article.title}</h3>
                            <p className="text-sm text-muted-foreground">{getTimeAgo(article.created_at)}</p>
                          </div>
                          <Newspaper className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/news">View All News</Link>
              </Button>
            </div>

            {/* Upcoming Events */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <Card className="shadow-soft">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No upcoming events yet. Check back soon!
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id} className="shadow-soft hover:shadow-medium transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.event_date} at {event.event_time}</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore More</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Community Gossip", desc: "Stay updated with verified community stories", icon: MessageSquare, link: "/gossip", color: "primary" },
            { title: "Funerals & Notices", desc: "Pay respects and support families", icon: Heart, link: "/funerals", color: "secondary" },
            { title: "Ward Leaders", desc: "Connect with your representatives", icon: Users, link: "/leaders", color: "primary-light" },
            { title: "Youth Development", desc: "Skills, jobs, and opportunities", icon: TrendingUp, link: "/youth", color: "accent" },
          ].map((item, index) => (
            <Card key={index} className="shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <CardHeader>
                <div className={`bg-${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={item.link}>
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
