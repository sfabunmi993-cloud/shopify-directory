import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  { label: 'Real Estate', value: 'real_estate' },
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
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground text-xs h-auto py-1">
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
            className="h-9"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Industry</Label>
        <Select value={filters.industry || 'all'} onValueChange={(v) => onFilterChange('industry', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Service Category</Label>
        <Select value={filters.category} onValueChange={(v) => onFilterChange('category', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Location</Label>
        <Select value={filters.location} onValueChange={(v) => onFilterChange('location', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border pt-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Partner Tier</Label>
        <Select value={filters.tier} onValueChange={(v) => onFilterChange('tier', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a partner tier" />
          </SelectTrigger>
          <SelectContent>
            {TIERS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}