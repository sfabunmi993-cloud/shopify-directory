/**
 * Detects whether the app is running inside a native mobile shell
 * (Capacitor, Cordova, iOS WKWebView, Android WebView, or standalone PWA).
 * Use to gate mobile-only UI such as the launch splash screen.
 */
export function isNativeApp() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.cordova || window.Ionic) return true;
  const ua = window.navigator.userAgent || '';
  // iOS WKWebView (in-app) omits "Safari"
  if (/(iPhone|iPad|iPod)/i.test(ua) && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua)) return true;
  // Android WebView
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return true;
  if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true;
  return false;
}