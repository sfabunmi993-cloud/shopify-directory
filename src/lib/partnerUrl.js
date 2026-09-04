// Builds partner profile links with a .myshopify.com suffix so profile URLs
// read like a Shopify store domain (e.g. /partner/fabunmisamuelgeorge.myshopify.com).

export function partnerProfilePath(slugOrId) {
  const key = slugOrId || '';
  return `/partners/directory/partner/${key}`;
}

// Inside the native mobile app the shareable profile link should point to
// the public custom domain rather than the app's internal base44 origin.
function isNativeApp() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.cordova || window.Ionic) return true;
  const ua = window.navigator.userAgent || '';
  if (/(iPhone|iPad|iPod)/i.test(ua) && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua)) return true;
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return true;
  if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true;
  return false;
}

export function partnerProfileUrl(slugOrId) {
  let origin = '';
  if (typeof window !== 'undefined' && window.location) {
    origin = isNativeApp() ? 'https://shopifypartner.chat' : window.location.origin;
  }
  return `${origin}${partnerProfilePath(slugOrId)}`;
}

// Removes the .myshopify.com suffix from a profile URL segment so the raw
// slug/id can be used for database lookups.
export function stripShopifySuffix(value) {
  if (!value) return value;
  return String(value).replace(/\.myshopify\.com$/i, '');
}