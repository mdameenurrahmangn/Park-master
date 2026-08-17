import { FiCreditCard, FiUserPlus, FiAlertCircle, FiUserX } from 'react-icons/fi';
import { MONTHS } from '../../utils/constants';

export const REPORT_TYPES = {
  collection: {
    key: 'collection',
    label: 'Collection Register',
    shortLabel: 'Collection',
    icon: FiCreditCard,
    description: 'All rent payments received within the period.',
    accent: {
      active: 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      spine: 'bg-green-500',
      iconBox: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
    },
    columns: ['Receipt', 'Member', 'Vehicle', 'Rent Period', 'Method', 'Paid On', 'Amount'],
    buildRows: (data) => (data || []).map(p => [
      p.receiptNumber,
      p.member?.ownerName || p.memberName || 'Former Member',
      p.vehicle?.vehicleNumber || '—',
      `${MONTHS[p.month - 1]} ${p.year}`,
      p.paymentMethod,
      new Date(p.paymentDate).toLocaleDateString('en-IN'),
      `₹${Number(p.amount).toLocaleString('en-IN')}`
    ])
  },
  members: {
    key: 'members',
    label: 'New Members Register',
    shortLabel: 'Members',
    icon: FiUserPlus,
    description: 'Members who joined within the period.',
    accent: {
      active: 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400',
      spine: 'bg-brand-500',
      iconBox: 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400'
    },
    columns: ['Owner Name', 'Phone', 'Joining Date', 'Monthly Rent'],
    buildRows: (data) => (data || []).map(m => [
      m.ownerName,
      m.phone,
      new Date(m.joiningDate).toLocaleDateString('en-IN'),
      `₹${Number(m.monthlyRent).toLocaleString('en-IN')}`
    ])
  },
  pending: {
    key: 'pending',
    label: 'Dues Register',
    shortLabel: 'Dues',
    icon: FiAlertCircle,
    description: 'Active members with outstanding dues.',
    accent: {
      active: 'border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
      spine: 'bg-amber-500',
      iconBox: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
    },
    columns: ['Owner Name', 'Phone', 'Monthly Rent', 'Status'],
    buildRows: (data) => (data || []).map(m => [
      m.ownerName,
      m.phone,
      `₹${Number(m.monthlyRent).toLocaleString('en-IN')}`,
      'Payment pending'
    ])
  },
  removed: {
    key: 'removed',
    label: 'Removed Members Register',
    shortLabel: 'Removed',
    icon: FiUserX,
    description: 'Members who left or were removed within the period.',
    accent: {
      active: 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      spine: 'bg-red-500',
      iconBox: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
    },
    columns: ['Owner Name', 'Phone', 'Vehicle Model', 'Leaving Date', 'Reason', 'Refund (₹)', 'Remarks'],
    buildRows: (data) => (data || []).map(r => [
      r.ownerName || r.member?.ownerName || 'Former Member',
      r.phone || r.member?.phone || '—',
      r.vehicleModel || '—',
      new Date(r.leavingDate).toLocaleDateString('en-IN'),
      r.reason || '—',
      `₹${Number(r.refundAmount || 0).toLocaleString('en-IN')}`,
      r.remarks || '—'
    ])
  }
};

export const PERIOD_PRESETS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'custom', label: 'Custom' },
];

/** Compute ISO date range for a preset. */
export function computeRange(period, custom) {
  const fmt = (d) => d.toISOString().split('T')[0];
  const today = new Date();

  switch (period) {
    case 'daily':
      return { start: fmt(today), end: fmt(today) };
    case 'weekly': {
      const monday = new Date(today);
      const day = monday.getDay();
      const diff = (day === 0 ? -6 : 1) - day; // back to Monday
      monday.setDate(monday.getDate() + diff);
      return { start: fmt(monday), end: fmt(today) };
    }
    case 'monthly':
      return { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end: fmt(today) };
    case 'yearly':
      return { start: fmt(new Date(today.getFullYear(), 0, 1)), end: fmt(today) };
    case 'custom':
      return { start: custom.start, end: custom.end };
    default:
      return { start: '', end: '' };
  }
}

export function formatRangeLabel(range) {
  if (!range.start || !range.end) return '';
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  const s = new Date(range.start).toLocaleDateString('en-IN', opts);
  const e = new Date(range.end).toLocaleDateString('en-IN', opts);
  return s === e ? s : `${s} → ${e}`;
}