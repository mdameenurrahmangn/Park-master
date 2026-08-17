import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function ClearAllPaymentsModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    setLoading(true);
    try {
      await api.delete('/payments');
      toast.success('All payment records cleared successfully');
      onSuccess();
    } catch (error) {
      // Handled by API interceptor or toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Clear All Payment Details" size="sm">
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-800/40 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-900 dark:text-red-200">HIGH-RISK ACTION WARNING</h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
              Are you sure you want to <span className="font-bold underline">CLEAR ALL PAYMENT RECORDS</span> for all members?
              This will permanently delete every payment transaction from the database and reset all payment reports. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={loading} onClick={handleClearAll}>
            Clear All Payments
          </Button>
        </div>
      </div>
    </Modal>
  );
}
