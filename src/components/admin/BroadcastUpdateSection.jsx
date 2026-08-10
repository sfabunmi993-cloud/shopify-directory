import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Megaphone, Send, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function BroadcastUpdateSection() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [senderName, setSenderName] = useState('');
  const [sending, setSending] = useState(false);

  const reset = () => {
    setTitle('');
    setMessage('');
    setPriority('medium');
    setSenderName('');
  };

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      // 1. Create in-app announcement banner visible to all users
      await base44.entities.Announcement.create({
        title: title.trim(),
        content: message.trim(),
        priority,
        is_active: true,
      });

      // 2. Email all registered users
      let emailResult = { sent: 0, failed: 0, skipped: false };
      try {
        const res = await base44.functions.invoke('sendEmailBlast', {
          subject: title.trim(),
          body: message.trim(),
          senderName: senderName.trim() || undefined,
        });
        emailResult = {
          sent: res.data?.recipientCount ?? 0,
          failed: res.data?.failedCount ?? 0,
          skipped: false,
        };
      } catch (err) {
        emailResult = {
          sent: 0,
          failed: 0,
          skipped: true,
          error: err.response?.data?.error || err.message,
        };
      }

      if (emailResult.skipped) {
        toast.warning('Banner posted, but email blast failed: ' + emailResult.error);
      } else {
        toast.success(
          `Broadcast complete — banner posted & email sent to ${emailResult.sent} user${emailResult.sent !== 1 ? 's' : ''}${
            emailResult.failed ? ` (${emailResult.failed} failed)` : ''
          }`
        );
      }
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to broadcast update');
    }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Broadcast App Update</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Notify all users about a change you made — posts an in-app banner AND emails every registered user at once.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-black hover:bg-black/90">
          <Megaphone className="w-4 h-4 mr-1.5" />
          Compose Update
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-semibold text-sm mb-1">In-app banner</h4>
          <p className="text-xs text-muted-foreground">
            A dismissible banner appears at the top of the app for all logged-in users until they dismiss it.
          </p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
            <Send className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-semibold text-sm mb-1">Email blast</h4>
          <p className="text-xs text-muted-foreground">
            The same message is emailed to every registered user in the app in one go.
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Broadcast App Update</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will post an in-app banner and email all registered users simultaneously.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Headline *</label>
              <Input
                placeholder="e.g. New feature: Compare partners side-by-side"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                placeholder="Describe the change or update..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-32 resize-none"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Banner Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Sender Name</label>
                <Input
                  placeholder="e.g. Shopify Partners Directory"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
            <Button onClick={handleBroadcast} disabled={!title.trim() || !message.trim() || sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <><Megaphone className="w-4 h-4 mr-1.5" /> Broadcast Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}