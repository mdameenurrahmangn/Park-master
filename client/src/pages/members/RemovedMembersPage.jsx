import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUserX, FiSearch, FiCalendar, FiDollarSign, FiInfo, 
  FiTruck, FiChevronLeft, FiChevronRight, FiGrid, FiFileText 
} from 'react-icons/fi';
import useRemovedMembers from '../../hooks/useRemovedMembers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loader';
import StatCard from '../../components/dashboard/StatCard';

export default function RemovedMembersPage() {
  const { removedMembers, loading, error, pagination, params, updateParams } = useRemovedMembers();
  const { page, pages, total } = pagination;

  // Compute stat card numbers
  const totalRefund = useMemo(() => {
    return removedMembers.reduce((sum, item) => sum + (Number(item.refundAmount) || 0), 0);
  }, [removedMembers]);

  const avgRefund = useMemo(() => {
    if (!removedMembers.length) return 0;
    return Math.round(totalRefund / removedMembers.length);
  }, [removedMembers, totalRefund]);

  // Format date helper: Day/Month/Year (e.g., 07 Aug 2026)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiUserX className="text-red-600 dark:text-red-400" /> Removed Members
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Historical records and departure details of former parking shed members.
          </p>
        </div>
      </motion.div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={FiUserX}
          label="Total Removed Members"
          value={total}
          color="red"
          delay={0.1}
        />
        <StatCard
          icon={FiDollarSign}
          label="Total Refund Amount"
          value={`₹${totalRefund.toLocaleString('en-IN')}`}
          color="amber"
          delay={0.2}
        />
        <StatCard
          icon={FiFileText}
          label="Avg Refund per Member"
          value={`₹${avgRefund.toLocaleString('en-IN')}`}
          color="blue"
          delay={0.3}
        />
      </div>

      {/* Filter & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Search by member name, phone, vehicle number, or reason for leaving..."
            icon={FiSearch}
            value={params.search}
            onChange={(e) => updateParams({ search: e.target.value })}
          />
        </div>
      </motion.div>

      {/* Table / List */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-6 text-center text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Member Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Vehicle Model
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Leaving Date (Day/Month/Year)
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Reason for Leaving
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Refund Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="6" className="px-6 py-4">
                        <Skeleton className="h-10" />
                      </td>
                    </tr>
                  ))
                ) : removedMembers.length > 0 ? (
                  removedMembers.map((record) => {
                    const name = record.ownerName || record.member?.ownerName || 'Former Member';
                    const phone = record.phone || record.member?.phone || 'N/A';
                    const vehicleModelStr = record.vehicleModel || '—';

                    return (
                      <tr
                        key={record._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                      >
                        {/* Member Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold flex items-center justify-center text-sm shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                {name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle Model */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <FiTruck className="w-3.5 h-3.5 text-slate-400" />
                            {vehicleModelStr}
                          </div>
                        </td>

                        {/* Leaving Date (Day/Month/Year) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
                            <FiCalendar className="w-3.5 h-3.5 text-red-500" />
                            {formatDate(record.leavingDate)}
                          </div>
                        </td>

                        {/* Reason for Leaving */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40">
                            {record.reason || 'Not specified'}
                          </span>
                        </td>

                        {/* Refund Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold tabular-nums ${
                            Number(record.refundAmount) > 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            ₹{Number(record.refundAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {record.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      <FiInfo className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      No removed member records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * 10, total)}</span> of{' '}
                <span className="font-medium">{total}</span> removed members
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => updateParams({ page: page - 1 })}
                >
                  <FiChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === pages}
                  onClick={() => updateParams({ page: page + 1 })}
                >
                  Next <FiChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
