import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Megaphone, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

export default function AnnouncementsSection({ announcements, onOpenDialog, onToggle, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Live Announcements</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage announcements visible to all partners
          </p>
        </div>
        <Button onClick={onOpenDialog}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white border rounded-xl p-4 ${
                announcement.is_active ? 'border-border' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm">{announcement.title}</h4>
                    <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[announcement.priority]}`}>
                      {announcement.priority}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${announcement.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {announcement.created_date ? format(new Date(announcement.created_date), 'MMM d, yyyy') : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onToggle(announcement)}
                  >
                    {announcement.is_active ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => onDelete(announcement)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}