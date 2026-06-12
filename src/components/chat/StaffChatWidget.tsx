import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User as UserIcon, ShieldAlert, CheckCheck } from 'lucide-react';
import { User, ChatMessage } from '../../types';

interface StaffChatWidgetProps {
  currentUser: User;
  darkMode?: boolean;
}

export function StaffChatWidget({ currentUser, darkMode = true }: StaffChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const lastMessageCountRef = useRef(0);

  // Poll for messages
  const fetchMessages = async (isInitial = false) => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);
        
        // Calculate unread if not open
        if (!isOpen && data.length > lastMessageCountRef.current) {
          const newMessages = data.length - lastMessageCountRef.current;
          if (!isInitial) {
            setUnreadCount(prev => prev + newMessages);
          }
        }
        
        if (isOpen) {
          lastMessageCountRef.current = data.length;
          setUnreadCount(0);
        }
      }
    } catch (e) {
      console.error('Failed to fetch chat messages', e);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(), 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setUnreadCount(0);
      lastMessageCountRef.current = messages.length;
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          content: newMessage
        })
      });
      
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_10px_40px_rgb(0,0,0,0.3)] bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-white/10"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#161b22]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-[60] w-full max-w-sm h-[500px] flex flex-col rounded-[2rem] shadow-2xl border overflow-hidden ${darkMode ? 'bg-[#161b22]/95 backdrop-blur-xl border-[#30363d]' : 'bg-white/95 backdrop-blur-xl border-slate-200'}`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-[#30363d] bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Staff Communication</h3>
                  <p className={`text-[10px] flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Secure Channel Live
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-[#30363d] text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                  <MessageSquare className={`w-10 h-10 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No messages yet</p>
                    <p className="text-[10px] text-slate-500 mt-1">Start a conversation with your team.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isSuperAdmin = msg.senderRole === 'super_admin';
                  
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}
                    >
                      {!isMe && (
                        <div className="flex items-center gap-1.5 pl-1">
                          <span className={`text-[10px] font-bold ${isSuperAdmin ? 'text-red-400' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                            {msg.senderName}
                          </span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${isSuperAdmin ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>
                            {isSuperAdmin ? 'SA' : 'A'}
                          </span>
                        </div>
                      )}
                      
                      <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm relative ${
                          isMe 
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm' 
                            : (darkMode ? 'bg-[#21262d] text-slate-200 border border-[#30363d] rounded-bl-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm')
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className={`text-[9px] text-right mt-1.5 flex items-center justify-end gap-1 ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${darkMode ? 'border-[#30363d] bg-black/20' : 'border-slate-100 bg-white'}`}>
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`w-full pl-4 pr-12 py-3 rounded-xl text-sm focus:outline-none transition-colors border ${darkMode ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-indigo-500' : 'bg-slate-100 border-transparent text-slate-900 focus:border-indigo-500 focus:bg-white'}`}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className={`absolute right-2 p-2 rounded-lg transition-all ${
                    newMessage.trim() && !loading
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : (darkMode ? 'text-slate-500 bg-transparent' : 'text-slate-400 bg-transparent')
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
