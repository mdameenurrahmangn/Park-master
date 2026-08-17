// Replaced FiBanknote with FiDollarSign
// Replaced FiLandmark with FiBriefcase
import { FiDollarSign, FiSmartphone, FiBriefcase, FiFileText } from 'react-icons/fi';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PAYMENT_METHODS = [
  { 
    value: 'Cash', 
    label: 'Cash', 
    icon: FiDollarSign, // Valid Feather Icon
    color: 'text-green-600 dark:text-green-400', 
    chip: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
  },
  { 
    value: 'UPI', 
    label: 'UPI', 
    icon: FiSmartphone, 
    color: 'text-brand-600 dark:text-brand-400', 
    chip: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' 
  },
  { 
    value: 'Bank', 
    label: 'Bank', 
    icon: FiBriefcase, // Valid Feather Icon
    color: 'text-blue-600 dark:text-blue-400', 
    chip: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
  },
  { 
    value: 'Cheque', 
    label: 'Cheque', 
    icon: FiFileText, 
    color: 'text-amber-600 dark:text-amber-400', 
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
  },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];