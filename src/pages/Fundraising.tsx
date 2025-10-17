import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const projects = [
  {
    id: 1,
    title: "Community Borehole Project",
    description: "Provide clean water access to over 500 households in Mbakalo Ward",
    category: "Water",
    raised: 450000,
    goal: 800000,
    status: "active",
    donors: 156,
  },
  {
    id: 2,
    title: "Youth Training Center",
    description: "Equip young people with digital skills and vocational training",
    category: "Education",
    raised: 280000,
    goal: 500000,
    status: "active",
    donors: 89,
  },
  {
    id: 3,
    title: "Mama Alice Medical Fund",
    description: "Emergency medical support for community elder",
    category: "Health",
    raised: 85000,
    goal: 150000,
    status: "urgent",
    donors: 124,
  },
  {
    id: 4,
    title: "School Renovation Project",
    description: "Renovate classrooms and provide new desks",
    category: "Education",
    raised: 320000,
    goal: 400000,
    status: "active",
    donors: 67,
  },
];

const recentDonations = [
  { name: "John K.", amount: 5000, project: "Borehole Project", time: "5 mins ago" },
  { name: "Mary W.", amount: 2000, project: "Medical Fund", time: "23 mins ago" },
  { name: "Peter M.", amount: 10000, project: "Training Center", time: "1 hour ago" },
  { name: "Grace N.", amount: 3000, project: "School Renovation", time: "2 hours ago" },
];

export default function Fundraising() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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
                <p className="text-2xl font-bold">KSh 1.2M</p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">436</p>
                <p className="text-sm text-muted-foreground">Total Donors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {projects.map((project) => {
                const progress = (project.raised / project.goal) * 100;
                return (
                  <Card 
                    key={project.id} 
                    className={`shadow-medium hover:shadow-strong transition-all cursor-pointer ${
                      selectedProject === project.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>{project.category}</Badge>
                            {project.status === "urgent" && (
                              <Badge variant="destructive">Urgent</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                              KSh {project.raised.toLocaleString()} raised
                            </span>
                            <span className="font-semibold">
                              Goal: KSh {project.goal.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-primary transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{project.donors} donors</span>
                          <span>{Math.round(progress)}% funded</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="active">
              <div className="space-y-6">
                {projects.filter(p => p.status === "active").map((project) => {
                  const progress = (project.raised / project.goal) * 100;
                  return (
                    <Card key={project.id} className="shadow-medium">
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="urgent">
              <div className="space-y-6">
                {projects.filter(p => p.status === "urgent").map((project) => (
                  <Card key={project.id} className="shadow-medium border-secondary">
                    <CardHeader>
                      <Badge variant="destructive" className="w-fit mb-2">Urgent</Badge>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Donation Form */}
        <div>
          <Card className="shadow-strong sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Donate via M-Pesa
              </CardTitle>
              <CardDescription>
                Safe, instant, and transparent donations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="project">Select Project</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProject 
                    ? projects.find(p => p.id === selectedProject)?.title
                    : "Click a project above to select"}
                </p>
              </div>

              <div>
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input 
                  id="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (KSh)</Label>
                <Input 
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1"
                />
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 2000, 5000].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-primary" 
                size="lg"
                onClick={handleDonate}
                disabled={!selectedProject}
              >
                Send M-Pesa Prompt
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You'll receive an M-Pesa prompt on your phone. Enter your PIN to complete the donation.
              </p>
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card className="shadow-medium mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{donation.name}</p>
                      <p className="text-xs text-muted-foreground">{donation.project}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">+KSh {donation.amount}</p>
                      <p className="text-xs text-muted-foreground">{donation.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
