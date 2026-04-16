import { CurrencyCode } from './types';

export const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  KZT: '₸',
  RUB: '₽'
};

const localeMap: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  KZT: 'kk-KZ',
  RUB: 'ru-RU'
};

export const formatCurrency = (value: number, currencyCode: CurrencyCode, compact = false) => {
  const formatter = new Intl.NumberFormat(localeMap[currencyCode], {
    style: 'currency',
    currency: currencyCode,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0
  });
  return formatter.format(value);
};

export const formatNumber = (value: number, compact = false) => new Intl.NumberFormat('en-US', {
  notation: compact ? 'compact' : 'standard',
  maximumFractionDigits: compact ? 1 : 0
}).format(value);

export const formatPercent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export const formatMonths = (value: number | null) => value === null ? 'Not reached' : `Month ${value}`;

export const formatMetricValue = (key: string, value: number, currencyCode: CurrencyCode, compact = false) => {
  if (['revenue', 'netProfit', 'cashBalance', 'rent', 'marketing', 'grossProfit'].includes(key)) {
    return formatCurrency(value, currencyCode, compact);
  }
  if (key === 'margin') return formatPercent(value);
  if (key === 'customers' || key === 'traffic') return formatNumber(value, compact);
  return formatNumber(value, compact);
};
