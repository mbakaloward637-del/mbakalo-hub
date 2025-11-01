import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, MapPin, Phone, Mail, Calendar, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Beneficiary {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  location: string;
  village?: string;
  needs: string[];
  status: string;
  notes?: string;
  created_at: string;
}

interface AssistanceRecord {
  id: string;
  assistance_type: string;
  description: string;
  date_provided: string;
  value_estimate?: number;
}

export const BeneficiaryManagement = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [assistanceHistory, setAssistanceHistory] = useState<AssistanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    location: "",
    village: "",
    needs: "",
    notes: ""
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, [statusFilter]);

  const fetchBeneficiaries = async () => {
    try {
      let query = supabase.from("beneficiaries").select("*").order("created_at", { ascending: false });
      
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      toast({ title: "Error", description: "Failed to load beneficiaries", variant: "destructive" });
    }
  };

  const fetchAssistanceHistory = async (beneficiaryId: string) => {
    try {
      const { data, error } = await supabase
        .from("assistance_records")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("date_provided", { ascending: false });

      if (error) throw error;
      setAssistanceHistory(data || []);
    } catch (error) {
      console.error("Error fetching assistance history:", error);
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("beneficiaries").insert({
        ...formData,
        needs: formData.needs.split(",").map(n => n.trim()).filter(Boolean),
        created_by: user?.id
      });

      if (error) throw error;

      toast({ title: "Success", description: "Beneficiary added successfully" });
      setIsAddDialogOpen(false);
      setFormData({ full_name: "", phone: "", email: "", location: "", village: "", needs: "", notes: "" });
      fetchBeneficiaries();
    } catch (error) {
      console.error("Error adding beneficiary:", error);
      toast({ title: "Error", description: "Failed to add beneficiary", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    await fetchAssistanceHistory(beneficiary.id);
    setIsHistoryDialogOpen(true);
  };

  const filteredBeneficiaries = beneficiaries.filter(b =>
    b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.village?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Beneficiary Management</h2>
          <p className="text-muted-foreground">Track and manage community members receiving assistance</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Beneficiary</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBeneficiary} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="needs">Needs (comma-separated) *</Label>
                <Input
                  id="needs"
                  placeholder="e.g., Food, Clothing, Medical"
                  value={formData.needs}
                  onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Beneficiary"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or village..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Beneficiaries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeneficiaries.map((beneficiary) => (
          <Card key={beneficiary.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{beneficiary.full_name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    beneficiary.status === "active" 
                      ? "bg-secondary/20 text-secondary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {beneficiary.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {beneficiary.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{beneficiary.phone}</span>
                  </div>
                )}
                {beneficiary.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{beneficiary.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{beneficiary.village ? `${beneficiary.village}, ${beneficiary.location}` : beneficiary.location}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Needs:</p>
                <div className="flex flex-wrap gap-2">
                  {beneficiary.needs.map((need, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={() => handleViewHistory(beneficiary)}
              >
                <Heart className="h-4 w-4" />
                View Assistance History
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredBeneficiaries.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No beneficiaries found</p>
        </Card>
      )}

      {/* Assistance History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Assistance History - {selectedBeneficiary?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {assistanceHistory.length > 0 ? (
              assistanceHistory.map((record) => (
                <Card key={record.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{record.assistance_type}</span>
                        {record.value_estimate && (
                          <span className="text-sm text-muted-foreground">
                            (KES {record.value_estimate.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(record.date_provided).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No assistance records yet
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};