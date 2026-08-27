import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Responsive select: on desktop renders the standard Radix Select; on mobile
 * viewports renders the option list inside a native bottom sheet (Vaul drawer).
 *
 * props:
 *  - options: [{ label, value }]
 *  - value, onValueChange, placeholder
 *  - label: optional title shown in the drawer header
 *  - triggerClassName: extra classes for the trigger button
 */
export default function MobileSelect({
  options = [],
  value,
  onValueChange,
  placeholder = 'Select…',
  label,
  triggerClassName,
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-11 min-h-[44px] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-left">
          {label && <DrawerTitle>{label}</DrawerTitle>}
          <DrawerDescription className="sr-only">Choose an option</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-2 pb-6 safe-pb">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onValueChange?.(o.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm min-h-[44px] transition-colors hover:bg-accent',
                  active && 'bg-accent text-foreground font-medium'
                )}
              >
                <span className="truncate">{o.label}</span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}