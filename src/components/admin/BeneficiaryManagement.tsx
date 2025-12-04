import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, MapPin, Phone, Mail, Calendar, Heart, Edit, Trash2 } from "lucide-react";
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
  items_provided?: string[];
}

export const BeneficiaryManagement = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [assistanceHistory, setAssistanceHistory] = useState<AssistanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isAssistanceDialogOpen, setIsAssistanceDialogOpen] = useState(false);
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

  const [assistanceForm, setAssistanceForm] = useState({
    assistance_type: "",
    description: "",
    date_provided: new Date().toISOString().split("T")[0],
    value_estimate: "",
    items_provided: ""
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

  const handleAddAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("assistance_records").insert({
        beneficiary_id: selectedBeneficiary.id,
        assistance_type: assistanceForm.assistance_type,
        description: assistanceForm.description,
        date_provided: assistanceForm.date_provided,
        value_estimate: assistanceForm.value_estimate ? parseInt(assistanceForm.value_estimate) : null,
        items_provided: assistanceForm.items_provided ? assistanceForm.items_provided.split(",").map(i => i.trim()) : null,
        volunteer_id: user?.id
      });

      if (error) throw error;

      toast({ title: "Success", description: "Assistance record added" });
      setIsAssistanceDialogOpen(false);
      setAssistanceForm({
        assistance_type: "",
        description: "",
        date_provided: new Date().toISOString().split("T")[0],
        value_estimate: "",
        items_provided: ""
      });
      fetchAssistanceHistory(selectedBeneficiary.id);
    } catch (error) {
      console.error("Error adding assistance:", error);
      toast({ title: "Error", description: "Failed to add assistance record", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (beneficiaryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({ status: newStatus })
        .eq("id", beneficiaryId);

      if (error) throw error;
      toast({ title: "Status updated" });
      fetchBeneficiaries();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDeleteBeneficiary = async (beneficiaryId: string) => {
    if (!confirm("Are you sure you want to delete this beneficiary?")) return;

    try {
      const { error } = await supabase
        .from("beneficiaries")
        .delete()
        .eq("id", beneficiaryId);

      if (error) throw error;
      toast({ title: "Beneficiary deleted" });
      fetchBeneficiaries();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete beneficiary", variant: "destructive" });
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-2xl font-bold">{beneficiaries.length}</p>
          <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">{beneficiaries.filter(b => b.status === "active").length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-muted-foreground">{beneficiaries.filter(b => b.status === "inactive").length}</p>
          <p className="text-sm text-muted-foreground">Inactive</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-primary">{assistanceHistory.length}</p>
          <p className="text-sm text-muted-foreground">Assistance Records</p>
        </Card>
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
                  <Select 
                    value={beneficiary.status} 
                    onValueChange={(value) => handleUpdateStatus(beneficiary.id, value)}
                  >
                    <SelectTrigger className="w-24 h-7 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => handleViewHistory(beneficiary)}
                >
                  <Heart className="h-4 w-4" />
                  History
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => {
                    setSelectedBeneficiary(beneficiary);
                    setIsAssistanceDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Record
                </Button>
              </div>
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
                      {record.items_provided && record.items_provided.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {record.items_provided.map((item, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{item}</span>
                          ))}
                        </div>
                      )}
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

      {/* Add Assistance Dialog */}
      <Dialog open={isAssistanceDialogOpen} onOpenChange={setIsAssistanceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add Assistance for {selectedBeneficiary?.full_name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAssistance} className="space-y-4">
            <div>
              <Label htmlFor="assistance_type">Type of Assistance *</Label>
              <Select 
                value={assistanceForm.assistance_type} 
                onValueChange={(value) => setAssistanceForm({ ...assistanceForm, assistance_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Shelter">Shelter</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={assistanceForm.description}
                onChange={(e) => setAssistanceForm({ ...assistanceForm, description: e.target.value })}
                placeholder="Describe the assistance provided..."
                required
              />
            </div>

            <div>
              <Label htmlFor="items_provided">Items Provided (comma-separated)</Label>
              <Input
                id="items_provided"
                value={assistanceForm.items_provided}
                onChange={(e) => setAssistanceForm({ ...assistanceForm, items_provided: e.target.value })}
                placeholder="e.g., Rice, Beans, Cooking oil"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_provided">Date *</Label>
                <Input
                  id="date_provided"
                  type="date"
                  value={assistanceForm.date_provided}
                  onChange={(e) => setAssistanceForm({ ...assistanceForm, date_provided: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="value_estimate">Value Estimate (KES)</Label>
                <Input
                  id="value_estimate"
                  type="number"
                  value={assistanceForm.value_estimate}
                  onChange={(e) => setAssistanceForm({ ...assistanceForm, value_estimate: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading || !assistanceForm.assistance_type} className="w-full">
              {loading ? "Adding..." : "Add Assistance Record"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};