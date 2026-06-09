import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const statusColor: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  DUE_FOR_INSPECTION: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  UNDER_MAINTENANCE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  OUT_OF_SERVICE: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  SCHEDULED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export const labelize = (v: string) =>
  v.replace(/_/g, ' ').replace(/\bLBS (\d)/, '$1').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
