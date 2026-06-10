import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Send, ArrowLeft, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import PartnerAvatar from '@/components/directory/PartnerAvatar';

export default function Messages() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [myPartner, setMyPartner] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/login'); return; }
      const me = await base44.auth.me();
      setUser(me);
      const partners = await base44.entities.Partner.filter({ created_by_id: me.id });
      const partner = partners[0] || null;
      setMyPartner(partner);
      await loadConversations(me, partner);
      setLoading(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [convMessages]);

  const loadConversations = async (me, partner) => {
    let allMessages = [];
    if (partner) {
      // partner sees messages addressed to their partner profile
      allMessages = await base44.entities.Message.filter({ partner_id: partner.id }, '-created_date', 500);
    } else {
      // regular user sees messages they sent
      allMessages = await base44.entities.Message.filter({ sender_id: me.id }, '-created_date', 500);
    }

    // group by conversation_id
    const convMap = {};
    for (const msg of allMessages) {
      const cid = msg.conversation_id || msg.id;
      if (!convMap[cid]) convMap[cid] = { id: cid, messages: [], partner_id: msg.partner_id, lastMessage: msg };
      convMap[cid].messages.push(msg);
      if (new Date(msg.created_date) > new Date(convMap[cid].lastMessage.created_date)) {
        convMap[cid].lastMessage = msg;
      }
    }
    const convList = Object.values(convMap).sort((a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date));

    // fetch partner names
    const partnerIds = [...new Set(convList.map(c => c.partner_id))];
    const partnerDetails = await Promise.all(partnerIds.map(pid => base44.entities.Partner.filter({ id: pid })));
    const partnerMap = {};
    partnerDetails.forEach(arr => { if (arr[0]) partnerMap[arr[0].id] = arr[0]; });

    convList.forEach(c => { c.partner = partnerMap[c.partner_id]; });
    setConversations(convList);
  };

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    // load all messages for this conversation
    const msgs = await base44.entities.Message.filter({ conversation_id: conv.id }, 'created_date', 200);
    setConvMessages(msgs);
    // mark unread as read
    for (const m of msgs) {
      if (!m.is_read && m.sender_role !== (myPartner ? 'user' : 'partner')) {
        await base44.entities.Message.update(m.id, { is_read: true });
      }
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedConv) return;
    setSending(true);
    const senderRole = myPartner ? 'partner' : 'user';
    await base44.entities.Message.create({
      conversation_id: selectedConv.id,
      partner_id: selectedConv.partner_id,
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      sender_role: senderRole,
      body: reply.trim(),
      message_type: 'reply',
      is_read: false,
    });
    setReply('');
    const msgs = await base44.entities.Message.filter({ conversation_id: selectedConv.id }, 'created_date', 200);
    setConvMessages(msgs);
    await loadConversations(user, myPartner);
    setSending(false);
    toast.success('Message sent!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {myPartner ? 'Manage inquiries and hire requests from clients' : 'Your conversations with partners'}
        </p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6 min-h-[600px]">
        {/* Conversation List */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Conversations</p>
          </div>
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map(conv => {
                const unreadCount = conv.messages.filter(m => !m.is_read && m.sender_role !== (myPartner ? 'user' : 'partner')).length;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left p-4 hover:bg-muted/30 transition-colors ${selectedConv?.id === conv.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <PartnerAvatar partner={conv.partner} size="sm" shape="rounded-lg" className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{conv.partner?.name || 'Unknown Partner'}</p>
                          {unreadCount > 0 && (
                            <Badge className="bg-primary text-white text-xs ml-1 shrink-0">{unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage.body}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {conv.lastMessage.created_date ? format(new Date(conv.lastMessage.created_date), 'MMM d') : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="bg-white border border-border rounded-2xl flex flex-col overflow-hidden">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <PartnerAvatar partner={selectedConv.partner} size="sm" shape="rounded-lg" />
                <div>
                  <p className="font-semibold text-sm">{selectedConv.partner?.name || 'Partner'}</p>
                  {selectedConv.partner?.id && (
                    <Link to={`/partner/${selectedConv.partner.id}`} className="text-xs text-primary hover:underline">
                      View profile <ChevronRight className="w-3 h-3 inline" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {convMessages.map(msg => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}>
                        {msg.subject && (
                          <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>{msg.subject}</p>
                        )}
                        {msg.hire_details && (
                          <div className={`text-xs mb-2 p-2 rounded-lg ${isMe ? 'bg-white/10' : 'bg-white'}`}>
                            <p className="font-semibold mb-0.5">Hire Details</p>
                            <p>{msg.hire_details}</p>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.body}</p>
                        <p className={`text-xs mt-1.5 ${isMe ? 'text-white/50' : 'text-muted-foreground/60'}`}>
                          {msg.created_date ? format(new Date(msg.created_date), 'MMM d, h:mm a') : ''}
                          {' · '}{msg.sender_name || (msg.sender_role === 'partner' ? 'Partner' : 'User')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="h-20 resize-none flex-1"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.metaKey) sendReply();
                    }}
                  />
                  <Button onClick={sendReply} disabled={!reply.trim() || sending} className="self-end rounded-xl px-4">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Press ⌘+Enter to send</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}