'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { databases, appwriteConfig, Query, client, ID } from '@/lib/appwrite';
import { Models } from 'appwrite';
import { Send, LogOut, User, MessageCircle, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function Chat() {
  const { user, profile, isLoading, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Fetch all users except current
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          [
            Query.notEqual('$id', user.$id),
            Query.limit(100)
          ]
        );
        setUsers(response.documents);
      } catch (error: any) {
        console.error("Failed to fetch users", error);
        alert("Error loading users: " + error.message);
      }
    };

    fetchUsers();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!user || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.messagesCollectionId,
          [
            Query.or([
              Query.and([
                Query.equal('senderId', (profile as any)?.userId),
                Query.equal('receiverId', selectedUser.userId)
              ]),
              Query.and([
                Query.equal('senderId', selectedUser.userId),
                Query.equal('receiverId', (profile as any)?.userId)
              ])
            ]),
            Query.orderAsc('$createdAt'),
            Query.limit(100)
          ]
        );
        setMessages(response.documents);
        scrollToBottom();
      } catch (error: any) {
        console.error("Failed to fetch messages", error);
        alert("Error loading messages: " + error.message);
      }
    };

    fetchMessages();

    // Real-time subscription
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const payload = response.payload as any;
          // Check if message belongs to this conversation
          const isRelevant =
            (payload.senderId === (profile as any)?.userId && payload.receiverId === selectedUser.userId) ||
            (payload.senderId === selectedUser.userId && payload.receiverId === (profile as any)?.userId);

          if (isRelevant) {
            setMessages((prev) => [...prev, payload]);
            scrollToBottom();
          } else if (payload.receiverId === (profile as any)?.userId) {
            // Message is for current user, but from a different conversation
            setUnreadCounts((prev) => ({
              ...prev,
              [payload.senderId]: (prev[payload.senderId] || 0) + 1
            }));
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, selectedUser, profile]);

  // Clear unread count when opening a conversation
  useEffect(() => {
    if (selectedUser) {
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[selectedUser.userId];
        return newCounts;
      });
    }
  }, [selectedUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedUser) return;

    setIsSending(true);
    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        ID.unique(),
        {
          messageId: Date.now(),
          senderId: (profile as any)?.userId,
          receiverId: selectedUser.userId,
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          messageType: 'text'
        }
      );
      setNewMessage('');
    } catch (error: any) {
      console.error("Failed to send message", error);
      alert("Error sending message: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div suppressHydrationWarning className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="font-semibold text-white truncate max-w-[150px]">
                {(profile as any)?.username || user.name || 'User'}
              </p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Conversations</h2>
          <div className="space-y-1">
            {users.length === 0 ? (
              <p className="text-sm text-gray-500 px-2 italic">No other users found.</p>
            ) : (
              users.map((u) => (
                <button
                  key={u.$id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${selectedUser?.$id === u.$id
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'hover:bg-gray-800 text-gray-300'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${selectedUser?.$id === u.$id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                    {u.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 text-left truncate">
                    <p className="font-medium truncate">{u.username}</p>
                  </div>
                  {unreadCounts[u.userId] > 0 && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white ml-2 flex-shrink-0">
                      {unreadCounts[u.userId]}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col bg-gray-950 relative ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 md:px-6 border-b border-gray-800 flex items-center bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400">
                  {selectedUser.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{selectedUser.username}</h3>
                  <p className="text-xs text-gray-400">Tap to view info</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                  <MessageCircle size={48} className="opacity-20" />
                  <p>No messages yet. Say hi!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === (profile as any)?.userId;
                  return (
                    <div key={msg.$id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">
                          {isMe ? 'You' : selectedUser.username}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {format(new Date(msg.$createdAt), 'h:mm a')}
                        </span>
                      </div>
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                          }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-800 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} className={newMessage.trim() ? "translate-x-0.5" : ""} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
              <MessageCircle size={40} className="opacity-50" />
            </div>
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
