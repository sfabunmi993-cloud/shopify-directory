import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Send, MessageSquare, ChevronLeft, CheckCheck, Check, Search, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import NewDirectMessageModal from '@/components/messages/NewDirectMessageModal';

function formatConvDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function formatDayLabel(date) {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

function getConversationId(userA, userB) {
  return [userA, userB].sort().join('__');
}

export default function PrivateMessages() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [mobileView, setMobileView] = useState('list');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const selectedConvRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => { selectedConvRef.current = selectedConv; }, [selectedConv]);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/login'); return; }
      const me = await base44.auth.me();
      setUser(me);
      await loadConversations(me);
      setLoading(false);
    };
    init();
  }, [navigate]);

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.DirectMessage.subscribe(async () => {
      const me = userRef.current;
      if (!me) return;
      await loadConversations(me);
      const conv = selectedConvRef.current;
      if (conv) {
        const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conv.id }, 'created_date', 200);
        setConvMessages(msgs);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [reply]);

  const loadConversations = async (me) => {
    const allMessages = await base44.entities.DirectMessage.list('-created_date', 500);
    const convMap = {};
    for (const msg of allMessages) {
      const cid = msg.conversation_id;
      if (!convMap[cid]) {
        convMap[cid] = { id: cid, messages: [], lastMessage: msg };
      }
      convMap[cid].messages.push(msg);
      if (new Date(msg.created_date) > new Date(convMap[cid].lastMessage.created_date)) {
        convMap[cid].lastMessage = msg;
      }
    }
    // Determine the "other user" for each conversation
    for (const conv of Object.values(convMap)) {
      const lastMsg = conv.lastMessage;
      const isSender = lastMsg.sender_id === me.id;
      conv.otherUserId = isSender ? lastMsg.recipient_id : lastMsg.sender_id;
      conv.otherUserName = isSender ? lastMsg.recipient_name : lastMsg.sender_name;
    }
    const convList = Object.values(convMap).sort(
      (a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
    );
    setConversations(convList);
  };

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    setMobileView('chat');
    const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conv.id }, 'created_date', 200);
    setConvMessages(msgs);
    // Mark received messages as read
    for (const m of msgs) {
      if (!m.is_read && m.recipient_id === user.id) {
        base44.entities.DirectMessage.update(m.id, { is_read: true });
      }
    }
  };

  const startConversationWith = async (otherUser) => {
    const convId = getConversationId(user.id, otherUser.id);
    const newConv = {
      id: convId,
      messages: [],
      otherUserId: otherUser.id,
      otherUserName: otherUser.full_name || otherUser.email,
      lastMessage: null,
    };
    setNewConvOpen(false);
    setSelectedConv(newConv);
    setMobileView('chat');
    const existing = await base44.entities.DirectMessage.filter({ conversation_id: convId }, 'created_date', 200);
    setConvMessages(existing);
    // Update conversations list
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === convId);
      if (exists) return prev;
      return [newConv, ...prev];
    });
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedConv) return;
    setSending(true);
    try {
      await base44.entities.DirectMessage.create({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        recipient_id: selectedConv.otherUserId,
        recipient_name: selectedConv.otherUserName,
        body: reply.trim(),
        is_read: false,
      });
      setReply('');
    } catch (err) {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const totalUnread = conversations.reduce((sum, c) => {
    return sum + (c.messages || []).filter((m) => !m.is_read && m.recipient_id === user?.id).length;
  }, 0);

  const filteredConvs = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.otherUserName?.toLowerCase().includes(q) || c.lastMessage?.body?.toLowerCase().includes(q);
  });

  const initials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-white shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          {/* Tab switcher */}
          <div className="flex border-b border-border">
            <Link to="/messages" className="flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Partner Messages</Link>
            <Link to="/private-messages" className="flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold text-primary border-b-2 border-primary">Private Messages</Link>
          </div>

          {/* Sidebar header */}
          <div className="p-3 sm:p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Private Messages
                {totalUnread > 0 &&
                  <span className="bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{totalUnread}</span>
                }
              </h1>
              <button onClick={() => setNewConvOpen(true)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-primary transition-colors" title="New message">
                <Users className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-muted/50 rounded-full border-0 outline-none placeholder:text-muted-foreground focus:bg-muted"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ?
              <div className="p-8 text-center mt-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <button onClick={() => setNewConvOpen(true)} className="mt-2 text-xs text-primary hover:underline font-medium">
                  + Start a conversation
                </button>
              </div> :
              filteredConvs.map((conv) => {
                const unread = (conv.messages || []).filter((m) => !m.is_read && m.recipient_id === user?.id).length;
                const isActive = selectedConv?.id === conv.id;
                const name = conv.otherUserName || 'User';
                const lastBody = conv.lastMessage?.body || '';
                const isMine = conv.lastMessage?.sender_id === user?.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center gap-2.5 sm:gap-3 hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0 ${isActive ? 'bg-primary/5' : ''}`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-9 h-9 sm:w-11 sm:h-11">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs sm:text-sm font-bold border border-border/50">
                          {initials(name)}
                        </AvatarFallback>
                      </Avatar>
                      {unread > 0 &&
                        <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold rounded-full w-[18px] h-[18px] min-w-[18px] min-h-[18px] flex items-center justify-center px-1">{unread}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs sm:text-sm truncate ${unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>{name}</p>
                        <span className={`text-[10px] shrink-0 ${unread > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                          {formatConvDate(conv.lastMessage.created_date)}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                        {isMine && <span className="text-muted-foreground">You: </span>}
                        {lastBody}
                      </p>
                    </div>
                  </button>
                );
              })
            }
          </div>
        </div>

        {/* Chat panel */}
        <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {!selectedConv ?
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white border border-border flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="w-9 h-9 text-primary/40" />
              </div>
              <p className="font-semibold text-foreground text-lg">Private Messages</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">Chat directly with other users on the platform.</p>
              <button onClick={() => setNewConvOpen(true)} className="mt-4 text-sm text-primary hover:underline font-medium">
                + Start a conversation
              </button>
            </div> :
            <>
              {/* Chat header */}
              <div className="px-3 py-2.5 border-b border-border bg-white flex items-center justify-between gap-2 shrink-0 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <button onClick={() => setMobileView('list')} className="md:hidden text-muted-foreground hover:text-foreground mr-0.5 shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-bold border border-border/50">
                      {initials(selectedConv.otherUserName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{selectedConv.otherUserName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">Direct message</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1">
                {convMessages.length === 0 &&
                  <div className="flex justify-center mt-8">
                    <span className="text-xs text-muted-foreground bg-white border border-border px-3 py-1 rounded-full">No messages yet — say hello!</span>
                  </div>
                }
                {convMessages.map((msg, idx) => {
                  const isMe = msg.sender_id === user.id;
                  const prevMsg = convMessages[idx - 1];
                  const nextMsg = convMessages[idx + 1];
                  const showDate = !prevMsg || format(new Date(msg.created_date), 'yyyy-MM-dd') !== format(new Date(prevMsg.created_date), 'yyyy-MM-dd');
                  const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                  const isLastMsg = idx === convMessages.length - 1;

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate &&
                        <div className="flex justify-center my-3">
                          <span className="text-[11px] text-muted-foreground bg-white border border-border/60 px-3 py-1 rounded-full shadow-sm">
                            {formatDayLabel(msg.created_date)}
                          </span>
                        </div>
                      }
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>
                        <div className="max-w-[85%] sm:max-w-[60%]">
                          <div className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm
                            ${isMe ?
                              'bg-primary text-white rounded-2xl rounded-br-md' :
                              'bg-white text-foreground rounded-2xl rounded-bl-md border border-border/50'}`
                            }>
                            <p className="whitespace-pre-line">{msg.body}</p>
                          </div>
                          {isLastInGroup &&
                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] text-muted-foreground">{msg.created_date ? format(new Date(msg.created_date), 'h:mm a') : ''}</span>
                              {isMe && (isLastMsg ?
                                (msg.is_read ? <CheckCheck className="w-3 h-3 text-primary" /> : <CheckCheck className="w-3 h-3 text-muted-foreground/50" />) :
                                <Check className="w-3 h-3 text-muted-foreground/40" />)
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="px-2.5 py-2.5 sm:px-3 sm:py-3 bg-white border-t border-border shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 min-h-[42px] max-h-[120px] resize-none rounded-3xl border border-border bg-muted/40 text-sm py-2.5 px-4 outline-none focus:border-primary/50 focus:bg-white transition-colors leading-relaxed overflow-hidden"
                    rows={1}
                    style={{ height: '42px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
                    }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${reply.trim() && !sending ? 'bg-primary text-white hover:bg-primary/90 shadow-md' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          }
        </div>
      </div>

      <NewDirectMessageModal
        isOpen={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        currentUser={user}
        onStart={startConversationWith}
      />
    </div>
  );
}