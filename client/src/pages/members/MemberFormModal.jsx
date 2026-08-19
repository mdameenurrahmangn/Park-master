import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUpload } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import useSlots from '../../hooks/useSlots';

export default function MemberFormModal({ isOpen, onClose, member, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { slots } = useSlots();
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (member) {
      reset({
        ownerName: member.ownerName,
        phone: member.phone,
        altPhone: member.altPhone,
        email: member.email,
        address: member.address,
        joiningDate: new Date(member.joiningDate).toISOString().split('T')[0],
        monthlyRent: member.monthlyRent,
        advanceAmount: member.advanceAmount,
        assignedSlotId: member.assignedSlot?._id || '',
      });
      setPhotoPreview(member.profilePhoto);
    } else {
      reset();
      setPhotoPreview(null);
    }
  }, [member, reset, isOpen]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    const photoFile = document.getElementById('profilePhoto')?.files[0];
    if (photoFile) {
      formData.append('profilePhoto', photoFile);
    }

    try {
      if (member) {
        await api.put(`/members/${member._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Member updated successfully');
      } else {
        await api.post('/members', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Member added successfully');
      }
      onSuccess();
    } catch (error) {
      // Error handled by interceptor
    }
  };

  // Only show available slots, or the currently assigned slot if editing
  const availableSlots = slots.filter(s => s.status === 'available' || (member && s._id === member.assignedSlot?._id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={member ? 'Edit Member' : 'Add New Member'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Owner Name *" {...register('ownerName', { required: 'Name is required' })} error={errors.ownerName?.message} />
          <Input label="Phone Number *" {...register('phone', { required: 'Phone is required' })} error={errors.phone?.message} />
          <Input label="Alternative Phone" {...register('altPhone')} />
          <Input label="Email" type="email" {...register('email')} />
          <div className="md:col-span-2">
            <Input label="Address *" {...register('address', { required: 'Address is required' })} error={errors.address?.message} />
          </div>
          <Input label="Joining Date *" type="date" {...register('joiningDate', { required: 'Joining date is required' })} error={errors.joiningDate?.message} />
          <Input label="Monthly Rent *" type="number" {...register('monthlyRent', { required: 'Rent is required', min: 0 })} error={errors.monthlyRent?.message} />
          <Input label="Advance Amount" type="number" {...register('advanceAmount')} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assigned Slot</label>
            <select {...register('assignedSlotId')} className="input-base">
              <option value="">Unassigned</option>
              {availableSlots.map(slot => (
                <option key={slot._id} value={slot._id}>{slot.slotNumber} (Zone {slot.zone})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Profile Photo</label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiUpload className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <input type="file" id="profilePhoto" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('profilePhoto').click()}>
                Choose File
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{member ? 'Update Member' : 'Add Member'}</Button>
        </div>
      </form>
    </Modal>
  );
}