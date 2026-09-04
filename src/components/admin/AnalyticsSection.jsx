import React, { useMemo } from 'react';
import { BarChart3, Eye, Star, Users, Flag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_COLORS = {
  approved: '#16a34a',
  pending: '#d97706',
  restricted: '#dc2626',
};

function dayIndex(dt, buckets) {
  if (!dt) return -1;
  const d = typeof dt === 'string' ? parseISO(dt) : new Date(dt);
  if (isNaN(d.getTime())) return -1;
  return buckets.findIndex((b) => isSameDay(b.date, d));
}

export default function AnalyticsSection({ partners, users, flags, onRefresh }) {
  const approved = partners.filter((p) => p.status === 'approved');

  const totalViews = useMemo(
    () => approved.reduce((s, p) => s + (p.profile_views || 0), 0),
    [approved]
  );

  const avgRating = useMemo(() => {
    const rated = approved.filter((p) => p.rating > 0);
    if (!rated.length) return '—';
    return (rated.reduce((s, p) => s + p.rating, 0) / rated.length).toFixed(1);
  }, [approved]);

  const openFlags = flags.filter((f) => f.status === 'pending').length;

  const topViewed = useMemo(
    () => [...approved].sort((a, b) => (b.profile_views || 0) - (a.profile_views || 0)).slice(0, 10),
    [approved]
  );
  const maxViews = Math.max(...topViewed.map((p) => p.profile_views || 0), 1);

  const trend = useMemo(() => {
    const days = 14;
    const today = startOfDay(new Date());
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = subDays(today, days - 1 - i);
      return { date: d, label: format(d, 'MMM d'), partners: 0 };
    });
    partners.forEach((p) => {
      const i = dayIndex(p.created_date, buckets);
      if (i >= 0) buckets[i].partners++;
    });
    return buckets;
  }, [partners]);

  const statusBreakdown = useMemo(() => {
    const counts = { approved: 0, pending: 0, restricted: 0 };
    partners.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return [
      { name: 'Approved', value: counts.approved, key: 'approved' },
      { name: 'Pending', value: counts.pending, key: 'pending' },
      { name: 'Restricted', value: counts.restricted, key: 'restricted' },
    ].filter((d) => d.value > 0);
  }, [partners]);

  const stats = [
    { label: 'Profile Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Avg Rating', value: avgRating === '—' ? '—' : `★ ${avgRating}`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Approved Partners', value: approved.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Open Flags', value: openFlags, icon: Flag, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Directory Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Most viewed partners and overall activity trends across the directory
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity trend chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Activity — last 14 days</h4>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} tickMargin={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="partners" name="New Partners" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Partner status breakdown */}
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Partner status breakdown</h4>
          </div>
          {statusBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No partners yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Most viewed partners */}
      <div className="bg-white border border-border rounded-xl divide-y divide-border">
        <div className="px-4 py-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600" />
          <h4 className="font-semibold text-sm">Most viewed partners</h4>
        </div>
        {topViewed.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No approved partners yet.</p>
        ) : (
          topViewed.map((partner, index) => {
            const views = partner.profile_views || 0;
            const pct = Math.round((views / maxViews) * 100);
            return (
              <div key={partner.id} className="px-4 py-3 flex items-center gap-4">
                <span className="w-5 text-xs text-muted-foreground font-mono shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{partner.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">★ {partner.rating?.toFixed(1) || '—'}</p>
                    <p className="text-xs text-muted-foreground">{partner.review_count || 0} reviews</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}