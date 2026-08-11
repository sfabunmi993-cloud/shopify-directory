import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const DEFAULT_PRICING = {
  premium_badge: 25000,
  reviews_5: 8000,
  reviews_10: 14000,
  reviews_20: 26000,
  domain_purchase: 10000,
};

export function usePricing() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const records = await base44.entities.AppSettings.filter({ key: 'pricing' });
      if (records.length > 0) {
        setPricing({ ...DEFAULT_PRICING, ...records[0].value });
        setSettingsId(records[0].id);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { pricing, settingsId, loading };
}