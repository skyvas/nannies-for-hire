import { describe, it, expect } from 'vitest';
import { calculateBookingPrice } from './pricing';
import { brandConfig } from '../../../brand.config';

describe('calculateBookingPrice', () => {
  it('calculates price correctly for 1 child and standard duration', () => {
    const breakdown = calculateBookingPrice(25, 3, 1, 4);

    expect(breakdown.numChildren).toBe(1);
    expect(breakdown.hours).toBe(4);
    expect(breakdown.effectiveHourlyRate).toBe(25);
    expect(breakdown.subtotalAmount).toBe(100);
    expect(breakdown.platformFee).toBe(15); // 15% platform fee
    expect(breakdown.totalAmount).toBe(115);
  });

  it('adds extra child surcharge per additional child', () => {
    // 3 children = 1 base + 2 extra ($3 each) = $25 + $6 = $31/hr
    const breakdown = calculateBookingPrice(25, 3, 3, 4);

    expect(breakdown.numChildren).toBe(3);
    expect(breakdown.effectiveHourlyRate).toBe(31);
    expect(breakdown.subtotalAmount).toBe(124);
    expect(breakdown.platformFee).toBe(18.6); // 15% of $124
    expect(breakdown.totalAmount).toBe(142.6);
  });

  it('enforces minimum booking duration of 2 hours', () => {
    const breakdown = calculateBookingPrice(20, 2, 1, 1);

    expect(breakdown.hours).toBe(brandConfig.minBookingDurationHours);
    expect(breakdown.subtotalAmount).toBe(40);
  });

  it('handles minimum child count fallback to 1', () => {
    const breakdown = calculateBookingPrice(20, 2, 0, 3);

    expect(breakdown.numChildren).toBe(1);
    expect(breakdown.effectiveHourlyRate).toBe(20);
  });
});
