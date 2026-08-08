import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, Image as ImageIcon, Video, Plus, Globe, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

const MAX_ITEMS = 3;

function getDomain(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function faviconUrl(url) {
  const domain = getDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
}

export default function PortfolioEditor({ portfolio = [], partnerId, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [detecting, setDetecting] = useState({});
  const [detectedNames, setDetectedNames] = useState({});

  const items = Array.isArray(portfolio) ? portfolio : [];

  const detectType = (file) => (file.type.startsWith('video/') ? 'video' : 'image');

  const detectStore = async (index, url) => {
    const domain = getDomain(url);
    if (!domain) return;
    setDetecting((prev) => ({ ...prev, [index]: true }));
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `What is the official store or brand name for the website ${url}? Search for this store's homepage and return just the store/brand name as it appears on their site.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: { type: 'object', properties: { store_name: { type: 'string' } } },
      });
      const name = res?.store_name || domain;
      setDetectedNames((prev) => ({ ...prev, [index]: name }));
      toast.success(`Detected: ${name}`);
    } catch (err) {
      // Fallback to domain name
      setDetectedNames((prev) => ({ ...prev, [index]: domain }));
      toast.info('Could not auto-detect store name. Using domain instead.');
    } finally {
      setDetecting((prev) => ({ ...prev, [index]: false }));
    }
  };

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
      const newItem = { type: detectType(file), url: file_url, store_url: '', store_name: '', caption: '' };
      const updated = [...items, newItem];
      await base44.entities.Partner.update(partnerId, { portfolio: updated });
      onChange(updated);
      toast.success('Portfolio item added! Please add the store URL.');
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

  const updateDraft = (index, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
  };

  const saveDetails = async (index) => {
    const draft = drafts[index] || {};
    const storeUrl = (draft.store_url !== undefined ? draft.store_url : items[index]?.store_url || '').trim();
    const caption = (draft.caption !== undefined ? draft.caption : items[index]?.caption || '').trim();

    if (!storeUrl) {
      toast.error('Store URL is required.');
      return;
    }

    const storeName = detectedNames[index] || items[index]?.store_name || getDomain(storeUrl) || '';

    const updated = items.map((item, i) =>
      i === index ? { ...item, store_url: storeUrl, store_name: storeName, caption } : item
    );
    try {
      await base44.entities.Partner.update(partnerId, { portfolio: updated });
      onChange(updated);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      toast.success('Portfolio details saved!');
    } catch (err) {
      toast.error('Failed to save details.');
    }
  };

  const getValue = (index, field) => {
    if (drafts[index]?.[field] !== undefined) return drafts[index][field];
    return items[index]?.[field] || '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, i) => {
          const hasStoreUrl = !!item.store_url;
          const currentUrl = getValue(i, 'store_url');
          const detectedName = detectedNames[i] || item.store_name;
          const fav = faviconUrl(currentUrl || item.store_url);
          return (
            <div key={i} className="relative border border-border rounded-xl overflow-hidden bg-muted/30">
              {item.type === 'video' ? (
                <video src={item.url} controls playsInline preload="metadata" className="w-full h-40 object-contain bg-black" />
              ) : (
                <img src={item.url} alt={item.caption || 'Portfolio item'} className="w-full h-40 object-cover" />
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
              {!hasStoreUrl && (
                <div className="bg-amber-50 border-t border-amber-200 px-2 py-1 flex items-center gap-1 text-[10px] text-amber-700">
                  <AlertCircle className="w-3 h-3 shrink-0" /> Store URL required
                </div>
              )}
              <div className="p-2 space-y-1.5">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-0.5">
                    <Globe className="w-3 h-3" /> Store URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="https://mystore.com"
                    value={currentUrl}
                    onChange={(e) => updateDraft(i, 'store_url', e.target.value)}
                    onBlur={(e) => {
                      const url = e.target.value.trim();
                      if (url && getDomain(url)) detectStore(i, url);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                {(detecting[i] || detectedName) && (
                  <div className="flex items-center gap-1.5 bg-primary/5 rounded-md px-2 py-1">
                    {detecting[i] ? (
                      <><Loader2 className="w-3 h-3 animate-spin text-primary" /><span className="text-[10px] text-primary">Detecting store...</span></>
                    ) : (
                      <>
                        {fav && <img src={fav} alt="" className="w-4 h-4 rounded-sm" />}
                        <span className="text-[10px] font-medium text-foreground truncate flex-1">{detectedName}</span>
                        <Search className="w-3 h-3 text-primary" />
                      </>
                    )}
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Caption</label>
                  <Input
                    placeholder="Describe this work..."
                    value={getValue(i, 'caption')}
                    onChange={(e) => updateDraft(i, 'caption', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Button size="sm" className="w-full h-7 text-xs" onClick={() => saveDetails(i)}>
                  Save details
                </Button>
              </div>
            </div>
          );
        })}

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
        You can upload up to {MAX_ITEMS} images or videos. {items.length}/{MAX_ITEMS} used. Store URL is required and auto-detects the store homepage.
      </p>
    </div>
  );
}