import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FilterSidebar from '@/components/directory/FilterSidebar';
import PartnerCard from '@/components/directory/PartnerCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function Directory() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  const initialSearch = urlParams.get('search') || '';

  const [filters, setFilters] = useState({
    category: initialCategory,
    location: 'all',
    tier: 'all',
    minPrice: '',
    maxPrice: '',
  });
  const [searchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('rating');

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.Partner.list('-rating', 200),
    initialData: [],
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: 'all', location: 'all', tier: 'all', minPrice: '', maxPrice: '' });
  };

  const filteredPartners = useMemo(() => {
    let results = [...partners];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.services?.some(s => s.toLowerCase().includes(q))
      );
    }

    if (filters.category !== 'all') {
      results = results.filter(p => p.service_category === filters.category);
    }
    if (filters.location !== 'all') {
      results = results.filter(p => p.country === filters.location);
    }
    if (filters.tier !== 'all') {
      results = results.filter(p => p.partner_tier === filters.tier);
    }
    if (filters.minPrice) {
      results = results.filter(p => (p.starting_price || 0) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(p => (p.starting_price || 0) <= Number(filters.maxPrice));
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

    return results;
  }, [partners, filters, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `Showing ${filteredPartners.length} partner${filteredPartners.length !== 1 ? 's' : ''}`}
            </p>

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
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
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
              ))
            ) : filteredPartners.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-medium text-foreground">No partners found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 rounded-full">
                  <X className="w-3 h-3 mr-1" /> Clear all filters
                </Button>
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}