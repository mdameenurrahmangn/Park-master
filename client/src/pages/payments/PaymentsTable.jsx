import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPrinter, FiTrash2, FiInbox } from 'react-icons/fi';
import { Skeleton } from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { PAYMENT_METHODS, MONTHS } from '../../utils/constants';

export default function PaymentsTable({ payments, loading, pagination, params, updateParams, onPrintReceipt, onDeletePayment }) {
  const { page, pages, total } = pagination;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark p-6 space-y-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {['Receipt', 'Member', 'Period', 'Amount', 'Method', 'Date', 'Status', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 7 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
            {payments.length > 0 ? payments.map((payment, index) => {
              const method = PAYMENT_METHODS.find(m => m.value === payment.paymentMethod) || PAYMENT_METHODS[0];
              const MethodIcon = method.icon;
              return (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {payment.receiptNumber?.slice(-8)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{payment.member?.ownerName || payment.memberName || 'Former Member'}</p>
                    {payment.vehicle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{payment.vehicle.vehicleNumber}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                    {MONTHS[payment.month - 1]?.slice(0, 3)} {payment.year}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-display font-bold text-slate-900 dark:text-white tabular-nums">₹{payment.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${method.chip}`}>
                      <MethodIcon className="w-3.5 h-3.5" />
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'Paid'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${payment.status === 'Paid' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onPrintReceipt(payment)}
                        className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors opacity-60 group-hover:opacity-100"
                        title="View / Print Receipt"
                      >
                        <FiPrinter className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onDeletePayment && onDeletePayment(payment)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-60 group-hover:opacity-100"
                        title="Delete Payment Record"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            }) : (
              <tr>
                <td colSpan="8" className="px-5 py-16 text-center">
                  <FiInbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No payments match these filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-700 dark:text-slate-200">{page}</span> of {pages} · {total} transactions
          </p>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => updateParams({ page: page - 1 })}>
              <FiChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => updateParams({ page: page + 1 })}>
              Next <FiChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}