import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiCalendar, FiCreditCard, FiMapPin } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import useParkingSlots from '../../hooks/useParkingSlots';

export default function SlotDetailsModal({ slot, onClose, onSuccess }) {
  const [action, setAction] = useState(null); // 'maintenance', 'transfer', 'free'
  const [loading, setLoading] = useState(false);
  const { slots } = useParkingSlots(); // To get list of members for transfer
  
  const { register, handleSubmit, reset } = useForm();

  const isOccupied = slot.status === 'occupied';
  const member = slot.assignedMember;

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await api.put(`/slots/${slot._id}`, { status: newStatus });
      toast.success(`Slot marked as ${newStatus}`);
      onSuccess();
    } catch (error) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (data) => {
    if (!data.newMemberId) {
      toast.error('Please select a member');
      return;
    }
    setLoading(true);
    try {
      // We update the *member's* assigned slot, which triggers the backend to free the old slot and assign the new one
      await api.put(`/members/${data.newMemberId}`, { assignedSlotId: slot._id });
      toast.success('Slot transferred successfully');
      onSuccess();
    } catch (error) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  // Get active members without a slot for transfer dropdown
  const availableMembers = slots
    .filter(s => s.status === 'available' && s.assignedMember) // Just to get unique members, actually we need a member list. 
    // Simplification: In a real app, we'd fetch /members?status=active&hasSlot=false. 
    // For this UI, we'll just show a text input for Member ID or a mock dropdown.
    // Let's use a simple text input for Member ID to keep dependencies low, or fetch members.
    
  // Let's fetch members for the transfer dropdown
  const [transferMembers, setTransferMembers] = useState([]);
  useState(() => {
    api.get('/members?status=active&pageSize=100').then(res => {
        // Filter out members who already have a slot
        const withoutSlot = res.data.members.filter(m => !m.assignedSlot);
        setTransferMembers(withoutSlot);
    });
  }, []);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Slot ${slot.slotNumber} (Zone ${slot.zone})`} size="md">
      <div className="space-y-6">
        {/* Slot Info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current Status</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{slot.status}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            slot.status === 'available' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
            slot.status === 'occupied' ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' :
            'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
          }`}>
            {slot.status === 'available' ? '✓' : slot.status === 'occupied' ? '🚗' : '⚠'}
          </div>
        </div>

        {/* Occupant Details */}
        {isOccupied && member && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Occupant Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={FiUser} label="Owner Name" value={member.ownerName} />
              <InfoRow icon={FiPhone} label="Phone" value={member.phone} />
              <InfoRow icon={FiCreditCard} label="Monthly Rent" value={`₹${member.monthlyRent}`} />
              <InfoRow icon={FiCalendar} label="Joining Date" value={new Date(member.joiningDate).toLocaleDateString()} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Quick Actions</h4>
          
          {action === 'transfer' ? (
            <form onSubmit={handleSubmit(handleTransfer)} className="space-y-4">
              <select {...register('newMemberId')} className="input-base">
                <option value="">Select Member to Transfer...</option>
                {transferMembers.map(m => (
                  <option key={m._id} value={m._id}>{m.ownerName} ({m.phone})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="submit" loading={loading} size="sm">Confirm Transfer</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setAction(null)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slot.status !== 'maintenance' && (
                <Button variant="secondary" size="sm" onClick={() => handleStatusChange('maintenance')}>
                  Mark Maintenance
                </Button>
              )}
              {slot.status === 'maintenance' && (
                <Button variant="secondary" size="sm" onClick={() => handleStatusChange('available')}>
                  Mark Available
                </Button>
              )}
              {isOccupied && (
                <Button variant="primary" size="sm" onClick={() => setAction('transfer')}>
                  Transfer Slot
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}