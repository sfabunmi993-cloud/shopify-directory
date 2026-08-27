import React from 'react';

/**
 * Full-screen white splash shown instantly when the app opens (native mobile
 * cold-start and initial web load). Displays the app logo centered, then is
 * replaced by the app once auth/settings resolve or a route finishes loading.
 */
export default function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      role="status"
      aria-label="Loading"
    >
      <img
        src="https://cdn.shopify.com/b/shopify-brochure2-assets/08b278c519512d187520e1fe10b4f5b7.svg"
        alt="Shopify Partner Directory"
        className="h-10 w-auto animate-pulse"
      />
    </div>
  );
}