/**
 * Analytics utility for tracking escrow usage and user interactions
 * This is a lightweight implementation that can be extended with
 * third-party analytics services (e.g., Google Analytics, Mixpanel)
 */

type AnalyticsEvent =
  | 'escrow_toggle_enabled'
  | 'escrow_toggle_disabled'
  | 'escrow_bill_created'
  | 'escrow_bill_creation_failed'
  | 'escrow_payment_initiated'
  | 'escrow_payment_success'
  | 'escrow_payment_failed'
  | 'escrow_bill_settled'
  | 'escrow_status_viewed'
  | 'gas_estimate_viewed'
  | 'network_switch_prompted'
  | 'network_switch_completed';

interface AnalyticsProperties {
  billId?: string;
  amount?: number;
  participantCount?: number;
  errorMessage?: string;
  gasCostEth?: string;
  networkName?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an analytics event
 * @param event - The event name
 * @param properties - Additional properties for the event
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): void {
  // Only track in production or when explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    console.log('[Analytics]', event, properties);
    return;
  }

  try {
    // Store event in localStorage for basic tracking
    const events = getStoredEvents();
    events.push({
      event,
      properties,
      timestamp: Date.now(),
    });

    // Keep only last 100 events to avoid storage bloat
    const recentEvents = events.slice(-100);
    localStorage.setItem('splitbill_analytics', JSON.stringify(recentEvents));

    // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel)
    // Example:
    // if (window.gtag) {
    //   window.gtag('event', event, properties);
    // }
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.error('Analytics error:', error);
  }
}

/**
 * Get stored analytics events from localStorage
 */
function getStoredEvents(): Array<{
  event: string;
  properties?: AnalyticsProperties;
  timestamp: number;
}> {
  try {
    const stored = localStorage.getItem('splitbill_analytics');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get analytics summary for debugging/admin purposes
 */
export function getAnalyticsSummary(): {
  totalEvents: number;
  eventCounts: Record<string, number>;
  recentEvents: Array<{
    event: string;
    properties?: AnalyticsProperties;
    timestamp: number;
  }>;
} {
  const events = getStoredEvents();
  const eventCounts: Record<string, number> = {};

  events.forEach((e) => {
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
  });

  return {
    totalEvents: events.length,
    eventCounts,
    recentEvents: events.slice(-10),
  };
}

/**
 * Clear all stored analytics events
 */
export function clearAnalytics(): void {
  try {
    localStorage.removeItem('splitbill_analytics');
  } catch (error) {
    console.error('Failed to clear analytics:', error);
  }
}
