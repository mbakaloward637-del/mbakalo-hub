import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, TrendingUp, Package } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
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

      // Fetch impact over time (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: assistanceByMonth } = await supabase
        .from("assistance_records")
        .select("date_provided, value_estimate")
        .gte("date_provided", sixMonthsAgo.toISOString().split("T")[0]);

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
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#82ca9d", "#ffc658"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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