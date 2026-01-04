import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserSafety } from '@/components/ui/user-safety';
import { supabase } from '@/lib/supabase';
import { executeQuery, executeMutation } from '@/lib/supabase-client';
import { useErrorMonitor } from '@/lib/error-monitor';
import { Send, Phone, Video, MoreVertical, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    name: string;
    profile_picture?: string;
  };
}

interface ChatProps {
  userId: string;
  userName: string;
  userProfilePicture?: string;
  onClose: () => void;
}

export function Chat({ userId, userName, userProfilePicture, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const { toast } = useToast();
  const { reportError, withRetry } = useErrorMonitor();

  useEffect(() => {
    fetchMessages();
    let cleanup: (() => void) | undefined;
    
    setupRealtimeSubscription().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await withRetry(
        'fetchMessages',
        () => executeQuery<Message[]>(
          'fetchMessages',
          async () => {
            const result = await supabase
              .from('messages')
              .select(`
                *,
                sender:users!messages_sender_id_fkey(name, profile_picture)
              `)
              .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
              .order('created_at', { ascending: true });
            return result;
          }
        )
      );

      setMessages(data || []);
    } catch (error: any) {
      reportError(error, { operation: 'fetchMessages', component: 'Chat' });
      toast({
        title: "Error",
        description: `Failed to load messages. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = async (): Promise<(() => void) | undefined> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      const subscription = supabase
        .channel(`messages-${user.id}-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
          },
          (payload) => {
            try {
              const newMessage = payload.new as Message;
              if (newMessage.sender_id === userId || newMessage.receiver_id === userId) {
                setMessages(prev => {
                  // Avoid duplicates
                  if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                  }
                  return [...prev, newMessage];
                });
              }
            } catch (error) {
              reportError(error, { operation: 'realtimeMessageHandler', component: 'Chat' });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Chat] Real-time subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            reportError(new Error('Real-time subscription error'), {
              operation: 'setupRealtimeSubscription',
              component: 'Chat',
            });
          }
        });

      subscriptionRef.current = subscription;

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      reportError(error, { operation: 'setupRealtimeSubscription', component: 'Chat' });
      return () => {};
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await withRetry(
        'sendMessage',
        () => executeMutation<Message[]>(
          'sendMessage',
          async () => {
            const result = await supabase
              .from('messages')
              .insert({
                sender_id: user.id,
                receiver_id: userId,
                content: newMessage.trim(),
              })
              .select();
            return result;
          }
        )
      );

      setNewMessage('');
    } catch (error: any) {
      reportError(error, { operation: 'sendMessage', component: 'Chat' });
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSafetyAction = () => {
    setShowSafety(true);
  };

  const handleCloseSafety = () => {
    setShowSafety(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfilePicture} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{userName}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSafetyAction}>
            <Flag className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => {
              const isOwn = message.sender_id !== userId;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-gradient-to-r from-gray-500 to-gray-700 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-gray-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" disabled={!newMessage.trim() || sending}>
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* User Safety Modal */}
      <AnimatePresence>
        {showSafety && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <UserSafety
                userId={userId}
                userName={userName}
                userProfilePicture={userProfilePicture}
                onClose={handleCloseSafety}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
