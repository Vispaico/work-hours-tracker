import { Currency } from '../types';

export const currencyOptions: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
    { value: 'GBP', label: 'GBP', symbol: '£' },
    { value: 'JPY', label: 'JPY', symbol: '¥' },
    { value: 'CNY', label: 'CNY', symbol: '¥' },
    { value: 'KRW', label: 'KRW', symbol: '₩' },
    { value: 'INR', label: 'INR', symbol: '₹' },
    { value: 'RUB', label: 'RUB', symbol: '₽' },
    { value: 'TRY', label: 'TRY', symbol: '₺' },
    { value: 'BRL', label: 'BRL', symbol: 'R$' },
    { value: 'CAD', label: 'CAD', symbol: 'C$' },
    { value: 'AUD', label: 'AUD', symbol: 'A$' },
    { value: 'CHF', label: 'CHF', symbol: 'Fr' },
    { value: 'SEK', label: 'SEK', symbol: 'kr' },
    { value: 'NOK', label: 'NOK', symbol: 'kr' },
    { value: 'DKK', label: 'DKK', symbol: 'kr' },
    { value: 'PLN', label: 'PLN', symbol: 'zł' },
    { value: 'MXN', label: 'MXN', symbol: '$' },
    { value: 'IDR', label: 'IDR', symbol: 'Rp' },
    { value: 'THB', label: 'THB', symbol: '฿' },
    { value: 'VND', label: 'VND', symbol: '₫' },
    { value: 'MYR', label: 'MYR', symbol: 'RM' },
    { value: 'PHP', label: 'PHP', symbol: '₱' },
    { value: 'SGD', label: 'SGD', symbol: 'S$' },
    { value: 'HKD', label: 'HKD', symbol: 'HK$' },
    { value: 'NZD', label: 'NZD', symbol: 'NZ$' },
    { value: 'ZAR', label: 'ZAR', symbol: 'R' },
    { value: 'SAR', label: 'SAR', symbol: '﷼' },
    { value: 'AED', label: 'AED', symbol: 'د.إ' },
    { value: 'ARS', label: 'ARS', symbol: '$' },
    { value: 'CLP', label: 'CLP', symbol: '$' },
    { value: 'COP', label: 'COP', symbol: '$' },
    { value: 'EGP', label: 'EGP', symbol: 'E£' },
    { value: 'ILS', label: 'ILS', symbol: '₪' },
    { value: 'TWD', label: 'TWD', symbol: 'NT$' },
].sort((a, b) => a.label.localeCompare(b.label)) as { value: Currency; label: string; symbol: string }[];

export const currencySymbolMap = currencyOptions.reduce<Record<Currency, string>>((acc, option) => {
    acc[option.value] = option.symbol;
    return acc;
}, {} as Record<Currency, string>);
