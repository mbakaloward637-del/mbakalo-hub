import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Package, AlertCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  donor_name?: string;
  donor_contact?: string;
  date_received: string;
  expiry_date?: string;
  storage_location?: string;
  status: string;
  notes?: string;
}

export const DonationsInventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    item_name: "",
    category: "food",
    quantity: "",
    unit: "pieces",
    donor_name: "",
    donor_contact: "",
    date_received: new Date().toISOString().split("T")[0],
    expiry_date: "",
    storage_location: "",
    notes: ""
  });

  const categories = ["food", "clothing", "medical", "hygiene", "education", "other"];
  const units = ["pieces", "kg", "liters", "boxes", "bags", "packs"];

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter, statusFilter]);

  const fetchInventory = async () => {
    try {
      let query = supabase
        .from("donations_inventory")
        .select("*")
        .order("date_received", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({ title: "Error", description: "Failed to load inventory", variant: "destructive" });
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("donations_inventory").insert({
        ...formData,
        quantity: parseInt(formData.quantity),
        expiry_date: formData.expiry_date || null
      });

      if (error) throw error;

      toast({ title: "Success", description: "Inventory item added successfully" });
      setIsAddDialogOpen(false);
      setFormData({
        item_name: "",
        category: "food",
        quantity: "",
        unit: "pieces",
        donor_name: "",
        donor_contact: "",
        date_received: new Date().toISOString().split("T")[0],
        expiry_date: "",
        storage_location: "",
        notes: ""
      });
      fetchInventory();
    } catch (error) {
      console.error("Error adding item:", error);
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.storage_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalByCategory = () => {
    const totals: Record<string, number> = {};
    inventory.forEach(item => {
      if (item.status === "available") {
        totals[item.category] = (totals[item.category] || 0) + item.quantity;
      }
    });
    return totals;
  };

  const categoryTotals = getTotalByCategory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Donations Inventory</h2>
          <p className="text-muted-foreground">Track in-kind donations and manage inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Donation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Donation to Inventory</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_name">Item Name *</Label>
                  <Input
                    id="item_name"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donor_name">Donor Name</Label>
                  <Input
                    id="donor_name"
                    value={formData.donor_name}
                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="donor_contact">Donor Contact</Label>
                  <Input
                    id="donor_contact"
                    value={formData.donor_contact}
                    onChange={(e) => setFormData({ ...formData, donor_contact: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_received">Date Received *</Label>
                  <Input
                    id="date_received"
                    type="date"
                    value={formData.date_received}
                    onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date (if applicable)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  value={formData.storage_location}
                  onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
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
                {loading ? "Adding..." : "Add to Inventory"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Card key={category} className="p-4 text-center">
            <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground capitalize">{category}</p>
            <p className="text-2xl font-bold text-primary">{categoryTotals[category] || 0}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items, donors, or storage location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="distributed">Distributed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => (
          <Card 
            key={item.id} 
            className={`p-6 ${
              isExpired(item.expiry_date) 
                ? "border-destructive bg-destructive/5" 
                : isExpiringSoon(item.expiry_date) 
                ? "border-secondary bg-secondary/5" 
                : ""
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.item_name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  item.status === "available" 
                    ? "bg-secondary/20 text-secondary" 
                    : item.status === "distributed"
                    ? "bg-primary/20 text-primary"
                    : "bg-destructive/20 text-destructive"
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-semibold">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                {item.donor_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Donor:</span>
                    <span>{item.donor_name}</span>
                  </div>
                )}
                {item.storage_location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{item.storage_location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>Received: {new Date(item.date_received).toLocaleDateString()}</span>
                </div>
                {item.expiry_date && (
                  <div className={`flex items-center gap-2 ${
                    isExpired(item.expiry_date) 
                      ? "text-destructive" 
                      : isExpiringSoon(item.expiry_date) 
                      ? "text-secondary" 
                      : "text-muted-foreground"
                  }`}>
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      {isExpired(item.expiry_date) && " (EXPIRED)"}
                      {isExpiringSoon(item.expiry_date) && !isExpired(item.expiry_date) && " (Soon)"}
                    </span>
                  </div>
                )}
              </div>

              {item.notes && (
                <p className="text-sm text-muted-foreground pt-2 border-t">{item.notes}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No inventory items found</p>
        </Card>
      )}
    </div>
  );
};