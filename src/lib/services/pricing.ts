import { brandConfig } from '../../../brand.config';

export interface PriceBreakdown {
  numChildren: number;
  hours: number;
  baseHourlyRate: number;
  extraChildRate: number;
  effectiveHourlyRate: number;
  subtotalAmount: number;
  platformFee: number;
  platformFeeRate: number;
  totalAmount: number;
}

export function calculateBookingPrice(
  baseHourlyRate: number,
  extraChildRate: number,
  numChildren: number,
  hours: number
): PriceBreakdown {
  const safeNumChildren = Math.max(1, numChildren);
  const safeHours = Math.max(brandConfig.minBookingDurationHours, hours);
  
  // Base rate covers 1 child, each additional child adds extraChildRate per hour
  const extraChildrenCount = safeNumChildren - 1;
  const effectiveHourlyRate = baseHourlyRate + (extraChildrenCount * extraChildRate);
  
  const subtotalAmount = Math.round(effectiveHourlyRate * safeHours * 100) / 100;
  const platformFee = Math.round(subtotalAmount * brandConfig.platformFeeRate * 100) / 100;
  const totalAmount = Math.round((subtotalAmount + platformFee) * 100) / 100;

  return {
    numChildren: safeNumChildren,
    hours: safeHours,
    baseHourlyRate,
    extraChildRate,
    effectiveHourlyRate,
    subtotalAmount,
    platformFee,
    platformFeeRate: brandConfig.platformFeeRate,
    totalAmount,
  };
}
