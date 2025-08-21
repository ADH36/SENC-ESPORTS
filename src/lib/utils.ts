import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique 16-digit wallet ID in the format: 1234-5678-9012-3456
 * @returns {string} A formatted wallet ID
 */
export function generateWalletId(): string {
  // Generate 16 random digits
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
  
  // Format as 1234-5678-9012-3456
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
}

/**
 * Validates wallet ID format
 * @param {string} walletId - The wallet ID to validate
 * @returns {boolean} True if valid format
 */
export function isValidWalletId(walletId: string): boolean {
  const walletIdRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
  return walletIdRegex.test(walletId);
}

/**
 * Formats amount for display with currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency}${amount.toFixed(2)}`;
}

/**
 * Formats date for transaction history
 * @param {string | Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatTransactionDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
