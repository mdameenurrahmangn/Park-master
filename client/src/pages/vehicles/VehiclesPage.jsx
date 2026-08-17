import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPlus, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import useVehicles from '../../hooks/useVehicles';
import VehiclesTable from './VehiclesTable';
import VehicleFormModal from './VehicleFormModal';
import { useExpiringVehicles } from '../../hooks/useVehicles';

export default function VehiclesPage() {
  const { vehicles, loading, pagination, params, updateParams, refetch } = useVehicles();
  const { vehicles: expiringVehicles } = useExpiringVehicles(30);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [prefillMember, setPrefillMember] = useState(null);

  const handleAdd = (member = null) => {
    setPrefillMember(member);
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedVehicle(null);
    setPrefillMember(null);
    refetch();
  };

  const expiringCount = expiringVehicles?.length || 0;

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
            <FiTruck className="text-brand-600" /> Vehicles
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage member vehicles and documents.</p>
        </div>
        <button 
          onClick={() => handleAdd()}
          className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" /> Add Vehicle
        </button>
      </motion.div>

      {/* Expiring Documents Alert */}
      {expiringCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3"
        >
          <FiAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {expiringCount} vehicle{expiringCount > 1 ? 's' : ''} with expiring documents
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Insurance or pollution certificates expiring within 30 days
            </p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by vehicle number, company, model..."
              value={params.search}
              onChange={(e) => updateParams({ search: e.target.value })}
              className="input-base pl-10"
            />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <VehiclesTable 
        vehicles={vehicles} 
        loading={loading} 
        pagination={pagination}
        params={params}
        updateParams={updateParams}
        onEdit={handleEdit}
        onAdd={handleAdd}
      />

      {/* Modal */}
      <VehicleFormModal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setSelectedVehicle(null); setPrefillMember(null); }} 
        vehicle={selectedVehicle} 
        prefillMember={prefillMember}
        onSuccess={handleSuccess} 
      />
    </div>
  );
}