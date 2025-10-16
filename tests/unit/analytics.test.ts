import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { trackEvent, getAnalyticsSummary, clearAnalytics } from '@/lib/utils/analytics';

describe('Analytics Utility', () => {
  beforeEach(() => {
    // Clear analytics before each test
    clearAnalytics();
  });

  afterEach(() => {
    // Clean up after each test
    clearAnalytics();
  });

  it('should track events to localStorage', () => {
    trackEvent('escrow_toggle_enabled');
    
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(1);
    expect(summary.eventCounts['escrow_toggle_enabled']).toBe(1);
  });

  it('should track events with properties', () => {
    trackEvent('escrow_payment_success', {
      billId: 'test-123',
      amount: 50.00,
      gasCostEth: '0.000123',
    });
    
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(1);
    expect(summary.recentEvents[0].properties?.billId).toBe('test-123');
    expect(summary.recentEvents[0].properties?.amount).toBe(50.00);
  });

  it('should track multiple events', () => {
    trackEvent('escrow_toggle_enabled');
    trackEvent('escrow_bill_created', { billId: 'bill-1' });
    trackEvent('escrow_payment_initiated', { billId: 'bill-1', amount: 25 });
    
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(3);
    expect(summary.eventCounts['escrow_toggle_enabled']).toBe(1);
    expect(summary.eventCounts['escrow_bill_created']).toBe(1);
    expect(summary.eventCounts['escrow_payment_initiated']).toBe(1);
  });

  it('should count duplicate events correctly', () => {
    trackEvent('escrow_toggle_enabled');
    trackEvent('escrow_toggle_disabled');
    trackEvent('escrow_toggle_enabled');
    
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(3);
    expect(summary.eventCounts['escrow_toggle_enabled']).toBe(2);
    expect(summary.eventCounts['escrow_toggle_disabled']).toBe(1);
  });

  it('should limit stored events to last 100', () => {
    // Track 150 events
    for (let i = 0; i < 150; i++) {
      trackEvent('escrow_toggle_enabled', { iteration: i });
    }
    
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(100); // Should only keep last 100
  });

  it('should return recent events in order', () => {
    trackEvent('escrow_toggle_enabled');
    trackEvent('escrow_bill_created', { billId: 'bill-1' });
    trackEvent('escrow_payment_success', { billId: 'bill-1' });
    
    const summary = getAnalyticsSummary();
    expect(summary.recentEvents).toHaveLength(3);
    expect(summary.recentEvents[0].event).toBe('escrow_toggle_enabled');
    expect(summary.recentEvents[1].event).toBe('escrow_bill_created');
    expect(summary.recentEvents[2].event).toBe('escrow_payment_success');
  });

  it('should clear all analytics', () => {
    trackEvent('escrow_toggle_enabled');
    trackEvent('escrow_bill_created', { billId: 'bill-1' });
    
    let summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(2);
    
    clearAnalytics();
    
    summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(0);
    expect(summary.eventCounts).toEqual({});
  });

  it('should include timestamps with events', () => {
    const beforeTime = Date.now();
    trackEvent('escrow_toggle_enabled');
    const afterTime = Date.now();
    
    const summary = getAnalyticsSummary();
    const event = summary.recentEvents[0];
    
    expect(event.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(event.timestamp).toBeLessThanOrEqual(afterTime);
  });

  it('should handle errors gracefully', () => {
    // This should not throw even if localStorage fails
    expect(() => {
      trackEvent('escrow_toggle_enabled');
    }).not.toThrow();
  });
});
