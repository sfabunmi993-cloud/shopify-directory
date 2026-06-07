import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PartnerCard from '@/components/directory/PartnerCard';

export default function Favorites() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const load = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/login'); return; }
      const user = await base44.auth.me();
      const favs = await base44.entities.Favorite.filter({ user_id: user.id });
      if (favs.length === 0) { setLoading(false); return; }
      const partnerIds = favs.map(f => f.partner_id);
      const all = await base44.entities.Partner.list('-created_date', 200);
      setPartners(all.filter(p => partnerIds.includes(p.id) && p.status === 'approved'));
      setLoading(false);
    };
    load();
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to directory
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">Saved Partners</h1>
          <p className="text-sm text-muted-foreground">Your personal shortlist</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium">No saved partners yet</p>
          <p className="text-sm text-muted-foreground mt-1">Browse the directory and click the heart icon to save partners.</p>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link to="/directory">Browse Partners</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map(p => <PartnerCard key={p.id} partner={p} />)}
        </div>
      )}
    </div>
  );
}