import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Shield, Edit, Trash2, Search } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  village: string;
  profile_pic_url: string | null;
  role: string;
  rank: string;
  status: string;
  created_at: string;
}

interface SearchUser {
  id: string;
  full_name: string;
  village: string;
  avatar_url: string | null;
}

export const RescueTeamManagement = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: "",
    role: "member",
    rank: "volunteer"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, village, avatar_url')
        .ilike('full_name', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      
      // Filter out users who are already team members
      const memberUserIds = members.map(m => m.user_id);
      const filteredData = (data || []).filter(user => !memberUserIds.includes(user.id));
      
      setSearchResults(filteredData);
    } catch (error: any) {
      toast({
        title: "Error searching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('rescue_team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading members",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMember) {
        const { error } = await supabase
          .from('rescue_team_members')
          .update({
            phone_number: formData.phone_number,
            role: formData.role,
            rank: formData.rank
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        toast({ title: "Member updated successfully" });
      } else {
        if (!selectedUser) {
          toast({
            title: "Error",
            description: "Please select a user",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { error: memberError } = await supabase
          .from('rescue_team_members')
          .insert({
            user_id: selectedUser.id,
            full_name: selectedUser.full_name,
            phone_number: formData.phone_number,
            village: selectedUser.village,
            role: formData.role,
            rank: formData.rank
          });

        if (memberError) throw memberError;
        toast({ title: "Member added successfully" });
      }

      setDialogOpen(false);
      setEditingMember(null);
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      setFormData({
        phone_number: "",
        role: "member",
        rank: "volunteer"
      });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      phone_number: member.phone_number,
      role: member.role,
      rank: member.rank
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const { error } = await supabase
        .from('rescue_team_members')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Member removed successfully" });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'leader': 'bg-red-500',
      'coordinator': 'bg-orange-500',
      'medic': 'bg-green-500',
      'driver': 'bg-blue-500',
      'member': 'bg-gray-500'
    };
    return colors[role.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold">Rescue Team Management</h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Member" : "Add New Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingMember && (
                <>
                  <div>
                    <Label htmlFor="search">Search User</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        disabled={selectedUser !== null}
                      />
                    </div>
                  </div>

                  {selectedUser ? (
                    <div className="p-4 border rounded-lg bg-muted">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {selectedUser.avatar_url && <AvatarImage src={selectedUser.avatar_url} />}
                            <AvatarFallback>
                              {selectedUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedUser.full_name}</p>
                            <p className="text-sm text-muted-foreground">{selectedUser.village}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(null);
                            setSearchQuery("");
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto border rounded-lg">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchResults([]);
                            }}
                            className="w-full p-3 hover:bg-muted flex items-center gap-3 text-left transition-colors"
                          >
                            <Avatar className="h-8 w-8">
                              {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                              <AvatarFallback className="text-xs">
                                {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground">{user.village}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}

              {(editingMember || selectedUser) && (
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                  />
                </div>
              )}
              {(editingMember || selectedUser) && (
                <>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="leader">Leader</SelectItem>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                        <SelectItem value="medic">Medic</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rank">Rank</Label>
                    <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="specialist">Specialist</SelectItem>
                        <SelectItem value="commander">Commander</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingMember ? "Update" : "Add Member"}
                  </Button>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {member.profile_pic_url ? (
                        <AvatarImage src={member.profile_pic_url} />
                      ) : null}
                      <AvatarFallback className="bg-red-500/10 text-red-600">
                        {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.full_name}</span>
                  </div>
                </TableCell>
                <TableCell>{member.phone_number}</TableCell>
                <TableCell>{member.village}</TableCell>
                <TableCell>
                  <Badge className={`${getRoleBadgeColor(member.role)} text-white`}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{member.rank}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};
