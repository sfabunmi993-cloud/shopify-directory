import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Send, MessageSquare, ChevronLeft, PackageCheck, CheckCheck, Check, PenSquare, Search, Briefcase, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import DeliveryModal from '@/components/partner/DeliveryModal';
import NewConversationModal from '@/components/messages/NewConversationModal';
import ReviewForm from '@/components/messages/ReviewForm';
import ContactDetailsCard from '@/components/messages/ContactDetailsCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import PartnerAvatar from '@/components/directory/PartnerAvatar';
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
  const [mobileView, setMobileView] = useState('list');
  const [search, setSearch] = useState('');
  const [hireStatus, setHireStatus] = useState({}); // { [convId]: 'pending' | 'approved' | 'completed' | 'rejected' }
  const [showReviewModal, setShowReviewModal] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const selectedConvRef = useRef(null);
  const userRef = useRef(null);
  const myPartnerRef = useRef(null);

  // Keep refs in sync
  useEffect(() => {selectedConvRef.current = selectedConv;}, [selectedConv]);
  useEffect(() => {userRef.current = user;}, [user]);
  useEffect(() => {myPartnerRef.current = myPartner;}, [myPartner]);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {navigate('/login');return;}
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

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.Message.subscribe(async () => {
      const me = userRef.current;
      const partner = myPartnerRef.current;
      if (!me) return;
      await loadConversations(me, partner);
      // Refresh active conversation messages
      const conv = selectedConvRef.current;
      if (conv) {
        const msgs = await base44.entities.Message.filter({ conversation_id: conv.id }, 'created_date', 200);
        setConvMessages(msgs);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [reply]);

  const loadConversations = async (me, partner) => {
    const allMessages = await base44.entities.Message.list('-created_date', 500);
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
    for (const conv of Object.values(convMap)) {
      const clientMsg = conv.messages.find((m) => m.sender_role === 'user');
      conv.clientName = clientMsg?.sender_name || 'Client';
    }
    const convList = Object.values(convMap).sort((a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date));
    const partnerIds = [...new Set(convList.map((c) => c.partner_id))];
    const partnerDetails = await Promise.all(partnerIds.map((pid) => base44.entities.Partner.filter({ id: pid })));
    const partnerMap = {};
    partnerDetails.forEach((arr) => {if (arr[0]) partnerMap[arr[0].id] = arr[0];});
    convList.forEach((c) => {c.partner = partnerMap[c.partner_id];});
    setConversations(convList);
  };

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    setMobileView('chat');
    const msgs = await base44.entities.Message.filter({ conversation_id: conv.id }, 'created_date', 200);
    setConvMessages(msgs);
    const isPartnerSide = myPartner && conv.partnerUserId === user?.id;
    for (const m of msgs) {
      if (!m.is_read && m.sender_role !== (isPartnerSide ? 'user' : 'partner')) {
        base44.entities.Message.update(m.id, { is_read: true });
      }
    }
    // Load hire status for this conversation
    const hireMsg = msgs.find((m) => m.message_type === 'hire');
    if (hireMsg && isPartnerSide) {
      // Check if there's an approved project
      const projects = await base44.entities.Project.filter({ conversation_id: conv.id });
      if (projects.length > 0) {
        setHireStatus((prev) => ({ ...prev, [conv.id]: projects[0].status === 'completed' ? 'completed' : 'approved' }));
      } else {
        setHireStatus((prev) => ({ ...prev, [conv.id]: 'pending' }));
      }
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedConv) return;
    setSending(true);
    const isPartnerSide = myPartner && selectedConv.partnerUserId === user.id;
    await base44.entities.Message.create({
      conversation_id: selectedConv.id,
      partner_id: selectedConv.partner_id,
      partner_user_id: isPartnerSide ? user.id : selectedConv.partnerUserId,
      client_user_id: isPartnerSide ? selectedConv.clientUserId : user.id,
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      sender_role: isPartnerSide ? 'partner' : 'user',
      body: reply.trim(),
      message_type: 'reply',
      is_read: false
    });
    setReply('');
    setSending(false);
  };

  const handleHireAction = async (action) => {
    if (!selectedConv) return;
    setSending(true);
    try {
      // Create project record
      const hireMsg = convMessages.find((m) => m.message_type === 'hire');
      await base44.entities.Project.create({
        partner_id: selectedConv.partner_id,
        client_user_id: selectedConv.clientUserId,
        client_name: selectedConv.clientName,
        conversation_id: selectedConv.id,
        title: hireMsg?.subject || 'Project',
        description: hireMsg?.hire_details || '',
        status: action === 'approve' ? 'delivered' : 'disputed'
      });
      // Send notification message
      await base44.entities.Message.create({
        conversation_id: selectedConv.id,
        partner_id: selectedConv.partner_id,
        partner_user_id: user.id,
        client_user_id: selectedConv.clientUserId,
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        sender_role: 'partner',
        body: action === 'approve' ?
        `✅ Hire request approved! I'll start working on your project. Let's discuss the details.` :
        `❌ Hire request declined. Thank you for reaching out.`,
        message_type: 'reply',
        is_read: false
      });
      setHireStatus((prev) => ({ ...prev, [selectedConv.id]: action === 'approve' ? 'approved' : 'rejected' }));
      toast.success(action === 'approve' ? 'Hire request approved!' : 'Hire request declined');
      // Refresh messages
      const msgs = await base44.entities.Message.filter({ conversation_id: selectedConv.id }, 'created_date', 200);
      setConvMessages(msgs);
    } catch (err) {
      toast.error('Failed to process hire request');
    }
    setSending(false);
  };

  const totalUnread = conversations.reduce((sum, c) => {
    const isPartnerSide = myPartner && c.partnerUserId === user?.id;
    return sum + c.messages.filter((m) => !m.is_read && m.sender_role !== (isPartnerSide ? 'user' : 'partner')).length;
  }, 0);

  const filteredConvs = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const isPartnerSide = myPartner && c.partnerUserId === user?.id;
    const name = isPartnerSide ? c.clientName : c.partner?.name;
    return name?.toLowerCase().includes(q) || c.lastMessage?.body?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>);

  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-white shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          {/* Sidebar header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                Messages
                {totalUnread > 0 &&
                <span className="bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{totalUnread}</span>
                }
              </h1>
              <button onClick={() => setNewConvOpen(true)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-primary transition-colors" title="New message">
                <PenSquare className="w-4 h-4" />
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-muted/50 rounded-full border-0 outline-none placeholder:text-muted-foreground focus:bg-muted" />
              
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
              const isPartnerSide = myPartner && conv.partnerUserId === user?.id;
              const unread = conv.messages.filter((m) => !m.is_read && m.sender_role !== (isPartnerSide ? 'user' : 'partner')).length;
              const isActive = selectedConv?.id === conv.id;
              const name = isPartnerSide ? conv.clientName || 'Client' : conv.partner?.name || 'Partner';
              const lastBody = conv.lastMessage?.body || '';
              const isMine = conv.lastMessage?.sender_id === user?.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0 bg-primary/5 ${isActive ? "" : ''}`}>
                  
                    <div className="relative shrink-0">
                      {isPartnerSide ?
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary border border-border/50">
                          {name.charAt(0).toUpperCase()}
                        </div> :

                    <PartnerAvatar partner={conv.partner} size="md" shape="rounded-full" />
                    }
                      {unread > 0 &&
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center px-1">{unread}</span>
                    }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>{name}</p>
                        <span className={`text-[10px] shrink-0 ${unread > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                          {formatConvDate(conv.lastMessage.created_date)}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                        {isMine && <span className="text-muted-foreground">You: </span>}
                        {lastBody}
                      </p>
                    </div>
                  </button>);

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
              <p className="font-semibold text-foreground text-lg">Your Messages</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">Select a conversation from the left, or start a new one to connect with partners.</p>
              <button onClick={() => setNewConvOpen(true)} className="mt-4 text-sm text-primary hover:underline font-medium">
                + Start a conversation
              </button>
            </div> :

          <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-border bg-white flex items-center justify-between gap-3 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setMobileView('list')} className="md:hidden text-muted-foreground hover:text-foreground mr-1">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {(() => {
                  const isPartnerSide = myPartner && selectedConv.partnerUserId === user?.id;
                  const name = isPartnerSide ? selectedConv.clientName || 'Client' : selectedConv.partner?.name || 'Partner';
                  return (
                    <>
                        {isPartnerSide ?
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary border border-border/50">
                            {name.charAt(0).toUpperCase()}
                          </div> :

                      <PartnerAvatar partner={selectedConv.partner} size="sm" shape="rounded-full" />
                      }
                        <div>
                          <p className="font-bold text-sm text-foreground">{name}</p>
                          {!isPartnerSide && selectedConv.partner &&
                        <Link to={`/partner/${selectedConv.partner?.slug || selectedConv.partner?.id}`} className="text-xs text-primary hover:underline">
                              View profile →
                            </Link>
                        }
                        </div>
                      </>);

                })()}
                </div>
                <div className="flex items-center gap-2">
                  {!myPartner && hireStatus[selectedConv.id] === 'completed' &&
                <Button onClick={() => setShowReviewModal(true)} size="sm" variant="outline" className="rounded-full">
                      <Star className="w-4 h-4 mr-1" />
                      Leave Review
                    </Button>
                }
                  {myPartner && selectedConv.partnerUserId === user?.id &&
                <Button onClick={() => setDeliveryOpen(true)} size="sm" className="rounded-full gap-1.5 bg-green-600 hover:bg-green-700 text-white shrink-0">
                      <PackageCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Project Done</span>
                    </Button>
                }
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {(() => {
                  const inquiryMsg = convMessages.find(m => m.message_type === 'inquiry' || m.message_type === 'hire_request');
                  return inquiryMsg ? <ContactDetailsCard message={inquiryMsg} /> : null;
                })()}
                {convMessages.length === 0 &&
              <div className="flex justify-center mt-8">
                    <span className="text-xs text-muted-foreground bg-white border border-border px-3 py-1 rounded-full">No messages yet — say hello!</span>
                  </div>
              }
                {convMessages.map((msg, idx) => {
                const isMe = msg.sender_id === user.id;
                const isDelivery = msg.body?.startsWith('✅ Project delivered:');
                const isHireRequest = msg.message_type === 'hire';
                const prevMsg = convMessages[idx - 1];
                const nextMsg = convMessages[idx + 1];
                const showDate = !prevMsg || format(new Date(msg.created_date), 'yyyy-MM-dd') !== format(new Date(prevMsg.created_date), 'yyyy-MM-dd');
                const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                const isLastMsg = idx === convMessages.length - 1;
                const isPartnerSide = myPartner && selectedConv.partnerUserId === user?.id;
                const currentHireStatus = hireStatus[selectedConv.id];

                return (
                  <React.Fragment key={msg.id}>
                      {showDate &&
                    <div className="flex justify-center my-3">
                          <span className="text-[11px] text-muted-foreground bg-white border border-border/60 px-3 py-1 rounded-full shadow-sm">
                            {formatDayLabel(msg.created_date)}
                          </span>
                        </div>
                    }
                      {isHireRequest && isPartnerSide && currentHireStatus !== 'completed' && currentHireStatus !== 'approved' && currentHireStatus !== 'rejected' ?
                    <div className="flex justify-start mb-3">
                          <div className="max-w-[80%] sm:max-w-[70%] bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary mb-1">Hire Request</p>
                                {msg.subject && <p className="text-xs text-muted-foreground mb-2">{msg.subject}</p>}
                                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                                  <p className="text-xs font-semibold mb-1">Project Details</p>
                                  <p className="text-xs whitespace-pre-line">{msg.hire_details}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                size="sm"
                                onClick={() => handleHireAction('approve')}
                                disabled={sending}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full">
                                
                                    <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                                    {sending ? '...' : 'Accept'}
                                  </Button>
                                  <Button
                                size="sm"
                                onClick={() => handleHireAction('decline')}
                                disabled={sending}
                                variant="outline"
                                className="flex-1 rounded-full border-red-200 text-red-600 hover:bg-red-50">
                                
                                    <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                                    {sending ? '...' : 'Decline'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div> :
                    isHireRequest ?
                    <div className="flex justify-start mb-3">
                          <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 border-2 shadow-sm ${
                      currentHireStatus === 'approved' || currentHireStatus === 'completed' ?
                      'bg-green-50 border-green-200' :
                      currentHireStatus === 'rejected' ?
                      'bg-red-50 border-red-200' :
                      'bg-white border-border'}`
                      }>
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          currentHireStatus === 'approved' || currentHireStatus === 'completed' ?
                          'bg-green-100' :
                          currentHireStatus === 'rejected' ?
                          'bg-red-100' :
                          'bg-primary/10'}`
                          }>
                                {currentHireStatus === 'approved' || currentHireStatus === 'completed' ?
                            <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                            currentHireStatus === 'rejected' ?
                            <XCircle className="w-4 h-4 text-red-600" /> :

                            <Briefcase className="w-4 h-4 text-primary" />
                            }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold mb-1 ${
                            currentHireStatus === 'approved' || currentHireStatus === 'completed' ?
                            'text-green-800' :
                            currentHireStatus === 'rejected' ?
                            'text-red-800' :
                            'text-primary'}`
                            }>
                                  {currentHireStatus === 'approved' || currentHireStatus === 'completed' ?
                              'Hire Request Accepted' :
                              currentHireStatus === 'rejected' ?
                              'Hire Request Declined' :
                              'Hire Request'}
                                </p>
                                {msg.subject && <p className="text-xs text-muted-foreground mb-2">{msg.subject}</p>}
                                <div className="bg-white/60 rounded-lg p-3">
                                  <p className="text-xs font-semibold mb-1">Project Details</p>
                                  <p className="text-xs whitespace-pre-line">{msg.hire_details}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div> :

                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>
                          {!isMe &&
                      <div className={`w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 mr-1.5 self-end ${isLastInGroup ? 'opacity-100' : 'opacity-0'}`}>
                              {(msg.sender_name || '?').charAt(0).toUpperCase()}
                            </div>
                      }
                          <div className="max-w-[70%] sm:max-w-[60%]">
                            {isDelivery ?
                        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-800 whitespace-pre-line shadow-sm">
                                {msg.body}
                              </div> :

                        <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm
                                ${isMe ?
                        'bg-primary text-white rounded-2xl rounded-br-md' :
                        'bg-white text-foreground rounded-2xl rounded-bl-md border border-border/50'}`
                        }>
                          
                                {msg.subject &&
                          <p className={`text-xs font-semibold mb-1.5 pb-1.5 border-b ${isMe ? 'text-white/70 border-white/20' : 'text-muted-foreground border-border'}`}>{msg.subject}</p>
                          }
                                {msg.hire_details &&
                          <div className={`text-xs mb-2 p-2 rounded-lg ${isMe ? 'bg-white/15' : 'bg-muted/60'}`}>
                                    <p className="font-semibold mb-0.5">Hire Details</p>
                                    <p className="whitespace-pre-line">{msg.hire_details}</p>
                                  </div>
                          }
                                <p className="whitespace-pre-line">{msg.body}</p>
                              </div>
                        }
                            {isLastInGroup &&
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-muted-foreground">{msg.created_date ? format(new Date(msg.created_date), 'h:mm a') : ''}</span>
                                {isMe && (isLastMsg ?
                          msg.is_read ? <CheckCheck className="w-3 h-3 text-primary" /> : <CheckCheck className="w-3 h-3 text-muted-foreground/50" /> :
                          <Check className="w-3 h-3 text-muted-foreground/40" />)
                          }
                              </div>
                        }
                          </div>
                        </div>
                    }
                    </React.Fragment>);

              })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="px-3 py-3 bg-white border-t border-border shrink-0">
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
                    if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();sendReply();}
                  }} />
                
                  <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${reply.trim() && !sending ? 'bg-primary text-white hover:bg-primary/90 shadow-md' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                  
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          }
        </div>
      </div>

      <NewConversationModal
        isOpen={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        user={user}
        onCreated={async () => {await loadConversations(user, myPartner);}} />
      

      {deliveryOpen && myPartner && selectedConv &&
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
        }} />

      }

      {showReviewModal && selectedConv &&
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Leave a Review for {selectedConv.partner?.name}</DialogTitle>
            </DialogHeader>
            <ReviewForm
            partnerId={selectedConv.partner_id}
            partnerName={selectedConv.partner?.name}
            conversationId={selectedConv.id}
            user={user}
            onSuccess={() => {
              setShowReviewModal(false);
              toast.success('Review submitted!');
            }}
            onCancel={() => setShowReviewModal(false)} />
          
          </DialogContent>
        </Dialog>
      }
    </div>);

}