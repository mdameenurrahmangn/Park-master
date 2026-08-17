import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiPhone, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { Skeleton } from '../../components/ui/Loader';
import api from '../../services/api';

export default function PendingDuesPanel({ onCollect, refreshKey }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/payments/pending');
        if (mounted) setPending(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [refreshKey]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 text-amber-500" />
          Pending This Month
        </h3>
        <span className="text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
          {pending.length}
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700/70 max-h-[520px] overflow-y-auto">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : pending.length > 0 ? (
          pending.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-semibold text-sm shrink-0">
                {member.ownerName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{member.ownerName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <FiPhone className="w-3 h-3" /> {member.phone} · ₹{member.monthlyRent}/mo
                </p>
              </div>
              <button
                onClick={() => onCollect(member)}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
              >
                Collect <FiArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="px-5 py-12 text-center">
            <FiCheckCircle className="w-10 h-10 mx-auto text-green-500" />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">All dues collected!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Every active member has paid this month.</p>
          </div>
        )}
      </div>
    </div>
  );
}