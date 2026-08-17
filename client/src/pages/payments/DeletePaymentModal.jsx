import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { MONTHS } from '../../utils/constants';

export default function DeletePaymentModal({ isOpen, onClose, payment, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      await api.delete(`/payments/${payment._id}`);
      toast.success('Payment record deleted successfully');
      onSuccess();
    } catch (error) {
      // Handled by API interceptor or toast
    } finally {
      setLoading(false);
    }
  };

  const memberName = payment?.member?.ownerName || payment?.memberName || 'Former Member';
  const periodStr = payment ? `${MONTHS[payment.month - 1]} ${payment.year}` : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Payment Record" size="sm">
      {payment && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-800/40 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">Confirm Record Deletion</h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                Are you sure you want to delete this payment record? This will permanently remove it from the payment ledger and reports.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Receipt No:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{payment.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Member:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Period:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{periodStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Amount:</span>
              <span className="font-bold text-red-600 dark:text-red-400">₹{Number(payment.amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={loading} onClick={handleDelete}>
              Delete Record
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
