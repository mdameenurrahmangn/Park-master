import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function DeleteMemberModal({ isOpen, onClose, member, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!member) return;
    setLoading(true);
    try {
      await api.delete(`/members/${member._id}`);
      toast.success('Member deleted permanently');
      onSuccess();
    } catch (error) {
      // Handled by API interceptor or toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Member" size="sm">
      {member && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-800/40 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">Permanent Action Warning</h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold">{member.ownerName}</span>?
                This will remove the member, free their assigned parking slot, and clean up their registered vehicles and payment records.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Phone:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{member.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Assigned Slot:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {member.assignedSlot?.slotNumber || 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
              <span className={`font-semibold capitalize ${member.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {member.status}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={loading} onClick={handleDelete}>
              Delete Permanently
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
