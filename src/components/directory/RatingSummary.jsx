import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FILLED = '#FFC107';
const EMPTY = '#E0E0E0';
const BAR_FILL = '#A8E6CF';
const BAR_BG = '#E0E0E0';

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5 w-[90px] shrink-0">
      {[5, 4, 3, 2, 1].map((n) => (
        <Star
          key={n}
          className="w-4 h-4"
          style={{ fill: n <= count ? FILLED : EMPTY, color: n <= count ? FILLED : EMPTY }}
        />
      ))}
    </div>
  );
}

export default function RatingSummary({ partnerId, rating, reviewCount }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['rating-distribution', partnerId],
    queryFn: () => base44.entities.Review.filter({ partner_id: partnerId }, '-created_date', 1000),
    enabled: !!partnerId,
    staleTime: 60000
  });

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Number(r.rating) === star).length;
    return { star, count };
  });
  const total = reviews.length || reviewCount || 0;
  const avg = rating || (reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length) : 0);

  return (
    <div className="px-5 pt-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        Rating <Star className="w-5 h-5" style={{ fill: FILLED, color: FILLED }} /> {avg ? avg.toFixed(1) : '0.0'} ({total})
      </h2>
      <p className="text-base font-medium text-foreground mt-1">Overall rating summary</p>
      <p className="text-sm text-muted-foreground mt-0.5">
        Ratings based on{' '}
        <span className="underline decoration-dotted decoration-muted-foreground underline-offset-2">quality of work</span>{' '}
        and{' '}
        <span className="underline decoration-dotted decoration-muted-foreground underline-offset-2">communication</span>
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {distribution.map(({ star, count }) => {
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <Stars count={star} />
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: BAR_BG }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: BAR_FILL }} />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right shrink-0">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}