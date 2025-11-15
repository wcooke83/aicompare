/**
 * Currency conversion and formatting utilities
 */

export interface Currency {
  symbol: string;
  name: string;
  code: string;
  rate: number;
  position: 'before' | 'after';
  decimalPlaces: number;
}

/**
 * Convert USD amount to target currency
 */
export function convertCurrency(amountUSD: number, targetCurrency: Currency): number {
  return amountUSD * targetCurrency.rate;
}

/**
 * Format currency amount with proper symbol and decimal places
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const roundedAmount = amount.toFixed(currency.decimalPlaces);
  const formattedNumber = parseFloat(roundedAmount).toLocaleString('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  });

  if (currency.position === 'before') {
    return `${currency.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber}${currency.symbol}`;
  }
}

/**
 * Format currency amount with code (e.g., "$1,234.56 USD")
 */
export function formatCurrencyWithCode(amount: number, currency: Currency): string {
  const formatted = formatCurrency(amount, currency);
  return `${formatted} ${currency.code}`;
}

/**
 * Get currency by code
 */
export function getCurrency(code: string, currencies: Record<string, Currency>): Currency {
  return currencies[code] || currencies.USD;
}

/**
 * Format small amounts (e.g., cost per request)
 */
export function formatSmallCurrency(amount: number, currency: Currency): string {
  if (amount < 0.01) {
    // Use exponential notation for very small amounts
    const converted = convertCurrency(amount, currency);
    return `${currency.symbol}${converted.toExponential(2)}`;
  }

  const converted = convertCurrency(amount, currency);
  return formatCurrency(converted, currency);
}
