import { FiEdit2, FiTrash2, FiUserMinus, FiChevronLeft, FiChevronRight, FiCalendar, FiTruck } from 'react-icons/fi';
import { Skeleton } from '../../components/ui/Loader';
import Button from '../../components/ui/Button';

export default function MembersTable({
  members,
  loading,
  pagination,
  params,
  updateParams,
  onEdit,
  onRemove,
  onDelete,
  onAddVehicle // Ensure this prop is passed from MembersPage
}) {
  const { page, pages, total } = pagination;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Slot</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rent</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {members.length > 0 ? members.map((member) => (
              <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                {/* Member Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex-shrink-0">
                      {member.profilePhoto ? (
                        <img className="w-10 h-10 rounded-full object-cover" src={member.profilePhoto} alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold">
                          {member.ownerName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{member.ownerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-0.5 mt-1">
                        <span className="flex items-center">
                          <FiCalendar className="w-3 h-3 mr-1 text-slate-400" />
                          Joined: {new Date(member.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {member.leavingDate && (
                          <span className="flex items-center text-red-600 dark:text-red-400 font-medium">
                            <FiCalendar className="w-3 h-3 mr-1 text-red-500" />
                            Left: {new Date(member.leavingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">{member.phone}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{member.email || 'No email'}</div>
                </td>

                {/* Slot */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                    {member.assignedSlot?.slotNumber || 'Unassigned'}
                  </span>
                </td>

                {/* Rent */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                  ₹{member.monthlyRent}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'active'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2">

                    {/* 1. Add Vehicle Button (NEW) */}
                    <button
                      onClick={() => onAddVehicle && onAddVehicle(member)}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Add Vehicle"
                    >
                      <FiTruck className="w-4 h-4" />
                    </button>

                    {/* 2. Edit Button */}
                    <button
                      onClick={() => onEdit(member)}
                      className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Edit Member"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>

                    {/* 3. Mark Inactive / Soft Remove Button */}
                    {member.status === 'active' && (
                      <button
                        onClick={() => onRemove(member)}
                        className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Mark as Inactive / Soft Remove"
                      >
                        <FiUserMinus className="w-4 h-4" />
                      </button>
                    )}

                    {/* 4. Delete Member Button */}
                    <button
                      onClick={() => onDelete && onDelete(member)}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Delete Member"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  No members found. Try adjusting your search or filters.
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
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span> results
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
  );
}