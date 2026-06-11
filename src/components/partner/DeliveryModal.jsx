import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, PackageCheck, Upload, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function DeliveryModal({ isOpen, onClose, partner, conversation, user, onDelivered }) {
  const [form, setForm] = useState({ title: '', description: '', delivery_url: '' });
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);
    toast.success('File uploaded!');
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Please enter a project title.'); return; }
    setSaving(true);

    // Find the client from the conversation messages
    const msgs = await base44.entities.Message.filter({ conversation_id: conversation.id }, 'created_date', 5);
    const clientMsg = msgs.find(m => m.sender_role === 'user');
    const clientUserId = clientMsg?.sender_id || null;
    const clientName = clientMsg?.sender_name || 'Client';

    await base44.entities.Project.create({
      partner_id: partner.id,
      client_user_id: clientUserId,
      client_name: clientName,
      conversation_id: conversation.id,
      title: form.title.trim(),
      description: form.description.trim(),
      delivery_url: form.delivery_url.trim(),
      delivery_file_url: fileUrl,
      status: 'delivered',
    });

    // Also send a message in the thread notifying delivery
    await base44.entities.Message.create({
      conversation_id: conversation.id,
      partner_id: partner.id,
      sender_id: user.id,
      sender_name: partner.name,
      sender_role: 'partner',
      body: `✅ Project delivered: **${form.title}**${form.description ? '\n\n' + form.description : ''}${form.delivery_url ? '\n\n🔗 ' + form.delivery_url : ''}${fileUrl ? '\n\n📎 Attachment: ' + fileUrl : ''}`,
      message_type: 'reply',
      is_read: false,
    });

    toast.success('Project delivered and client notified!');
    setSaving(false);
    setForm({ title: '', description: '', delivery_url: '' });
    setFileUrl('');
    onClose();
    onDelivered?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary" /> Mark Project as Delivered
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Project title *</Label>
            <Input placeholder="e.g. Shopify Store Redesign" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Delivery notes</Label>
            <Textarea
              placeholder="Describe what was delivered, key features, instructions..."
              className="h-24 resize-none"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Delivery URL</Label>
            <Input placeholder="https://yourstore.myshopify.com" value={form.delivery_url} onChange={e => set('delivery_url', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Attach a file</Label>
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : fileUrl ? '✅ File attached' : 'Click to upload'}
              </div>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <PackageCheck className="w-4 h-4 mr-1.5" />}
              {saving ? 'Delivering...' : 'Deliver Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}