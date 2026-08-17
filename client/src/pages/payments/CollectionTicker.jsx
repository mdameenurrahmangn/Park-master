import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import useCountUp from '../../hooks/useCountUp';
import useDashboard from '../../hooks/useDashboard';
import { PAYMENT_METHODS, MONTHS } from '../../utils/constants';
import api from '../../services/api';

export default function CollectionTicker({ onCollectPending, pendingCount }) {
  const { data: dash } = useDashboard();
  const [methodSplit, setMethodSplit] = useState([]);

  const todayTotal = useCountUp(dash?.cards?.todayCollection || 0);
  const monthTotal = useCountUp(dash?.cards?.monthlyCollection || 0);

  // Build this month's payment-method breakdown
  useEffect(() => {
    const fetchSplit = async () => {
      try {
        const now = new Date();
        const { data } = await api.get(`/payments?pageSize=200&month=${now.getMonth() + 1}&year=${now.getFullYear()}&status=Paid`);
        const totals = {};
        data.payments.forEach(p => {
          totals[p.paymentMethod] = (totals[p.paymentMethod] || 0) + p.amount;
        });
        const grand = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
        setMethodSplit(
          PAYMENT_METHODS
            .filter(m => totals[m.value])
            .map(m => ({ ...m, amount: totals[m.value], pct: Math.round((totals[m.value] / grand) * 100) }))
        );
      } catch (err) {
        console.error('Method split failed', err);
      }
    };
    fetchSplit();
  }, []);

  const currentMonth = MONTHS[new Date().getMonth()];

  return (
    <motion.section
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="asphalt-strip rounded-2xl overflow-hidden border border-slate-800 shadow-soft-dark relative"
    >
      <div className="hazard-line w-full" />

      <div className="px-6 sm:px-8 py-7 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Today */}
        <div className="lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-400/90">Today's Collection</p>
          <p className="font-display text-5xl font-bold text-white tabular-nums mt-2 leading-none">
            ₹{todayTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <FiTrendingUp className="w-3.5 h-3.5 text-green-400" />
            Live · updates on every transaction
          </p>
        </div>

        {/* Divider */}
        <div className="hidden lg:block lg:col-span-0 w-px self-stretch bg-white/10" />

        {/* Month */}
        <div className="lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{currentMonth} Collection</p>
          <p className="font-display text-4xl font-bold text-white/90 tabular-nums mt-2 leading-none">
            ₹{monthTotal.toLocaleString('en-IN')}
          </p>

          {/* Method breakdown bar */}
          {methodSplit.length > 0 && (
            <div className="mt-4">
              <div className="flex h-2 rounded-full overflow-hidden bg-white/10">
                {methodSplit.map((m, i) => (
                  <motion.div
                    key={m.value}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    className={i % 2 === 0 ? 'bg-yellow-400' : 'bg-brand-500'}
                    title={`${m.label}: ₹${m.amount}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {methodSplit.map((m, i) => (
                  <span key={m.value} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-yellow-400' : 'bg-brand-500'}`} />
                    {m.label} · {m.pct}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending dues CTA */}
        <div className="lg:col-span-3 lg:ml-auto">
          <div className="rounded-xl border border-dashed border-yellow-400/40 bg-yellow-400/5 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-400">Pending Dues</p>
              <p className="font-display text-3xl font-bold text-white tabular-nums mt-1 leading-none">
                {pendingCount ?? '—'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5">members yet to pay</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCollectPending}
              className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-yellow-400/20"
            >
              Collect
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}