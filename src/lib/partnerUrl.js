// Builds partner profile links with a .myshopify.com suffix so profile URLs
// read like a Shopify store domain (e.g. /partner/fabunmisamuelgeorge.myshopify.com).

export function partnerProfilePath(slugOrId) {
  const key = slugOrId || '';
  return `/partners/directory/partner/${key}`;
}

export function partnerProfileUrl(slugOrId) {
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
  return `${origin}${partnerProfilePath(slugOrId)}`;
}

// Removes the .myshopify.com suffix from a profile URL segment so the raw
// slug/id can be used for database lookups.
export function stripShopifySuffix(value) {
  if (!value) return value;
  return String(value).replace(/\.myshopify\.com$/i, '');
}