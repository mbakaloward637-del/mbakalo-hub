import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  status: string;
  created_at: string;
}

export default function Fundraising() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleDonate = () => {
    if (!phoneNumber || !amount || !selectedProject) {
      toast.error("Please fill all fields");
      return;
    }

    // Mock M-Pesa STK Push
    toast.success("M-Pesa prompt sent! Check your phone to complete payment.");
    
    // Reset form
    setPhoneNumber("");
    setAmount("");
    setSelectedProject(null);
  };

  const totalRaised = projects.reduce((sum, p) => sum + p.raised_amount, 0);
  const totalTarget = projects.reduce((sum, p) => sum + p.target_amount, 0);
  const activeProjects = projects.filter(p => p.status === "active").length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading fundraising projects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Community Fundraising</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Support our community development projects with transparent, secure M-Pesa donations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <Card className="shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">KSh {(totalRaised / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round((totalRaised / totalTarget) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="donate">Donate Now</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {projects.length === 0 ? (
            <Card className="shadow-medium">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No fundraising projects yet.</p>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => {
              const progress = (project.raised_amount / project.target_amount) * 100;
              return (
                <Card key={project.id} className="shadow-medium hover:shadow-strong transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className="bg-primary">{project.category}</Badge>
                        {project.status === "urgent" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                        {project.status === "completed" && (
                          <Badge className="bg-status-verified">Completed</Badge>
                        )}
                      </div>
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
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {progress.toFixed(1)}% funded
                        </p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-primary"
                        onClick={() => {
                          setSelectedProject(project.id);
                          document.querySelector('[value="donate"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                        }}
                      >
                        Contribute Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {projects.filter(p => p.status === "active").map((project) => {
            const progress = (project.raised_amount / project.target_amount) * 100;
            return (
              <Card key={project.id} className="shadow-medium">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-primary"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm">
                    KSh {project.raised_amount.toLocaleString()} raised
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {projects.filter(p => p.status === "completed").map((project) => (
            <Card key={project.id} className="shadow-medium border-status-verified">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <Badge className="bg-status-verified">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  KSh {project.raised_amount.toLocaleString()} raised
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="donate">
          <Card className="shadow-strong max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Donate via M-Pesa</CardTitle>
              <CardDescription>Quick and secure mobile money donations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project">Select Project</Label>
                <select
                  id="project"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={selectedProject || ""}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="">Choose a project...</option>
                  {projects.filter(p => p.status === "active").map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KSh)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button 
                className="w-full bg-gradient-primary" 
                size="lg"
                onClick={handleDonate}
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Send M-Pesa STK Push
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                You will receive an M-Pesa prompt on your phone to complete the payment
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="shadow-medium mt-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <p>Select a project and enter your M-Pesa number</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <p>You will receive an M-Pesa prompt on your phone</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <p>Enter your M-Pesa PIN to complete the donation</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <p>Receive confirmation and see your impact</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transparency Section */}
      <Card className="shadow-medium border-primary mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Transparency & Accountability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Monthly Reports:</strong> All project expenditures are published monthly with receipts and documentation.
          </p>
          <p>
            <strong>Community Oversight:</strong> Ward Development Committee reviews all project finances quarterly.
          </p>
          <p>
            <strong>Direct Impact:</strong> 100% of donations go directly to projects. No administrative fees deducted.
          </p>
          <p>
            <strong>Real-time Updates:</strong> Progress updates posted regularly on this platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
