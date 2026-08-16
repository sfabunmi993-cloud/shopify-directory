import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FilterSidebar from '@/components/directory/FilterSidebar';
import PartnerCard from '@/components/directory/PartnerCard';
import CompareBar from '@/components/directory/CompareBar';
import ComparePartners from '@/pages/ComparePartners';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import PullToRefresh from '@/components/PullToRefresh';

export default function Directory() {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    industry: 'all',
    location: searchParams.get('country') || 'all',
    tier: 'all',
    minPrice: '',
    maxPrice: ''
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Sync navbar-driven URL changes (search, category, country) into local state
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || 'all',
      location: searchParams.get('country') || prev.location
    }));
  }, [searchParams]);
  const [sortBy, setSortBy] = useState('rating');
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = (partner) => {
    setCompareIds((prev) =>
    prev.includes(partner.id) ?
    prev.filter((id) => id !== partner.id) :
    prev.length < 4 ? [...prev, partner.id] : prev
    );
  };

  const queryClient = useQueryClient();
  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.Partner.list('-rating', 500),
    initialData: []
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['partners'] });
  };

  const comparePartners = useMemo(
    () => partners.filter((p) => compareIds.includes(p.id)),
    [partners, compareIds]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: 'all', industry: 'all', location: 'all', tier: 'all', minPrice: '', maxPrice: '' });
    setSearchQuery('');
  };

  const filteredPartners = useMemo(() => {
    let results = [...partners];

    // Exclude hidden partners from directory view
    results = results.filter((p) => !p.is_hidden && p.status === 'approved');

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.partner_number?.toLowerCase().includes(q) ||
      p.services?.some((s) => s.toLowerCase().includes(q)) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.category !== 'all') {
      results = results.filter((p) => p.service_category === filters.category);
    }
    if (filters.industry !== 'all') {
      results = results.filter((p) => p.industry === filters.industry);
    }
    if (filters.location !== 'all') {
      results = results.filter((p) => p.country === filters.location);
    }
    if (filters.tier !== 'all') {
      results = results.filter((p) => p.partner_tier === filters.tier);
    }
    if (filters.minPrice) {
      results = results.filter((p) => (p.starting_price || 0) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter((p) => (p.starting_price || 0) <= Number(filters.maxPrice));
    }

    if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      results.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    } else if (sortBy === 'price_low') {
      results.sort((a, b) => (a.starting_price || 0) - (b.starting_price || 0));
    } else if (sortBy === 'price_high') {
      results.sort((a, b) => (b.starting_price || 0) - (a.starting_price || 0));
    }

    // Always put verified partners first, then sort by review count within each group
    results.sort((a, b) => {
      if (a.is_verified === b.is_verified) return (b.review_count || 0) - (a.review_count || 0);
      return a.is_verified ? -1 : 1;
    });

    return results;
  }, [partners, filters, searchQuery, sortBy]);

  if (showCompare) {
    return (
      <ComparePartners
        partners={comparePartners}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        onClose={() => setShowCompare(false)} />);


  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <PullToRefresh onRefresh={handleRefresh} />
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Find service partners</h1>
            <p className="text-muted-foreground mt-2">Browse by price, location, services, and more to find a partner that meets your needs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
            { label: 'Marketing and sales', to: '/directory?category=marketing_and_sales' },
            { label: 'Store setup and management', to: '/directory?category=store_setup_and_management' },
            { label: 'Development and troubleshooting', to: '/directory?category=development_and_troubleshooting' },
            { label: 'Visual content and branding', to: '/directory?category=visual_content_and_branding' },
            { label: 'Content writing', to: '/directory?category=content_writing' },
            { label: 'Expert guidance', to: '/directory?category=expert_guidance' }].
            map((c) =>
            <Link
              key={c.label}
              to={c.to}
              className="inline-block border-2 border-border bg-card text-foreground rounded-full px-4 py-1.5 text-sm font-medium hover:border-foreground hover:bg-muted transition-colors">
                {c.label}
              </Link>
            )}
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="https://cdn.shopify.com/b/shopify-brochure2-assets/a7ac407a50f89efe69413cc02a73d700.png?height=363"
            alt="Communication and collaboration illustration"
            className="mx-auto max-h-80 object-contain" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} />
          </div>
        </aside>

        {/* Main Content */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            

            

            <div className="flex items-center gap-2">
              {/* Mobile filter trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-1.5" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top rated</SelectItem>
                  <SelectItem value="reviews">Most reviewed</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ?
            Array(6).fill(0).map((_, i) =>
            <div key={i} className="border border-border rounded-xl p-5">
                  <div className="flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-80" />
                    </div>
                  </div>
                </div>
            ) :
            filteredPartners.length === 0 ?
            <div className="text-center py-20">
                <p className="text-lg font-medium text-foreground">No partners found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 rounded-full">
                  <X className="w-3 h-3 mr-1" /> Clear all filters
                </Button>
              </div> :

            filteredPartners.map((partner) =>
            <PartnerCard
              key={partner.id}
              partner={partner}
              compareSelected={compareIds.includes(partner.id)}
              onToggleCompare={() => toggleCompare(partner)} />

            )
            }
          </div>
        </div>
      </div>
      <CompareBar
        partners={comparePartners}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        onCompare={() => setShowCompare(true)}
        onClear={() => setCompareIds([])} />
      
    </div>);

}