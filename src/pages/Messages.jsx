import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Send, MessageSquare, ChevronLeft, PackageCheck, CheckCheck, Check, PenSquare } from 'lucide-react';
import DeliveryModal from '@/components/partner/DeliveryModal';
import NewConversationModal from '@/components/messages/NewConversationModal';
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
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  const loadConversations = async (me, partner) => {
    let allMessages = [];
    // RLS ensures each user only sees their own messages (client_user_id, partner_user_id, or sender_id match)
    allMessages = await base44.entities.Message.list('-created_date', 500);

    const convMap = {};
    for (const msg of allMessages) {
      const cid = msg.conversation_id || msg.id;
      if (!convMap[cid]) convMap[cid] = { id: cid, messages: [], partner_id: msg.partner_id, clientUserId: msg.client_user_id, partnerUserId: msg.partner_user_id, lastMessage: msg };
      convMap[cid].messages.push(msg);
      if (msg.client_user_id) convMap[cid].clientUserId = msg.client_user_id;
      if (msg.partner_user_id) convMap[cid].partnerUserId = msg.partner_user_id;
      if (new Date(msg.created_date) > new Date(convMap[cid].lastMessage.created_date)) {
        convMap[cid].lastMessage = msg;
      }
    }

    const convList = Object.values(convMap).sort((a, b) =>
      new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
    );

    const partnerIds = [...new Set(convList.map(c => c.partner_id))];
    const partnerDetails = await Promise.all(partnerIds.map(pid => base44.entities.Partner.filter({ id: pid })));
    const partnerMap = {};
    partnerDetails.forEach(arr => { if (arr[0]) partnerMap[arr[0].id] = arr[0]; });
    convList.forEach(c => { c.partner = partnerMap[c.partner_id]; });

    setConversations(convList);
  };

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    setMobileView('chat');
    const msgs = await base44.entities.Message.filter({ conversation_id: conv.id }, 'created_date', 200);
    setConvMessages(msgs);
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
      partner_user_id: myPartner ? user.id : selectedConv.partnerUserId,
      client_user_id: myPartner ? selectedConv.clientUserId : user.id,
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
  };

  const totalUnread = conversations.reduce((sum, c) =>
    sum + c.messages.filter(m => !m.is_read && m.sender_role !== (myPartner ? 'user' : 'partner')).length, 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative">
          <MessageSquare className="w-7 h-7 text-primary" />
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{totalUnread}</span>
          )}
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {myPartner ? 'Chat with your clients' : 'Chat with your partners'}
          </p>
        </div>
      </div>

      {/* Chat layout */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm" style={{ height: '70vh' }}>
        <div className="flex h-full">

          {/* Sidebar — conversation list */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Conversations</p>
              {!myPartner && (
                <button
                  onClick={() => setNewConvOpen(true)}
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="New message"
                >
                  <PenSquare className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center mt-8">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  {!myPartner && (
                    <button
                      onClick={() => setNewConvOpen(true)}
                      className="mt-3 text-xs text-primary hover:underline font-medium"
                    >
                      + Start a conversation
                    </button>
                  )}
                </div>
              ) : (
                conversations.map(conv => {
                  const unread = conv.messages.filter(m => !m.is_read && m.sender_role !== (myPartner ? 'user' : 'partner')).length;
                  const isActive = selectedConv?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(conv)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                    >
                      <div className="relative shrink-0">
                        <PartnerAvatar partner={conv.partner} size="sm" shape="rounded-full" />
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {conv.partner?.name || 'Partner'}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {conv.lastMessage.created_date ? format(new Date(conv.lastMessage.created_date), 'MMM d') : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-foreground/70 font-medium' : 'text-muted-foreground'}`}>
                          {conv.lastMessage.body}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {!selectedConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary/60" />
                </div>
                <p className="font-medium text-foreground">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-1">Choose a chat from the left to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-border bg-white flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Mobile back button */}
                    <button onClick={() => setMobileView('list')} className="md:hidden text-muted-foreground hover:text-foreground">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <PartnerAvatar partner={selectedConv.partner} size="sm" shape="rounded-full" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{selectedConv.partner?.name || 'Partner'}</p>
                      <Link
                        to={`/partner/${selectedConv.partner?.slug || selectedConv.partner?.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View profile →
                      </Link>
                    </div>
                  </div>

                  {/* Partner "Project Done" button */}
                  {myPartner && (
                    <Button
                      onClick={() => setDeliveryOpen(true)}
                      size="sm"
                      className="rounded-full gap-1.5 bg-green-600 hover:bg-green-700 text-white shrink-0"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Project Done</span>
                    </Button>
                  )}
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50">
                  {convMessages.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8">No messages yet</p>
                  )}
                  {convMessages.map((msg, idx) => {
                    const isMe = msg.sender_id === user.id;
                    const isDelivery = msg.body?.startsWith('✅ Project delivered:');
                    const prevMsg = convMessages[idx - 1];
                    const showDate = !prevMsg || format(new Date(msg.created_date), 'yyyy-MM-dd') !== format(new Date(prevMsg.created_date), 'yyyy-MM-dd');

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-2">
                            <span className="text-[10px] text-muted-foreground bg-white border border-border px-2 py-0.5 rounded-full">
                              {format(new Date(msg.created_date), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mr-1.5 mt-1 self-end">
                              {(msg.sender_name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`max-w-[72%] group`}>
                            {isDelivery ? (
                              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 rounded-bl-sm text-sm text-green-800 whitespace-pre-line">
                                {msg.body}
                              </div>
                            ) : (
                              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                                ${isMe
                                  ? 'bg-primary text-white rounded-br-sm'
                                  : 'bg-white text-foreground rounded-bl-sm border border-border/60'
                                }`}
                              >
                                {msg.subject && (
                                  <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>{msg.subject}</p>
                                )}
                                {msg.hire_details && (
                                  <div className={`text-xs mb-2 p-2 rounded-lg ${isMe ? 'bg-white/10' : 'bg-muted'}`}>
                                    <p className="font-semibold mb-0.5">Hire Details</p>
                                    <p>{msg.hire_details}</p>
                                  </div>
                                )}
                                <p>{msg.body}</p>
                              </div>
                            )}
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] text-muted-foreground">
                                {msg.created_date ? format(new Date(msg.created_date), 'h:mm a') : ''}
                              </span>
                              {isMe && (
                                msg.is_read
                                  ? <CheckCheck className="w-3 h-3 text-primary" />
                                  : <Check className="w-3 h-3 text-muted-foreground/50" />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply box */}
                <div className="px-4 py-3 border-t border-border bg-white shrink-0">
                  <div className="flex items-end gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder="Type a message..."
                      className="resize-none flex-1 min-h-[44px] max-h-32 rounded-2xl border-border bg-muted/30 text-sm py-2.5 px-4 focus:ring-primary"
                      rows={1}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                    />
                    <Button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="rounded-full w-10 h-10 p-0 shrink-0 bg-primary hover:bg-primary/90"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-1">Press Enter to send · Shift+Enter for new line</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <NewConversationModal
        isOpen={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        user={user}
        onCreated={async () => {
          await loadConversations(user, myPartner);
        }}
      />

      {deliveryOpen && myPartner && selectedConv && (
        <DeliveryModal
          isOpen={deliveryOpen}
          onClose={() => setDeliveryOpen(false)}
          partner={myPartner}
          conversation={selectedConv}
          user={user}
          onDelivered={async () => {
            const msgs = await base44.entities.Message.filter({ conversation_id: selectedConv.id }, 'created_date', 200);
            setConvMessages(msgs);
            await loadConversations(user, myPartner);
          }}
        />
      )}
    </div>
  );
}