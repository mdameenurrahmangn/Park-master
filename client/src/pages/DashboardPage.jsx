import { motion } from 'framer-motion';
import { FiUsers, FiTruck, FiGrid, FiCreditCard, FiUserX, FiTrendingUp, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useDashboard from '../hooks/useDashboard';
import { PageLoader, Skeleton } from '../components/ui/Loader';
import Button from '../components/ui/Button';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentActivity from '../components/dashboard/RecentActivity';

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Failed to load dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{error}</p>
      </div>
    );
  }

  const { cards, charts, lists } = data || {};

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => navigate('/members')}>
            <FiPlus className="w-4 h-4 mr-2" /> Add Member
          </Button>
          <Button onClick={() => navigate('/payments')}>
            <FiCreditCard className="w-4 h-4 mr-2" /> Record Payment
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FiGrid} label="Available Slots" value={cards?.availableSlots || 0} color="green" delay={0.1} />
        <StatCard icon={FiTruck} label="Occupied Slots" value={cards?.occupiedSlots || 0} color="brand" delay={0.2} />
        <StatCard icon={FiUsers} label="Total Members" value={cards?.totalMembers || 0} trend={5} color="blue" delay={0.3} />
        <StatCard icon={FiTrendingUp} label="Occupancy Rate" value={`${cards?.occupancyRate || 0}%`} color="amber" delay={0.4} />
        
        <StatCard icon={FiCreditCard} label="Today's Collection" value={cards?.todayCollection || 0} color="green" delay={0.5} />
        <StatCard icon={FiCreditCard} label="Monthly Collection" value={cards?.monthlyCollection || 0} trend={12} color="green" delay={0.6} />
        <StatCard icon={FiAlertCircle} label="Pending Payments" value={cards?.pendingPayments || 0} color="red" delay={0.7} />
        <StatCard icon={FiUserX} label="Removed Members" value={cards?.removedMembers || 0} color="red" delay={0.8} />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <RevenueChart data={charts?.monthlyRevenue} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <RecentActivity members={lists?.latestMembers} payments={lists?.recentPayments} />
      </motion.div>
    </div>
  );
}