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
        src="https://media.base44.com/images/public/6a25a3e760ebc5e135a0582b/602604d47_image.png"
        alt="Shopify Partner Base"
        className="h-10 w-auto animate-pulse"
      />
    </div>
  );
}