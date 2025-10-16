export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export function convertFromUsd(amount: number, currency: SupportedCurrency): number {
  const rate = CURRENCY_RATES[currency];
  return amount * rate;
}

export function getCurrencyRate(currency: SupportedCurrency): number {
  return CURRENCY_RATES[currency];
}
