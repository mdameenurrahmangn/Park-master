import { FiUser, FiCreditCard, FiCalendar } from 'react-icons/fi';

export default function RecentActivity({ members, payments }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Latest Members */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Latest Members</h3>
          <button className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">View all</button>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {members?.length > 0 ? members.map((member) => (
            <div key={member._id} className="px-6 py-4 flex items-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold">
                {member.ownerName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{member.ownerName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{member.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-900 dark:text-white">Slot {member.assignedSlot?.slotNumber || 'N/A'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  {new Date(member.joiningDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )) : (
            <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No members yet</div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Payments</h3>
          <button className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">View all</button>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {payments?.length > 0 ? payments.map((payment) => (
            <div key={payment._id} className="px-6 py-4 flex items-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400">
                <FiCreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{payment.member?.ownerName || payment.memberName || 'Former Member'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{payment.paymentMethod} • {payment.receiptNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">+₹{payment.amount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )) : (
            <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No payments yet</div>
          )}
        </div>
      </div>
    </div>
  );
}