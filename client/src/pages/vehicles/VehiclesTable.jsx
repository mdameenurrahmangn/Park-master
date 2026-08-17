import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiCalendar, FiFileText, FiImage, FiTruck } from 'react-icons/fi';
import { Skeleton } from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function VehiclesTable({ vehicles, loading, pagination, params, updateParams, onEdit, onAdd }) {
  const { page, pages, total } = pagination;
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;

    setDeletingId(vehicleId);
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      toast.success('Vehicle removed');
      // Trigger parent refetch via a custom event or callback
      window.dispatchEvent(new CustomEvent('vehicles-updated'));
    } catch (error) {
      // Handled by interceptor
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const expiry = new Date(dateString);
    const today = new Date();
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft >= 0;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark p-6 space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Insurance</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documents</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {vehicles.length > 0 ? vehicles.map((vehicle) => (
              <tr key={vehicle._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-12 h-8 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center overflow-hidden">
                      {vehicle.vehiclePhoto ? (
                        <img
                          src={vehicle.vehiclePhoto}
                          alt={vehicle.vehicleNumber}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <FiTruck className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {vehicle.vehicleNumber || vehicle.registrationNumber || `${vehicle.company} ${vehicle.model}`}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {vehicle.company} {vehicle.model}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {vehicle.member?.ownerName || 'Unassigned'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {vehicle.member?.phone || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    {vehicle.vehicleType} • {vehicle.fuelType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${isExpiringSoon(vehicle.insuranceExpiry)
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-900 dark:text-white'
                    }`}>
                    {formatDate(vehicle.insuranceExpiry)}
                  </div>
                  {isExpiringSoon(vehicle.insuranceExpiry) && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Expiring soon!
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {vehicle.vehiclePhoto && (
                      <a
                        href={vehicle.vehiclePhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="View Vehicle Photo"
                      >
                        <FiImage className="w-4 h-4" />
                      </a>
                    )}
                    {vehicle.rcUpload && (
                      <a
                        href={vehicle.rcUpload}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="View RC Document"
                      >
                        <FiFileText className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(vehicle)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit Vehicle"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      disabled={deletingId === vehicle._id}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                      title="Delete Vehicle"
                    >
                      {deletingId === vehicle._id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  No vehicles found. {params.search ? 'Try adjusting your search.' : 'Click "Add Vehicle" to get started.'}
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
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span> vehicles
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