import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, Image as ImageIcon, Video, Plus } from 'lucide-react';
import { toast } from 'sonner';

const MAX_ITEMS = 3;

export default function PortfolioEditor({ portfolio = [], partnerId, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [captions, setCaptions] = useState({});

  const items = Array.isArray(portfolio) ? portfolio : [];

  const detectType = (file) => (file.type.startsWith('video/') ? 'video' : 'image');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (items.length >= MAX_ITEMS) {
      toast.error(`You can upload up to ${MAX_ITEMS} portfolio items.`);
      return;
    }
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast.error('Please upload an image or video file.');
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newItem = { type: detectType(file), url: file_url, caption: '' };
      const updated = [...items, newItem];
      await base44.entities.Partner.update(partnerId, { portfolio: updated });
      onChange(updated);
      toast.success('Portfolio item added!');
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async (index) => {
    const updated = items.filter((_, i) => i !== index);
    try {
      await base44.entities.Partner.update(partnerId, { portfolio: updated });
      onChange(updated);
      toast.success('Portfolio item removed.');
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  const handleCaptionChange = (index, value) => {
    setCaptions((prev) => ({ ...prev, [index]: value }));
  };

  const saveCaption = async (index) => {
    const value = captions[index];
    if (value === undefined) return;
    const updated = items.map((item, i) => (i === index ? { ...item, caption: value } : item));
    try {
      await base44.entities.Partner.update(partnerId, { portfolio: updated });
      onChange(updated);
      toast.success('Caption saved.');
    } catch (err) {
      toast.error('Failed to save caption.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div key={i} className="relative border border-border rounded-xl overflow-hidden group bg-muted/30">
            {item.type === 'video' ? (
              <video src={item.url} controls className="w-full h-32 object-cover bg-black" />
            ) : (
              <img src={item.url} alt={item.caption || 'Portfolio item'} className="w-full h-32 object-cover" />
            )}
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 z-10">
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute top-2 left-2 bg-black/60 text-white rounded px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-1">
              {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              {item.type}
            </div>
            <div className="p-2">
              <Input
                placeholder="Add a caption..."
                defaultValue={item.caption || ''}
                onChange={(e) => handleCaptionChange(i, e.target.value)}
                className="h-8 text-xs"
              />
              <Button size="sm" variant="ghost" className="w-full h-7 text-xs mt-1" onClick={() => saveCaption(i)}>
                Save caption
              </Button>
            </div>
          </div>
        ))}

        {items.length < MAX_ITEMS && (
          <label className="border-2 border-dashed border-border rounded-xl h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all cursor-pointer">
            {uploading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /><span className="text-sm">Uploading...</span></>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Add portfolio item</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> or <Video className="w-3 h-3" />
                </span>
              </>
            )}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Upload className="w-3 h-3" />
        You can upload up to {MAX_ITEMS} images or videos. {items.length}/{MAX_ITEMS} used.
      </p>
    </div>
  );
}