import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, TrendingUp, Package, RefreshCw, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalDonations: 0,
    activeVolunteers: 0,
    ongoingCampaigns: 0,
    totalAssistanceValue: 0,
    inventoryItems: 0
  });
  const [impactData, setImpactData] = useState<any[]>([]);
  const [donationsByType, setDonationsByType] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("6");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: "Dashboard refreshed",
      description: "All data has been updated successfully.",
    });
  };

  const fetchDashboardData = async () => {
    try {
      setError(null);
      // Fetch total beneficiaries
      const { count: beneficiariesCount } = await supabase
        .from("beneficiaries")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch total monetary donations
      const { data: donations } = await supabase
        .from("donations")
        .select("amount")
        .eq("status", "completed");
      
      const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      // Fetch active volunteers
      const { count: volunteersCount } = await supabase
        .from("volunteers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch ongoing campaigns
      const { count: campaignsCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch total assistance value
      const { data: assistanceRecords } = await supabase
        .from("assistance_records")
        .select("value_estimate");
      
      const totalAssistanceValue = assistanceRecords?.reduce((sum, a) => sum + (a.value_estimate || 0), 0) || 0;

      // Fetch inventory items count
      const { count: inventoryCount } = await supabase
        .from("donations_inventory")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");

      setStats({
        totalBeneficiaries: beneficiariesCount || 0,
        totalDonations,
        activeVolunteers: volunteersCount || 0,
        ongoingCampaigns: campaignsCount || 0,
        totalAssistanceValue,
        inventoryItems: inventoryCount || 0
      });

      // Fetch impact over time (based on selected time range)
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(timeRange));
      
      const { data: assistanceByMonth } = await supabase
        .from("assistance_records")
        .select("date_provided, value_estimate")
        .gte("date_provided", monthsAgo.toISOString().split("T")[0])
        .order("date_provided", { ascending: true });

      // Group by month
      const monthlyImpact = assistanceByMonth?.reduce((acc: any, record) => {
        const month = new Date(record.date_provided).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        if (!acc[month]) {
          acc[month] = { month, value: 0 };
        }
        acc[month].value += record.value_estimate || 0;
        return acc;
      }, {});

      setImpactData(Object.values(monthlyImpact || {}));

      // Fetch donations by category
      const { data: inventoryByCategory } = await supabase
        .from("donations_inventory")
        .select("category, quantity");

      const categoryTotals = inventoryByCategory?.reduce((acc: any, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { name: item.category, value: 0 };
        }
        acc[item.category].value += item.quantity;
        return acc;
      }, {});

      setDonationsByType(Object.values(categoryTotals || {}));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#82ca9d", "#ffc658"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>
            <Button onClick={handleRefresh} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Track your community impact in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Month</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="icon"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalBeneficiaries}</p>
            </div>
            <Users className="h-12 w-12 text-primary opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-3xl font-bold text-secondary mt-2">KES {stats.totalDonations.toLocaleString()}</p>
            </div>
            <Heart className="h-12 w-12 text-secondary opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Volunteers</p>
              <p className="text-3xl font-bold text-accent mt-2">{stats.activeVolunteers}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-accent opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inventory Items</p>
              <p className="text-3xl font-bold text-secondary mt-2">{stats.inventoryItems}</p>
            </div>
            <Package className="h-12 w-12 text-secondary opacity-80" />
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Ongoing Campaigns</h3>
          <p className="text-4xl font-bold text-primary">{stats.ongoingCampaigns}</p>
          <p className="text-sm text-muted-foreground mt-2">Active donation drives</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Assistance Value</h3>
          <p className="text-4xl font-bold text-secondary">KES {stats.totalAssistanceValue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">Estimated value of help provided</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact Over Time */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Impact Over Time</h3>
          {impactData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Value (KES)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-20">No data available yet</p>
          )}
        </Card>

        {/* Donations by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Donations by Category</h3>
          {donationsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={donationsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {donationsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-20">No inventory data available yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};