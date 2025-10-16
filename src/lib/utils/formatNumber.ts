/**
 * Format ETH amount with smart precision
 * - Shows more decimals for very small amounts
 * - Uses scientific notation for extremely small amounts
 * - Shows reasonable decimals for normal amounts
 */
export function formatEthAmount(amount: number | string, maxDecimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num) || num === 0) {
    return '0';
  }

  // For very small amounts (< 0.000001), use scientific notation
  if (Math.abs(num) < 0.000001) {
    return num.toExponential(2);
  }

  // For small amounts (< 0.001), show more decimals
  if (Math.abs(num) < 0.001) {
    return num.toFixed(8).replace(/\.?0+$/, '');
  }

  // For normal amounts, use standard precision
  return num.toFixed(maxDecimals).replace(/\.?0+$/, '');
}

/**
 * Format gas price in gwei with smart precision
 */
export function formatGwei(gwei: number): string {
  if (gwei === 0) return '0';
  
  // For very small gas prices
  if (gwei < 0.01) {
    return gwei.toFixed(4).replace(/\.?0+$/, '');
  }
  
  // For normal gas prices
  if (gwei < 1) {
    return gwei.toFixed(3).replace(/\.?0+$/, '');
  }
  
  return gwei.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Format USD amount
 */
export function formatUsd(amount: number): string {
  if (amount === 0) return '$0.00';
  
  // For very small amounts
  if (amount < 0.01) {
    return `$${amount.toFixed(4)}`;
  }
  
  return `$${amount.toFixed(2)}`;
}
