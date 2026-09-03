// Fires a GA4 event -- no-op if analytics hasn't loaded (blocked, ad-blocker, etc).
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
