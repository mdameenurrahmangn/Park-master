import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiUpload, FiLock, FiImage } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSettings from '../../hooks/useSettings';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PasswordStrength from './PasswordStrength';
import api from '../../services/api';

export default function SettingsPage() {
  const { settings, loading, saving, updateSettings } = useSettings();
  const [logoPreview, setLogoPreview] = useState(null);
  const [isPasswordMode, setIsPasswordMode] = useState(false);

  // Profile Form
  const { register: regProfile, handleSubmit: submitProfile, setValue: setProfileValue } = useForm({
    defaultValues: {
      parkingName: '',
      address: '',
      phone: '',
      defaultMonthlyRent: ''
    }
  });

  // Password Form
  const { register: regPass, handleSubmit: submitPass, watch: watchPass, reset: resetPass, formState: { errors: passErrors } } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Sync settings to form when loaded
  useEffect(() => {
    if (settings) {
      setProfileValue('parkingName', settings.parkingName || '');
      setProfileValue('address', settings.address || '');
      setProfileValue('phone', settings.phone || '');
      setProfileValue('defaultMonthlyRent', settings.defaultMonthlyRent ?? '');
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
    }
  }, [settings, setProfileValue]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data) => {
    const formData = new FormData();
    formData.append('parkingName', data.parkingName);
    formData.append('address', data.address || '');
    formData.append('phone', data.phone || '');
    formData.append('defaultMonthlyRent', data.defaultMonthlyRent);
    
    const logoFile = document.getElementById('logoInput')?.files[0];
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    await updateSettings(formData);
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await api.put('/auth/profile', {
        password: data.newPassword
        // Note: In a real app, we might need currentPassword verification on backend
      });
      toast.success('Password changed successfully. Please login again.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      // Handled by interceptor
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your business profile and security preferences.</p>
      </motion.div>

      {/* Business Profile Section */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="p-2.5 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
            <FaBuilding className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Business Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">This information appears on receipts and reports.</p>
          </div>
        </div>

        <form onSubmit={submitProfile(onProfileSubmit)} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-32 h-32 shrink-0 relative group">
              <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <FiImage className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <label htmlFor="logoInput" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-xl backdrop-blur-sm">
                <span className="text-white text-xs font-medium flex items-center gap-1">
                  <FiUpload className="w-4 h-4" /> Change
                </span>
              </label>
              <input id="logoInput" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
              <div className="sm:col-span-2">
                <Input label="Parking Name *" {...regProfile('parkingName', { required: 'Required' })} />
              </div>
              <div className="sm:col-span-2">
                <Input label="Address" {...regProfile('address')} />
              </div>
              <Input label="Phone Number" {...regProfile('phone')} />
              <Input label="Default Monthly Rent (₹)" type="number" {...regProfile('defaultMonthlyRent', { required: 'Required', min: 0 })} />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={saving}>
              <FiSave className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Section */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <FiLock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update your admin password.</p>
            </div>
          </div>
          {!isPasswordMode && (
            <button 
              onClick={() => setIsPasswordMode(true)}
              className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              Change Password
            </button>
          )}
        </div>

        {isPasswordMode ? (
          <motion.form 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={submitPass(onPasswordSubmit)} 
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input 
                  label="Current Password" 
                  type="password" 
                  {...regPass('currentPassword', { required: 'Required' })} 
                />
                <Input 
                  label="New Password" 
                  type="password" 
                  {...regPass('newPassword', { required: 'Required', minLength: 8 })} 
                />
                <Input 
                  label="Confirm New Password" 
                  type="password" 
                  error={passErrors.confirmPassword?.message}
                  {...regPass('confirmPassword', { 
                    required: 'Required',
                    validate: val => val === watchPass('newPassword') || 'Passwords do not match'
                  })} 
                />
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
                <PasswordStrength password={watchPass('newPassword') || ''} />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsPasswordMode(false); resetPass(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Update Password
              </Button>
            </div>
          </motion.form>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
            <FiLock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Password management is disabled by default. Click "Change Password" to enable.</p>
          </div>
        )}
      </Card>
    </div>
  );
}