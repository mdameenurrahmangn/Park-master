import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { PAYMENT_METHODS, MONTHS, YEARS, CURRENT_YEAR } from '../../utils/constants';

export default function RecordPaymentModal({ isOpen, onClose, prefillMember, onSuccess }) {
  const [members, setMembers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      member: '',
      vehicle: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
      paymentMethod: 'Cash',
      status: 'Paid'
    }
  });

  const selectedMemberId = watch('member');
  const selectedMethod = watch('paymentMethod');

  // Load active members
  useEffect(() => {
    if (!isOpen) return;
    api.get('/members?status=active&pageSize=200')
      .then(res => {
        const fetchedMembers = res.data.members || [];
        // Make sure prefillMember is present in option list if not already there
        if (prefillMember && !fetchedMembers.some(m => m._id === prefillMember._id)) {
          setMembers([prefillMember, ...fetchedMembers]);
        } else {
          setMembers(fetchedMembers);
        }
      })
      .catch(() => toast.error('Failed to load members'));
  }, [isOpen, prefillMember]);

  // Prefill from Pending Dues panel
  useEffect(() => {
    if (isOpen && prefillMember) {
      setValue('member', prefillMember._id);
      setValue('amount', prefillMember.monthlyRent);
    }
    if (!isOpen) {
      reset({
        member: '',
        vehicle: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: CURRENT_YEAR,
        paymentMethod: 'Cash',
        status: 'Paid'
      });
      setVehicles([]);
    }
  }, [isOpen, prefillMember, reset, setValue]);

  // Re-sync value when members list changes or finishes loading
  useEffect(() => {
    if (isOpen && prefillMember && members.length > 0) {
      setValue('member', prefillMember._id);
      setValue('amount', prefillMember.monthlyRent);
    }
  }, [isOpen, prefillMember, members, setValue]);

  // Auto-fill rent when member changes + load their vehicles
  useEffect(() => {
    if (!selectedMemberId) {
      setVehicles([]);
      return;
    }
    const member = members.find(m => m._id === selectedMemberId);
    if (member && member.monthlyRent) setValue('amount', member.monthlyRent);

    api.get(`/vehicles?memberId=${selectedMemberId}`)
      .then(res => {
        const vehicleList = Array.isArray(res.data) ? res.data : (res.data.vehicles || []);
        setVehicles(vehicleList);
        setValue('vehicle', vehicleList[0]?._id || '');
      })
      .catch(() => {
        setVehicles([]);
        setValue('vehicle', '');
      });
  }, [selectedMemberId, members, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        member: data.member,
        vehicle: data.vehicle || undefined,
        amount: Number(data.amount),
        month: Number(data.month),
        year: Number(data.year),
        paymentMethod: data.paymentMethod,
        status: data.status
      };
      const { data: created } = await api.post('/payments', payload);
      toast.success('Payment recorded successfully');
      onSuccess(created); // parent opens the receipt
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Member *</label>
            <select {...register('member', { required: 'Select a member' })} className="input-base">
              <option value="">Select member...</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.ownerName} · {m.phone}</option>
              ))}
            </select>
            {errors.member && <p className="mt-1 text-xs text-red-600">{errors.member.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vehicle</label>
            <select {...register('vehicle')} className="input-base" disabled={!selectedMemberId}>
              <option value="">No vehicle linked</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.vehicleNumber} · {v.company} {v.model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Month *</label>
            <select {...register('month')} className="input-base">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year *</label>
            <select {...register('year')} className="input-base">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <Input
            label="Amount (₹) *"
            type="number"
            error={errors.amount?.message}
            {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be greater than 0' } })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status *</label>
            <select {...register('status')} className="input-base">
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Payment Method — segmented control */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Method *</label>
          <input type="hidden" {...register('paymentMethod')} />
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(m => {
              const Icon = m.icon;
              const active = selectedMethod === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setValue('paymentMethod', m.value)}
                  className={`
                    flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-xs font-medium transition-all duration-200
                    ${active
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Record Payment</Button>
        </div>
      </form>
    </Modal>
  );
}