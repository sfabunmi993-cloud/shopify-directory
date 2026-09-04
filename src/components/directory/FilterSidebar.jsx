import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import MobileSelect from '@/components/ui/mobile-select';

const SERVICE_CATEGORIES = [
  { label: 'All Services', value: 'all' },
  { label: 'Marketing and sales', value: 'marketing_and_sales' },
  { label: 'Store setup and management', value: 'store_setup_and_management' },
  { label: 'Development and troubleshooting', value: 'development_and_troubleshooting' },
  { label: 'Visual content and branding', value: 'visual_content_and_branding' },
  { label: 'Content writing', value: 'content_writing' },
  { label: 'Expert guidance', value: 'expert_guidance' },
];

const INDUSTRIES = [
  { label: 'All Industries', value: 'all' },
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Finance', value: 'finance' },
  { label: 'Retail', value: 'retail' },
  { label: 'Education', value: 'education' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Real estate', value: 'real_estate' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Creative', value: 'creative' },
  { label: 'Other', value: 'other' },
];

const LOCATIONS = [
  { label: 'All Locations', value: 'all' },
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Canada', value: 'Canada' },
  { label: 'India', value: 'India' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Nigeria', value: 'Nigeria' },
];

const TIERS = [
  { label: 'All Tiers', value: 'all' },
  { label: 'Standard', value: 'standard' },
  { label: 'Plus', value: 'plus' },
  { label: 'Premium', value: 'premium' },
];

export default function FilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const hasActiveFilters = filters.category !== 'all' || filters.industry !== 'all' || filters.location !== 'all' || 
    filters.tier !== 'all' || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-bold text-foreground">Filter</h3>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters} className="text-muted-foreground text-xs h-9 min-h-[44px] px-3">
            <X className="w-3 h-3 mr-1" /> Clear all
          </Button>
        )}
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Price range (USD)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="h-11 min-h-[44px]"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="h-11 min-h-[44px]"
          />
        </div>
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Industry</Label>
        <MobileSelect
          options={INDUSTRIES}
          value={filters.industry || 'all'}
          onValueChange={(v) => onFilterChange('industry', v)}
          placeholder="Select an industry"
          label="Industry"
        />
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Service Category</Label>
        <MobileSelect
          options={SERVICE_CATEGORIES}
          value={filters.category}
          onValueChange={(v) => onFilterChange('category', v)}
          placeholder="Select a service"
          label="Service Category"
        />
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Location</Label>
        <MobileSelect
          options={LOCATIONS}
          value={filters.location}
          onValueChange={(v) => onFilterChange('location', v)}
          placeholder="Select a location"
          label="Location"
        />
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Partner Tier</Label>
        <MobileSelect
          options={TIERS}
          value={filters.tier}
          onValueChange={(v) => onFilterChange('tier', v)}
          placeholder="Select a partner tier"
          label="Partner Tier"
        />
      </div>
    </div>
  );
}