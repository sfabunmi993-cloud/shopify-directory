import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'expert_feature_announce_v1';

export default function ExpertFeaturePopup() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return;
        const user = await base44.auth.me();
        if (!active) return;
        if (user?.role === 'admin') return; // experts only
        const partners = await base44.entities.Partner.filter({ created_by_id: user.id });
        if (!active) return;
        if (partners.length === 0) return; // not a partner/expert
        if (localStorage.getItem(`${STORAGE_KEY}_${user.id}`)) return;
        setUserId(user.id);
        setOpen(true);
      } catch {
        // ignore — never block the app
      }
    })();
    return () => { active = false; };
  }, []);

  const markSeen = () => {
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, '1');
  };

  const handleDismiss = () => {
    markSeen();
    setOpen(false);
  };

  const handleGo = () => {
    markSeen();
    setOpen(false);
    navigate('/my-profile?focus=testimonials');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDismiss(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-emerald-600 px-5 py-4 flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">We made a new change</span>
        </div>
        <div className="p-5 space-y-4">
          <DialogHeader className="space-y-2 p-0">
            <DialogTitle className="text-left text-lg">Client Testimonials are now on your profile</DialogTitle>
            <DialogDescription className="text-left">
              You can now add up to 15 client testimonials right from your profile. They scroll automatically sideways on your public profile to show merchants what clients say about you.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground/80">
            Head to your <strong>My Profile</strong> page — we&apos;ve highlighted the new Testimonials section for you.
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
            <Button variant="ghost" className="rounded-full" onClick={handleDismiss}>
              Maybe later
            </Button>
            <Button className="rounded-full gap-1.5" onClick={handleGo}>
              Go to My Profile
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex">
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}