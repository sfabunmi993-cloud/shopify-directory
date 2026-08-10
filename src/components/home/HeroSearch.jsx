import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Hash, BadgeCheck, X, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PartnerAvatar from '@/components/directory/PartnerAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runSearch = async (q) => {
    const term = q.trim().toLowerCase();
    if (!term) {
      setResults([]);
      setSearched(false);
      setOpen(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    setOpen(true);
    try {
      const partners = await base44.entities.Partner.filter({ status: 'approved' }, '-profile_views', 50);
      const matched = partners.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const num = (p.partner_number || '').toLowerCase();
        return name.includes(term) || num.includes(term);
      });
      setResults(matched);
    } catch (_) {
      setResults([]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div ref={wrapperRef} className="relative flex flex-col sm:flex-row gap-3 max-w-xl">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by partner name or ID number"
          className="w-full h-12 pl-12 pr-10 rounded-full bg-white border border-gray-300 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setSearched(false); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Popup result card */}
        {open && (
          <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-500">No partner found matching <strong>"{query}"</strong>.</p>
                <p className="text-xs text-gray-400 mt-1">Try searching by full name or partner ID (e.g. PB-00042).</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map((partner) => (
                  <div key={partner.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                      <div className="shrink-0">
                        <PartnerAvatar partner={partner} size="md" shape="rounded-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-heading font-semibold text-foreground text-base truncate flex items-center gap-1.5">
                              {partner.name}
                            </h3>
                            {partner.partner_number && (
                              <span className="text-xs text-muted-foreground font-mono flex items-center gap-0.5">
                                <Hash className="w-2.5 h-2.5" />{partner.partner_number}
                                {partner.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-0.5" />}
                              </span>
                            )}
                          </div>
                          {partner.partner_tier && partner.partner_tier !== 'standard' && (
                            <Badge variant="outline" className="text-xs shrink-0 capitalize">
                              {partner.partner_tier}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                          {partner.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-medium text-foreground">{partner.rating}</span>
                              <span>({partner.review_count || 0})</span>
                            </span>
                          )}
                          {partner.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {partner.location}
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <Button asChild size="sm" className="rounded-full h-9 px-4">
                            <Link to={`/partner/${partner.slug || partner.id}`}>
                              View Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Button type="submit" onClick={handleSubmit} size="icon" className="h-12 w-12 rounded-full bg-black text-white hover:bg-black/90 shrink-0">
        <Search className="w-5 h-5" />
      </Button>
    </div>
  );
}