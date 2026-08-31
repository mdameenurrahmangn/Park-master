import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiKey, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Password
  const [userEmail, setUserEmail] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPasswordVal = watch('newPassword');

  const handleClose = () => {
    reset();
    setStep(1);
    setUserEmail('');
    setVerifiedOtp('');
    setShowPassword(false);
    setIsLoading(false);
    onClose();
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: data.email });
      setUserEmail(data.email);
      toast.success(response.data?.message || 'OTP sent to your email!');

      setStep(2);
    } catch (error) {
      // Handled by API interceptor toast
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: userEmail,
        otp: data.otp
      });
      setVerifiedOtp(data.otp);
      toast.success(response.data?.message || 'OTP verified successfully!');
      setStep(3);
    } catch (error) {
      // Handled by API interceptor toast
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password-otp', {
        email: userEmail,
        otp: verifiedOtp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      toast.success(response.data?.message || 'Password reset successfully!');
      handleClose();
    } catch (error) {
      // Handled by API interceptor toast
    } finally {
      setIsLoading(false);
    }
  };

  // Form submit router based on current step
  const onFormSubmit = (data) => {
    if (step === 1) handleRequestOtp(data);
    else if (step === 2) handleVerifyOtp(data);
    else if (step === 3) handleResetPassword(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Admin Password" size="md">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          step === 1 ? 'bg-brand-500 text-white dark:bg-brand-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          <span>1. Email</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">&rarr;</span>
        <div className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          step === 2 ? 'bg-brand-500 text-white dark:bg-brand-600' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          <span>2. Verify OTP</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">&rarr;</span>
        <div className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          step === 3 ? 'bg-brand-500 text-white dark:bg-brand-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          <span>3. New Password</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* STEP 1: Email Address */}
        {step === 1 && (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
              Enter your registered admin email address. We will send a 6-digit OTP code to verify your account.
            </p>
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="admin@parkmaster.com"
              icon={FiMail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
            />
          </div>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <div>
            <div className="bg-brand-50 dark:bg-brand-950/40 p-3.5 rounded-xl border border-brand-200 dark:border-brand-800 text-sm mb-4 flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">
                OTP sent to: <strong>{userEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium underline flex items-center"
              >
                <FiArrowLeft className="mr-1 w-3 h-3" /> Change Email
              </button>
            </div>

            <Input
              label="Enter 6-Digit OTP Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              icon={FiKey}
              error={errors.otp?.message}
              {...register('otp', {
                required: 'OTP code is required',
                minLength: { value: 6, message: 'OTP must be 6 digits' },
                maxLength: { value: 6, message: 'OTP must be 6 digits' }
              })}
            />

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleRequestOtp({ email: userEmail })}
                disabled={isLoading}
                className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium flex items-center space-x-1"
              >
                <FiSend className="w-3 h-3" />
                <span>Resend OTP</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm mb-4 flex items-center text-emerald-700 dark:text-emerald-300">
              <FiCheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>OTP verified for <strong>{userEmail}</strong>. Set your new password below.</span>
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={FiLock}
                error={errors.newPassword?.message}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            <Input
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={FiLock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: value => value === newPasswordVal || 'Passwords do not match'
              })}
            />
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>

          {step === 1 && (
            <Button type="submit" loading={isLoading}>
              Send OTP Code
            </Button>
          )}

          {step === 2 && (
            <Button type="submit" loading={isLoading}>
              Verify OTP Code
            </Button>
          )}

          {step === 3 && (
            <Button type="submit" loading={isLoading}>
              Reset Password
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
