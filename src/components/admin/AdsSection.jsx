import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, ExternalLink, ToggleLeft, ToggleRight, Edit2, Megaphone, Upload } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_AD = {
  title: '',
  content: '',
  image_url: '',
  video_url: '',
  button_text: 'Learn More',
  button_url: '',
  bg_color: '#ffffff',
  text_color: '#111827',
  button_color: '#166534'
};

export default function AdsSection() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null); // null = new
  const [form, setForm] = useState(EMPTY_AD);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AdPromotion.list('-created_date', 50);
    setAds(data);
    setLoading(false);
  };

  useEffect(() => {load();}, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_AD);
    setDialog(true);
  };

  const openEdit = (ad) => {
    setEditing(ad);
    setForm({
      title: ad.title || '',
      content: ad.content || '',
      image_url: ad.image_url || '',
      video_url: ad.video_url || '',
      button_text: ad.button_text || 'Learn More',
      button_url: ad.button_url || '',
      bg_color: ad.bg_color || '#ffffff',
      text_color: ad.text_color || '#111827',
      button_color: ad.button_color || '#166534'
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.button_url.trim()) return;
    setSaving(true);
    if (editing) {
      await base44.entities.AdPromotion.update(editing.id, form);
      toast.success('Ad updated!');
    } else {
      await base44.entities.AdPromotion.create({ ...form, is_active: false });
      toast.success('Ad created!');
    }
    setDialog(false);
    load();
    setSaving(false);
  };

  const handleToggleActive = async (ad) => {
    // Deactivate all others, then toggle this one
    const newState = !ad.is_active;
    if (newState) {
      await Promise.all(ads.filter((a) => a.id !== ad.id && a.is_active).map((a) =>
      base44.entities.AdPromotion.update(a.id, { is_active: false })
      ));
    }
    await base44.entities.AdPromotion.update(ad.id, { is_active: newState });
    toast.success(newState ? 'Ad is now live!' : 'Ad deactivated');
    load();
  };

  const handleDelete = async (ad) => {
    if (!confirm(`Delete ad "${ad.title}"?`)) return;
    await base44.entities.AdPromotion.delete(ad.id);
    toast.success('Ad deleted');
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold">Ad Promotions</h3>
          <p className="text-sm text-muted-foreground">Design popup ads shown to partners across the platform.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-1.5" /> New Ad
        </Button>
      </div>

      {ads.length === 0 ?
      <div className="text-center py-12 bg-white border border-border rounded-xl">
          <Megaphone className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No ads yet. Create your first promotion!</p>
        </div> :

      <div className="space-y-3">
          {ads.map((ad) =>
        <div key={ad.id} className="bg-white border border-border rounded-xl p-4 flex items-start gap-4">
              {/* Preview swatch */}
              <div
            className="w-12 h-12 rounded-lg border border-border shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: ad.bg_color || '#fff', color: ad.text_color || '#111' }}>
            
                Ad
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{ad.title}</p>
                  <Badge variant="outline" className={ad.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground'}>
                    {ad.is_active ? '● Live' : 'Inactive'}
                  </Badge>
                </div>
                {ad.content && <p className="text-xs text-muted-foreground mt-1 truncate">{ad.content}</p>}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full border" style={{ backgroundColor: ad.button_color, color: '#fff', borderColor: ad.button_color }}>
                    {ad.button_text || 'Button'}
                  </span>
                  <a href={ad.button_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5">
                    <ExternalLink className="w-3 h-3" /> {ad.button_url?.slice(0, 40)}{ad.button_url?.length > 40 ? '…' : ''}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(ad)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
              size="sm"
              variant="outline"
              className={`rounded-full gap-1 ${ad.is_active ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-muted-foreground'}`}
              onClick={() => handleToggleActive(ad)}>
              
                  {ad.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {ad.is_active ? 'Live' : 'Activate'}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={() => handleDelete(ad)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
        )}
        </div>
      }

      {/* Create / Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Headline *</label>
              <Input placeholder="e.g. Boost your store sales with AI!" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Body Text</label>
              <Textarea placeholder="Describe what you're promoting..." value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="h-24 resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image (optional)</label>
              <div className="flex gap-2">
                <Input placeholder="https://... or upload below" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="flex-1" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg px-4 py-3 hover:bg-muted/40 transition-colors text-sm text-muted-foreground">
                <Upload className="w-4 h-4" />
                <span>Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setForm((f) => ({ ...f, image_url: file_url }));
                    } catch (_) {}
                  }} />
                
              </label>
              {form.image_url &&
              <img src={form.image_url} alt="Preview" className="w-full h-28 object-cover rounded-lg border border-border px-1" onError={(e) => e.target.style.display = 'none'} />
              }
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Video (optional)</label>
              <Input placeholder="https://... or upload below" value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} />
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg px-4 py-3 hover:bg-muted/40 transition-colors text-sm text-muted-foreground">
                <Upload className="w-4 h-4" />
                <span>Upload video</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setForm((f) => ({ ...f, video_url: file_url }));
                      toast.success('Video uploaded!');
                    } catch (_) {toast.error('Upload failed');}
                  }} />
                
              </label>
              {form.video_url &&
              <video src={form.video_url} className="w-full h-28 object-cover rounded-lg border border-border" controls />
              }
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Button Text</label>
                <Input placeholder="e.g. Get Started" value={form.button_text} onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Button URL *</label>
                <Input placeholder="https://..." value={form.button_url} onChange={(e) => setForm((f) => ({ ...f, button_url: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bg_color} onChange={(e) => setForm((f) => ({ ...f, bg_color: e.target.value }))} className="w-9 h-9 rounded cursor-pointer border border-border" />
                  <Input value={form.bg_color} onChange={(e) => setForm((f) => ({ ...f, bg_color: e.target.value }))} className="flex-1 text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.text_color} onChange={(e) => setForm((f) => ({ ...f, text_color: e.target.value }))} className="w-9 h-9 rounded cursor-pointer border border-border" />
                  <Input value={form.text_color} onChange={(e) => setForm((f) => ({ ...f, text_color: e.target.value }))} className="flex-1 text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Button Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.button_color} onChange={(e) => setForm((f) => ({ ...f, button_color: e.target.value }))} className="w-9 h-9 rounded cursor-pointer border border-border" />
                  <Input value={form.button_color} onChange={(e) => setForm((f) => ({ ...f, button_color: e.target.value }))} className="flex-1 text-xs" />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Preview</label>
              <div className="rounded-xl border border-border overflow-hidden shadow-sm" style={{ backgroundColor: form.bg_color }}>
                {form.video_url ?
                <video src={form.video_url} className="w-full h-32 object-cover" autoPlay muted loop /> :
                form.image_url ?
                <img src={form.image_url} alt="Ad" className="w-full h-32 object-cover" onError={(e) => e.target.style.display = 'none'} /> :
                null}
                <div className="p-4">
                  <p className="font-bold text-base" style={{ color: form.text_color }}>{form.title || 'Your Headline'}</p>
                  {form.content && <p className="text-sm mt-1 opacity-80" style={{ color: form.text_color }}>{form.content}</p>}
                  {form.button_text &&
                  <button className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: form.button_color }}>
                      {form.button_text}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim() || !form.button_url.trim() || saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save Changes' : 'Create Ad'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}