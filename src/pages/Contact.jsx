import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSending(true);
    try {
      await base44.functions.invoke('sendContactMessage', {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary/5 border-b border-border py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have a question, feedback, or need support? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-12">

        {/* Contact info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Thank you for visiting Shopify Partners Directory. Our mission is to connect Shopify merchants with trusted professionals around the world. Whether you're looking for expert services or want to showcase your skills, we're committed to making those connections simple and reliable. If you have feedback, suggestions, or questions, I'd be happy to hear from you.

            </p>
          </div>
<script src="https://widget.trustmary.com/l7koy1Ihd"></script>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href="mailto:support@shopifypartnersdirectory.com" className="text-sm text-primary hover:underline">sfabunmi993@gmail.com

                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-sm text-muted-foreground">We typically respond within 24–48 hours on business days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {sent ?
          <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
              <CheckCircle className="w-12 h-12 text-primary" />
              <h3 className="font-heading text-lg font-semibold">Message Sent!</h3>
              <p className="text-sm text-muted-foreground">Thank you for reaching out. We'll get back to you soon.</p>
              <Button variant="outline" className="rounded-full mt-2" onClick={() => {setSent(false);setForm({ name: '', email: '', message: '' });}}>
                Send another message
              </Button>
            </div> :

          <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-heading text-lg font-semibold mb-2">Send a Message</h3>
              <div className="space-y-1.5">
                <Label>Your Name</Label>
                <Input placeholder="John Smith" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea placeholder="How can we help you?" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="h-28 resize-none" />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={sending}>
                {sending ? 'Sending...' : <><Send className="w-4 h-4 mr-1.5" /> Send Message</>}
              </Button>
            </form>
          }
        </div>
      </div>
    </div>);

}