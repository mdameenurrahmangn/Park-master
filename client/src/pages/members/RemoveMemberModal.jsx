import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function RemoveMemberModal({ isOpen, onClose, member, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        leavingDate: new Date().toISOString().split('T')[0],
        reason: '',
        refundAmount: '',
        remarks: ''
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    if (!member) return;
    try {
      await api.post(`/members/${member._id}/remove`, data);
      toast.success('Member removed successfully');
      reset();
      onSuccess();
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove Member" size="sm">
      {member && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
          <p className="text-sm text-red-800 dark:text-red-300">
            You are about to remove <span className="font-bold">{member.ownerName}</span>. 
            This will free up their parking slot and mark them as inactive. This action cannot be undone.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Leaving Date (Day/Month/Year) *" 
          type="date" 
          error={errors.leavingDate?.message}
          {...register('leavingDate', { required: 'Leaving date is required' })} 
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for Leaving *</label>
          <textarea 
            {...register('reason', { required: 'Reason is required' })} 
            rows="3" 
            className="input-base"
            placeholder="e.g., Moved to another city, Sold vehicle..."
          ></textarea>
          {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
        </div>
        
        <Input label="Refund Amount (₹)" type="number" {...register('refundAmount')} />
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Remarks</label>
          <textarea {...register('remarks')} rows="2" className="input-base" placeholder="Any additional notes..."></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="danger" loading={isSubmitting}>Confirm Removal</Button>
        </div>
      </form>
    </Modal>
  );
}