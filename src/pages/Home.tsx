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
  const [isRescueTeamMember, setIsRescueTeamMember] = useState(false);
  const [stats, setStats] = useState({
    members: 0,
    fundsRaised: 0,
    activeProjects: 0,
    eventsThisMonth: 0
  });

  useEffect(() => {
    fetchData();
    fetchGalleryImages();
    checkRescueTeamMembership();
  }, []);

  const checkRescueTeamMembership = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from("rescue_team_members")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .maybeSingle();

      if (data) {
        setIsRescueTeamMember(true);
        fetchStats();
      }
    }
  };

  useEffect(() => {
    if (galleryImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [galleryImages]);

  const fetchStats = async () => {
    const { count: membersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { data: donationsData } = await supabase
      .from("donations")
      .select("amount")
      .eq("status", "completed");

    const totalRaised = donationsData?.reduce((sum, d) => sum + d.amount, 0) || 0;

    const { count: projectsCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

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
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(2);

    if (projectsData) setProjects(projectsData);

    const { data: newsData } = await supabase
      .from("news_articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (newsData) setNews(newsData);

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
      {/* Magazine-Style Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
        
        <div className="relative container mx-auto px-6 lg:px-8 h-full flex flex-col justify-end pb-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary text-secondary-foreground px-4 py-1 text-sm">Community Platform</Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Welcome to Mbakalo Rescue Team
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-10 leading-relaxed max-w-2xl">
              Your digital home for community updates, transparent development, and staying connected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" className="text-base" asChild>
                <Link to="/fundraising">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Donate via M-Pesa
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-base" asChild>
                <Link to="/news">
                  <Newspaper className="mr-2 h-5 w-5" />
                  Latest News
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats - Rescue Team Only */}
      {isRescueTeamMember && (
        <section className="container mx-auto px-6 lg:px-8 -mt-16 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Active Members", value: stats.members.toLocaleString(), color: "bg-primary" },
              { icon: DollarSign, label: "Funds Raised", value: `KSh ${stats.fundsRaised.toLocaleString()}`, color: "bg-secondary" },
              { icon: TrendingUp, label: "Projects Active", value: stats.activeProjects.toString(), color: "bg-accent" },
              { icon: Calendar, label: "Events This Month", value: stats.eventsThisMonth.toString(), color: "bg-primary-light" },
            ].map((stat, index) => (
              <Card key={index} className="bg-card border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-xl shadow-soft`}>
                      <stat.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Active Fundraising Projects */}
      <section className="container mx-auto px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-secondary font-medium uppercase tracking-wider text-sm mb-2">Support Our Community</p>
            <h2 className="font-display text-4xl font-bold">Active Projects</h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/fundraising">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-12 text-center text-muted-foreground">
                No active projects at the moment. Check back soon!
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => {
              const progress = Math.round((project.raised_amount / project.target_amount) * 100);
              return (
                <Card key={project.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription className="mt-1">{project.category}</CardDescription>
                      </div>
                      <Badge className="bg-gradient-gold text-secondary-foreground font-semibold">{progress}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            KSh {project.raised_amount.toLocaleString()} / KSh {project.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-gold transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Button className="w-full" variant="secondary" asChild>
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

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Recent News & Events Grid */}
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent News */}
            <div>
              <p className="text-secondary font-medium uppercase tracking-wider text-sm mb-2">Stay Informed</p>
              <h2 className="font-display text-4xl font-bold mb-8">Recent News</h2>
              <div className="space-y-4">
                {news.length === 0 ? (
                  <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                      No news articles yet. Check back soon!
                    </CardContent>
                  </Card>
                ) : (
                  news.map((article) => (
                    <Card key={article.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant={article.priority === "urgent" ? "destructive" : "secondary"}>
                                {article.category}
                              </Badge>
                              {article.priority === "urgent" && (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/20">Urgent</Badge>
                              )}
                            </div>
                            <h3 className="font-display font-semibold text-lg mb-2">{article.title}</h3>
                            <p className="text-sm text-muted-foreground">{getTimeAgo(article.created_at)}</p>
                          </div>
                          <Newspaper className="h-5 w-5 text-secondary flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link to="/news">View All News</Link>
              </Button>
            </div>

            {/* Upcoming Events */}
            <div>
              <p className="text-accent font-medium uppercase tracking-wider text-sm mb-2">Mark Your Calendar</p>
              <h2 className="font-display text-4xl font-bold mb-8">Upcoming Events</h2>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                      No upcoming events yet. Check back soon!
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-soft">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-semibold text-lg mb-1">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.event_date} at {event.event_time}</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link to="/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="container mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium uppercase tracking-wider text-sm mb-2">Navigate</p>
          <h2 className="font-display text-4xl font-bold">Explore More</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Community Gossip", desc: "Stay updated with verified community stories", icon: MessageSquare, link: "/gossip", color: "bg-primary" },
            { title: "Funerals & Notices", desc: "Pay respects and support families", icon: Heart, link: "/funerals", color: "bg-secondary" },
            { title: "Ward Leaders", desc: "Connect with your representatives", icon: Users, link: "/leaders", color: "bg-accent" },
            { title: "Youth Development", desc: "Skills, jobs, and opportunities", icon: TrendingUp, link: "/youth", color: "bg-primary-light" },
          ].map((item, index) => (
            <Card key={index} className="group">
              <CardHeader>
                <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-soft group-hover:shadow-medium transition-shadow`}>
                  <item.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="leading-relaxed">{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:bg-muted transition-colors" asChild>
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
