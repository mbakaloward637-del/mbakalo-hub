import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin } from "lucide-react";

interface YouthProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    full_name: string;
    profile_pic_url?: string | null;
    village?: string;
    phone_number?: string;
  } | null;
}

export const YouthProfileDialog = ({ open, onOpenChange, profile }: YouthProfileDialogProps) => {
  if (!profile) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            {profile.profile_pic_url ? (
              <AvatarImage src={profile.profile_pic_url} alt={profile.full_name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{profile.full_name}</h3>
            <Badge variant="secondary" className="mt-2">Youth Member</Badge>
          </div>

          <div className="w-full space-y-3 mt-4">
            {profile.village && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.village}</span>
              </div>
            )}
            {profile.phone_number && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone_number}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
