import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Users, Newspaper, Calendar, Heart, DollarSign } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your community platform</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Users"
          icon={<Users className="h-5 w-5" />}
          table="profiles"
        />
        <StatsCard
          title="News Articles"
          icon={<Newspaper className="h-5 w-5" />}
          table="news_articles"
        />
        <StatsCard
          title="Events"
          icon={<Calendar className="h-5 w-5" />}
          table="events"
        />
        <StatsCard
          title="Funerals"
          icon={<Heart className="h-5 w-5" />}
          table="funeral_notices"
        />
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="news" className="space-y-4">
        <TabsList>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="funerals">Funerals</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <NewsManagement />
        </TabsContent>

        <TabsContent value="events">
          <EventsManagement />
        </TabsContent>

        <TabsContent value="funerals">
          <FuneralsManagement />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, icon, table }: { title: string; icon: React.ReactNode; table: "profiles" | "news_articles" | "events" | "funeral_notices" }) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetchCount();
  }, [table]);

  const fetchCount = async () => {
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    setCount(count || 0);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
}

function NewsManagement() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("community");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("news_articles").insert([{
        title,
        excerpt,
        content: content || null,
        category,
        priority,
      }]);

      if (error) throw error;

      toast.success("News article created successfully!");
      setTitle("");
      setExcerpt("");
      setContent("");
      setCategory("community");
      setPriority("normal");
    } catch (error) {
      toast.error("Failed to create news article");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create News Article</CardTitle>
        <CardDescription>Add a new news article to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="politics">Politics</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Article
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EventsManagement() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [category, setCategory] = useState("community");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("events").insert([{
        title,
        description,
        location,
        event_date: eventDate,
        event_time: eventTime,
        category,
      }]);

      if (error) throw error;

      toast.success("Event created successfully!");
      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");
      setEventTime("");
      setCategory("community");
    } catch (error) {
      toast.error("Failed to create event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
        <CardDescription>Add a new event to the calendar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="event-time">Time</Label>
              <Input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="event-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Event
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FuneralsManagement() {
  const [deceasedName, setDeceasedName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [passedDate, setPassedDate] = useState("");
  const [burialDate, setBurialDate] = useState("");
  const [burialTime, setBurialTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("funeral_notices").insert([{
        deceased_name: deceasedName,
        family_name: familyName,
        age: age ? parseInt(age) : null,
        location,
        passed_date: passedDate,
        burial_date: burialDate,
        burial_time: burialTime,
      }]);

      if (error) throw error;

      toast.success("Funeral notice created successfully!");
      setDeceasedName("");
      setFamilyName("");
      setAge("");
      setLocation("");
      setPassedDate("");
      setBurialDate("");
      setBurialTime("");
    } catch (error) {
      toast.error("Failed to create funeral notice");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Funeral Notice</CardTitle>
        <CardDescription>Add a new funeral notice</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deceased-name">Deceased Name</Label>
              <Input
                id="deceased-name"
                value={deceasedName}
                onChange={(e) => setDeceasedName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="family-name">Family Name</Label>
              <Input
                id="family-name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="funeral-location">Location</Label>
              <Input
                id="funeral-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="passed-date">Date of Passing</Label>
            <Input
              id="passed-date"
              type="date"
              value={passedDate}
              onChange={(e) => setPassedDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="burial-date">Burial Date</Label>
              <Input
                id="burial-date"
                type="date"
                value={burialDate}
                onChange={(e) => setBurialDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="burial-time">Burial Time</Label>
              <Input
                id="burial-time"
                type="time"
                value={burialTime}
                onChange={(e) => setBurialTime(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Notice
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProjectsManagement() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("infrastructure");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("projects").insert([{
        title,
        description,
        target_amount: parseInt(targetAmount),
        category,
      }]);

      if (error) throw error;

      toast.success("Project created successfully!");
      setTitle("");
      setDescription("");
      setTargetAmount("");
      setCategory("infrastructure");
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Add a new fundraising project</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project-title">Title</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-amount">Target Amount (KSh)</Label>
              <Input
                id="target-amount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="project-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Project
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
