import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
  youth_profiles?: {
    full_name: string;
    profile_pic_url: string | null;
  };
}

export const YouthChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
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
    
    // Set up realtime subscription
    const channel = supabase
      .channel('youth-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'youth_chat_messages'
        },
        (payload) => {
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
        .from('youth_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Fetch user profiles separately
      const userIds = [...new Set(chatMessages?.map(m => m.user_id) || [])];
      
      const { data: youthProfiles } = await supabase
        .from('youth_profiles')
        .select('user_id, full_name, profile_pic_url')
        .in('user_id', userIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Merge the data
      const messagesWithProfiles = chatMessages?.map(msg => ({
        ...msg,
        youth_profiles: youthProfiles?.find(p => p.user_id === msg.user_id),
        profiles: profiles?.find(p => p.id === msg.user_id)
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
        .from('youth_chat_messages')
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
    return msg.youth_profiles?.full_name || msg.profiles?.full_name || "Anonymous";
  };

  const getProfilePic = (msg: Message) => {
    return msg.youth_profiles?.profile_pic_url || msg.profiles?.avatar_url || "";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Youth Community Chat</h3>
            <p className="text-sm text-muted-foreground">Stay connected with fellow youth</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">{onlineCount} online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.user_id === currentUserId;
              const displayName = getDisplayName(msg);
              const profilePic = getProfilePic(msg);
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {profilePic ? (
                      <AvatarImage src={profilePic} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
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

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};