export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number>,
) {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, properties);
  }
}
