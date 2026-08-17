import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUpload, FiTruck, FiCalendar, FiFileText } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const VEHICLE_TYPES = ['Car', 'SUV', 'Sedan', 'Hatchback', 'Two-Wheeler', 'Auto', 'Other'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'EV', 'Hybrid', 'CNG', 'LPG'];

export default function VehicleFormModal({
  isOpen,
  onClose,
  vehicle,
  prefillMember,  // ← Add this prop
  onSuccess
}) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm();

  const [members, setMembers] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [rcPreview, setRcPreview] = useState(null);

  // Load active members for dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/members?status=active&pageSize=200')
        .then(res => {
          const list = res.data.members || [];
          const activeMember = prefillMember || vehicle?.member;
          if (activeMember && activeMember._id && !list.some(m => m._id === activeMember._id)) {
            setMembers([activeMember, ...list]);
          } else {
            setMembers(list);
          }
        })
        .catch(() => toast.error('Failed to load members'));
    }
  }, [isOpen, prefillMember, vehicle]);

  // Prefill form when editing or adding with member context
  useEffect(() => {
    if (vehicle) {
      // Edit mode
      reset({
        member: vehicle.member?._id || '',
        vehicleNumber: vehicle.vehicleNumber || '',
        company: vehicle.company || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        vehicleType: vehicle.vehicleType || 'Car',
        fuelType: vehicle.fuelType || 'Petrol',
        registrationNumber: vehicle.registrationNumber || '',
        insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0] || '',
        pollutionExpiry: vehicle.pollutionExpiry?.split('T')[0] || '',
      });
      setPhotoPreview(vehicle.vehiclePhoto || null);
      setRcPreview(vehicle.rcUpload || null);
    } else if (prefillMember) {
      // Add mode with preselected member
      reset({
        member: prefillMember._id,
        vehicleNumber: '',
        company: '',
        model: '',
        color: '',
        vehicleType: 'Car',
        fuelType: 'Petrol',
        registrationNumber: '',
        insuranceExpiry: '',
        pollutionExpiry: '',
      });
      setPhotoPreview(null);
      setRcPreview(null);
    } else {
      // Add mode without preselection
      reset({
        member: '',
        vehicleNumber: '',
        company: '',
        model: '',
        color: '',
        vehicleType: 'Car',
        fuelType: 'Petrol',
        registrationNumber: '',
        insuranceExpiry: '',
        pollutionExpiry: '',
      });
      setPhotoPreview(null);
      setRcPreview(null);
    }
  }, [vehicle, prefillMember, reset, isOpen]);

  // Re-sync member selection once members dropdown data arrives
  useEffect(() => {
    if (isOpen && members.length > 0) {
      const targetMemberId = prefillMember?._id || vehicle?.member?._id;
      if (targetMemberId) {
        setValue('member', targetMemberId);
      }
    }
  }, [isOpen, members, prefillMember, vehicle, setValue]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRcChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setRcPreview('/pdf-placeholder.png');
      } else {
        setRcPreview(URL.createObjectURL(file));
      }
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Ensure member ID is ALWAYS appended even if prefilled
    const targetMemberId = data.member || prefillMember?._id || vehicle?.member?._id;
    if (!targetMemberId) {
      toast.error('Please select a member');
      return;
    }
    formData.append('member', targetMemberId);

    // Append all other text fields
    Object.keys(data).forEach(key => {
      if (key !== 'member' && data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    // Append files if selected
    const photoFile = document.getElementById('vehiclePhoto')?.files[0];
    const rcFile = document.getElementById('rcUpload')?.files[0];

    if (photoFile) formData.append('vehiclePhoto', photoFile);
    if (rcFile) formData.append('rcUpload', rcFile);

    try {
      if (vehicle) {
        // Update existing vehicle
        await api.put(`/vehicles/${vehicle._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Vehicle updated successfully');
      } else {
        // Create new vehicle
        await api.post('/vehicles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Vehicle added successfully');
      }
      onSuccess();
    } catch (error) {
      // Error handled by API interceptor
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vehicle ? 'Edit Vehicle' : 'Add New Vehicle'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Member Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Owner Member *
          </label>
          <select
            {...register('member', { required: 'Please select a member' })}
            className="input-base"
          >
            <option value="">Select member...</option>
            {members.map(m => (
              <option key={m._id} value={m._id}>
                {m.ownerName} ({m.phone})
              </option>
            ))}
          </select>
          {errors.member && (
            <p className="mt-1 text-xs text-red-600">{errors.member.message}</p>
          )}
          {prefillMember && (
            <p className="mt-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
              Pre-selected member: {prefillMember.ownerName}
            </p>
          )}
        </div>

        {/* Vehicle Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Input
            label="Company *"
            placeholder="e.g., Maruti Suzuki"
            {...register('company', { required: 'Company is required' })}
            error={errors.company?.message}
          />

          <Input
            label="Model *"
            placeholder="e.g., Swift Dzire"
            {...register('model', { required: 'Model is required' })}
            error={errors.model?.message}
          />

          <Input
            label="Color *"
            placeholder="e.g., White"
            {...register('color', { required: 'Color is required' })}
            error={errors.color?.message}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vehicle Type *
            </label>
            <select
              {...register('vehicleType', { required: 'Vehicle type is required' })}
              className="input-base"
            >
              {VEHICLE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Fuel Type *
            </label>
            <select
              {...register('fuelType', { required: 'Fuel type is required' })}
              className="input-base"
            >
              {FUEL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <Input
            label="Registration Number"
            placeholder="e.g., KA0120230012345"
            {...register('registrationNumber')}
          />

          <Input
            label="Insurance Expiry"
            type="date"
            {...register('insuranceExpiry')}
          />

          <Input
            label="Pollution Expiry"
            type="date"
            {...register('pollutionExpiry')}
          />
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          {/* Vehicle Photo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Vehicle Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiTruck className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="vehiclePhoto"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('vehiclePhoto').click()}
                >
                  <FiUpload className="w-4 h-4 mr-1.5" /> Upload Photo
                </Button>
                <p className="text-[10px] text-slate-400 mt-1">JPG, PNG (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* RC Document */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              RC / Registration Document
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                {rcPreview ? (
                  rcPreview.includes('pdf') ? (
                    <FiFileText className="w-6 h-6 text-slate-400" />
                  ) : (
                    <img src={rcPreview} alt="RC Preview" className="w-full h-full object-cover" />
                  )
                ) : (
                  <FiFileText className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="rcUpload"
                  accept="image/*,application/pdf"
                  onChange={handleRcChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('rcUpload').click()}
                >
                  <FiUpload className="w-4 h-4 mr-1.5" /> Upload RC
                </Button>
                <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>
            {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}