import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 mb-4">
            <FiShield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ParkMaster</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Commercial Parking Management</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-soft dark:shadow-soft-dark border border-slate-200 dark:border-slate-700">
          {children}
        </div>
      </motion.div>
    </div>
  );
}