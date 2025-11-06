import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Loader2, Smile, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { YouthProfileDialog } from "./YouthProfileDialog";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  reply_to_message_id?: string | null;
  replied_message?: Message;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
  youth_profiles?: {
    full_name: string;
    profile_pic_url: string | null;
    village: string;
    phone_number: string;
  };
}

export const YouthChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
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
      .channel('youth-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'youth_chat_messages'
        },
        async (payload) => {
          fetchMessages();
          
          // Show notification if message is from another user
          if (payload.new.user_id !== currentUserId) {
            if ('Notification' in window && Notification.permission === 'granted') {
              // Fetch sender info
              const { data: sender } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', payload.new.user_id)
                .single();

              const senderName = sender?.full_name || 'Youth Member';
              
              new Notification('New Youth Chat Message', {
                body: `${senderName}: ${payload.new.message.substring(0, 100)}`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'youth-chat',
                requireInteraction: false
              });
            }
          }
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

      const userIds = [...new Set(chatMessages?.map(m => m.user_id) || [])];
      
      const { data: youthProfiles } = await supabase
        .from('youth_profiles')
        .select('user_id, full_name, profile_pic_url, village, phone_number')
        .in('user_id', userIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Fetch replied messages
      const replyIds = chatMessages?.map(m => m.reply_to_message_id).filter(Boolean) || [];
      let repliedMessages: any[] = [];
      if (replyIds.length > 0) {
        const { data } = await supabase
          .from('youth_chat_messages')
          .select('*')
          .in('id', replyIds);
        repliedMessages = data || [];
      }

      const messagesWithProfiles = chatMessages?.map(msg => ({
        ...msg,
        youth_profiles: youthProfiles?.find(p => p.user_id === msg.user_id),
        profiles: profiles?.find(p => p.id === msg.user_id),
        replied_message: msg.reply_to_message_id
          ? {
              ...repliedMessages.find(r => r.id === msg.reply_to_message_id),
              youth_profiles: youthProfiles?.find(p => p.user_id === repliedMessages.find(r => r.id === msg.reply_to_message_id)?.user_id),
              profiles: profiles?.find(p => p.id === repliedMessages.find(r => r.id === msg.reply_to_message_id)?.user_id)
            }
          : null
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
          message: newMessage.trim(),
          reply_to_message_id: replyingTo?.id || null
        });

      if (error) throw error;
      setNewMessage("");
      setReplyingTo(null);
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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const handleAvatarClick = (msg: Message) => {
    const profile = msg.youth_profiles || msg.profiles;
    if (profile) {
      setSelectedProfile({
        full_name: profile.full_name,
        profile_pic_url: msg.youth_profiles?.profile_pic_url || msg.profiles?.avatar_url,
        village: (msg.youth_profiles as any)?.village,
        phone_number: (msg.youth_profiles as any)?.phone_number
      });
      setProfileDialogOpen(true);
    }
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
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
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

        <ScrollArea className="flex-1 p-4 bg-background/50" ref={scrollRef}>
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
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <Avatar 
                      className="h-10 w-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => handleAvatarClick(msg)}
                    >
                      {profilePic ? (
                        <AvatarImage src={profilePic} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted dark:bg-muted/50'
                        }`}
                        onClick={() => setReplyingTo(msg)}
                      >
                        {msg.replied_message && (
                          <div className="bg-black/10 rounded px-2 py-1 mb-2 border-l-2 border-current">
                            <p className="text-xs opacity-70 font-semibold">
                              {getDisplayName(msg.replied_message as Message)}
                            </p>
                            <p className="text-xs line-clamp-1 opacity-80">
                              {msg.replied_message.message}
                            </p>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="border-t bg-card">
          {replyingTo && (
            <div className="px-4 pt-3 pb-2 bg-muted/50 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary">
                  Replying to {getDisplayName(replyingTo)}
                </p>
                <p className="text-xs line-clamp-1 opacity-70">
                  {replyingTo.message}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="p-4 flex gap-2 items-end">
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
            
            <Button type="submit" disabled={sending || !newMessage.trim()} size="icon" className="shrink-0">
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </Card>

      <YouthProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={selectedProfile}
      />
    </>
  );
};