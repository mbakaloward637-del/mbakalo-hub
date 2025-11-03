import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Loader2, Smile, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  rescue_team_members?: {
    full_name: string;
    profile_pic_url: string | null;
    role: string;
    rank: string;
  };
}

export const RescueTeamChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    fetchMessages();
    
    const channel = supabase
      .channel('rescue-team-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rescue_team_chat_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUserId) {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data: chatMessages, error: messagesError } = await supabase
        .from('rescue_team_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      const userIds = [...new Set(chatMessages?.map(m => m.user_id) || [])];
      
      const { data: members } = await supabase
        .from('rescue_team_members')
        .select('user_id, full_name, profile_pic_url, role, rank')
        .in('user_id', userIds);

      const messagesWithProfiles = chatMessages?.map(msg => ({
        ...msg,
        rescue_team_members: members?.find(m => m.user_id === msg.user_id)
      })) || [];

      setMessages(messagesWithProfiles as Message[]);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    if (!currentUserId) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('rescue_team_chat_messages')
        .insert({
          user_id: currentUserId,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const getDisplayName = (msg: Message) => {
    return msg.rescue_team_members?.full_name || "Anonymous";
  };

  const getProfilePic = (msg: Message) => {
    return msg.rescue_team_members?.profile_pic_url || "";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const handleAvatarClick = (msg: Message) => {
    if (msg.rescue_team_members) {
      setSelectedProfile(msg.rescue_team_members);
      setProfileDialogOpen(true);
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

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <>
      <Card className="flex flex-col h-[600px] bg-card">
        <div className="p-4 border-b bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-bold text-lg">Mbakalo Rescue Team</h3>
                <p className="text-sm text-muted-foreground">Emergency response coordination</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-red-500" />
              <span className="font-medium">{onlineCount} online</span>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 bg-background/50" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the coordination!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.user_id === currentUserId;
                const displayName = getDisplayName(msg);
                const profilePic = getProfilePic(msg);
                const member = msg.rescue_team_members;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <Avatar 
                      className="h-10 w-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                      onClick={() => handleAvatarClick(msg)}
                    >
                      {profilePic ? (
                        <AvatarImage src={profilePic} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-red-500/10 text-red-600 dark:bg-red-500/20">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium">{displayName}</span>
                        {member && (
                          <>
                            <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(member.role)} text-white`}>
                              {member.role}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {member.rank}
                            </Badge>
                          </>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          isOwnMessage
                            ? 'bg-red-500 text-white'
                            : 'bg-muted dark:bg-muted/50'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
          <div className="flex gap-2 items-end">
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-0" align="start">
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick}
                  searchDisabled
                  skinTonesDisabled
                  width="100%"
                  height={400}
                />
              </PopoverContent>
            </Popover>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            
            <Button type="submit" disabled={sending || !newMessage.trim()} size="icon" className="shrink-0 bg-red-500 hover:bg-red-600">
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Team Member Profile</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="h-24 w-24">
                {selectedProfile.profile_pic_url ? (
                  <AvatarImage src={selectedProfile.profile_pic_url} alt={selectedProfile.full_name} />
                ) : null}
                <AvatarFallback className="bg-red-500/10 text-red-600 text-2xl">
                  {getInitials(selectedProfile.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold">{selectedProfile.full_name}</h3>
                <div className="flex gap-2 mt-2 justify-center flex-wrap">
                  <Badge className={`${getRoleBadgeColor(selectedProfile.role)} text-white`}>
                    {selectedProfile.role}
                  </Badge>
                  <Badge variant="outline">
                    {selectedProfile.rank}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
