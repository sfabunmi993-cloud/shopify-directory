import React from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompareBar({ partners, onRemove, onCompare, onClear }) {
  if (partners.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-foreground shrink-0">
          Compare ({partners.length}/4):
        </span>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {partners.map(p => (
            <div key={p.id} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-sm">
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">{p.name?.charAt(0)?.toUpperCase()}</span>
                </div>
              )}
              <span className="max-w-[120px] truncate font-medium">{p.name}</span>
              <button onClick={() => onRemove(p.id)} className="text-muted-foreground hover:text-destructive ml-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Clear all
          </button>
          <Button
            onClick={onCompare}
            disabled={partners.length < 2}
            size="sm"
            className="rounded-full gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Compare {partners.length >= 2 ? `(${partners.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}