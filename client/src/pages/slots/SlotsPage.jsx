import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiPlus, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import useParkingSlots from '../../hooks/useParkingSlots';
import { Skeleton } from '../../components/ui/Loader';
import SlotGrid from './SlotGrid';
import SlotDetailsModal from './SlotDetailsModal';
import CreateSlotsModal from './CreateSlotsModal';

export default function SlotsPage() {
  const { slots, groupedSlots, loading, refetch } = useParkingSlots();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Calculate Stats
  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'available').length,
    occupied: slots.filter(s => s.status === 'occupied').length,
    maintenance: slots.filter(s => s.status === 'maintenance').length,
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  const handleCloseDetails = () => {
    setSelectedSlot(null);
  };

  const handleSuccess = () => {
    handleCloseDetails();
    setIsCreateOpen(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiGrid className="text-brand-600" /> Parking Slots
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visual overview and management of all parking zones.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" /> Add / Generate Slots
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={FiGrid} label="Total Slots" value={stats.total} color="slate" />
        <StatBox icon={FiCheckCircle} label="Available" value={stats.available} color="green" />
        <StatBox icon={FiXCircle} label="Occupied" value={stats.occupied} color="brand" />
        <StatBox icon={FiAlertTriangle} label="Maintenance" value={stats.maintenance} color="amber" />
      </div>

      {/* Visual Grid */}
      <SlotGrid groupedSlots={groupedSlots} onSlotClick={handleSlotClick} />

      {/* Modals */}
      {selectedSlot && (
        <SlotDetailsModal 
          slot={selectedSlot} 
          onClose={handleCloseDetails} 
          onSuccess={handleSuccess} 
        />
      )}
      
      <CreateSlotsModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}

// Helper Stat Box Component
function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    brand: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}