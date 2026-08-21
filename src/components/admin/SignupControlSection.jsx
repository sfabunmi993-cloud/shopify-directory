import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Admin control to enable/disable the public sign-up (register) page.
 * Stored as an AppSettings record with key 'signup_enabled' and value { enabled: boolean }.
 */
export default function SignupControlSection() {
  const [enabled, setEnabled] = useState(null); // null = loading
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'signup_enabled' })
      .then(records => {
        if (records.length > 0) {
          setEnabled(records[0].value?.enabled !== false);
          setSettingsId(records[0].id);
        } else {
          setEnabled(true);
        }
      })
      .catch(() => setEnabled(true));
  }, []);

  const toggle = async () => {
    const newVal = !enabled;
    setSaving(true);
    try {
      if (settingsId) {
        await base44.entities.AppSettings.update(settingsId, { value: { enabled: newVal } });
      } else {
        const rec = await base44.entities.AppSettings.create({ key: 'signup_enabled', value: { enabled: newVal } });
        setSettingsId(rec.id);
      }
      setEnabled(newVal);
      toast.success(newVal ? 'Sign-up page is now available.' : 'Sign-up page is now disabled.');
    } catch (err) {
      toast.error('Failed to update sign-up availability.');
    } finally {
      setSaving(false);
    }
  };

  if (enabled === null) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-md mb-6">
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold flex items-center gap-1.5 text-sm">
              <UserPlus className="w-4 h-4" /> Sign-Up Page Availability
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Control whether new users can create accounts. When off, the sign-up page shows a "not available" message.
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            disabled={saving}
            aria-label={enabled ? 'Disable sign-up' : 'Enable sign-up'}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        <div className="mt-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {enabled ? 'Available' : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
}