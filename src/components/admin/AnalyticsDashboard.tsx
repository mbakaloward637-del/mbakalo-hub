import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  uniqueDonors: number;
  averageDonation: number;
}

interface DonationByDate {
  date: string;
  amount: number;
  count: number;
}

interface TopProject {
  title: string;
  amount: number;
  count: number;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DonationStats>({
    totalDonations: 0,
    totalAmount: 0,
    uniqueDonors: 0,
    averageDonation: 0,
  });
  const [donationsByDate, setDonationsByDate] = useState<DonationByDate[]>([]);
  const [topProjects, setTopProjects] = useState<TopProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all donations
      const { data: donations, error } = await supabase
        .from("donations")
        .select(`
          *,
          projects(title),
          funeral_notices(deceased_name)
        `)
        .eq("status", "completed");

      if (error) throw error;

      // Calculate stats
      const totalDonations = donations?.length || 0;
      const totalAmount = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const uniqueDonors = new Set(donations?.map(d => d.donor_phone)).size;
      const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

      setStats({
        totalDonations,
        totalAmount,
        uniqueDonors,
        averageDonation,
      });

      // Group by date
      const byDate: { [key: string]: { amount: number; count: number } } = {};
      donations?.forEach(d => {
        const date = new Date(d.created_at!).toLocaleDateString();
        if (!byDate[date]) {
          byDate[date] = { amount: 0, count: 0 };
        }
        byDate[date].amount += d.amount;
        byDate[date].count += 1;
      });

      const dateData = Object.entries(byDate)
        .map(([date, data]) => ({
          date,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      setDonationsByDate(dateData);

      // Top projects
      const projectTotals: { [key: string]: { amount: number; count: number } } = {};
      donations?.forEach(d => {
        const title = d.projects?.title || d.funeral_notices?.deceased_name || "Unknown";
        if (!projectTotals[title]) {
          projectTotals[title] = { amount: 0, count: 0 };
        }
        projectTotals[title].amount += d.amount;
        projectTotals[title].count += 1;
      });

      const projectData = Object.entries(projectTotals)
        .map(([title, data]) => ({
          title,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setTopProjects(projectData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data: donations, error } = await supabase
        .from("donations")
        .select(`
          *,
          projects(title),
          funeral_notices(deceased_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const csvContent = [
        ["Date", "Donor Name", "Phone", "Amount", "Project/Funeral", "Status", "M-Pesa Receipt"].join(","),
        ...donations!.map(d => [
          new Date(d.created_at!).toLocaleString(),
          d.donor_name,
          d.donor_phone,
          d.amount,
          d.projects?.title || d.funeral_notices?.deceased_name || "N/A",
          d.status,
          d.mpesa_receipt_number || "N/A",
        ].join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8884d8", "#82ca9d"];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueDonors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {Math.round(stats.averageDonation).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Donations Over Time</CardTitle>
            <CardDescription>Daily donation amounts (Last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={donationsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Amount (KSh)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Projects/Funerals</CardTitle>
            <CardDescription>By total donations received</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProjects}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="title" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="amount" fill="hsl(var(--secondary))" name="Amount (KSh)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Distribution</CardTitle>
            <CardDescription>Top 5 projects by amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProjects}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ title, percent }) => `${title}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {topProjects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Count</CardTitle>
            <CardDescription>Number of donations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={donationsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  name="Donations"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
