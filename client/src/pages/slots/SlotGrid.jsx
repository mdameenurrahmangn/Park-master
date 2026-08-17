import { motion } from 'framer-motion';
import { FiTruck, FiCheck, FiAlertTriangle } from 'react-icons/fi';

export default function SlotGrid({ groupedSlots, onSlotClick }) {
  const zones = Object.keys(groupedSlots).sort();

  if (zones.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-slate-500 dark:text-slate-400">No parking slots created yet. Click "Add / Generate Slots" to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {zones.map((zone) => (
        <motion.div 
          key={zone}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">
              {zone}
            </span>
            Zone {zone}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {groupedSlots[zone].map((slot, index) => (
              <SlotCard key={slot._id} slot={slot} onClick={() => onSlotClick(slot)} delay={index * 0.05} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SlotCard({ slot, onClick, delay }) {
  const isAvailable = slot.status === 'available';
  const isOccupied = slot.status === 'occupied';
  const isMaintenance = slot.status === 'maintenance';

  const statusStyles = {
    available: 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800/50 dark:bg-green-900/10 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400',
    occupied: 'border-brand-200 bg-brand-50 hover:bg-brand-100 dark:border-brand-800/50 dark:bg-brand-900/10 dark:hover:bg-brand-900/20 text-brand-700 dark:text-brand-400',
    maintenance: 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  };

  const iconStyles = {
    available: 'bg-green-200 dark:bg-green-800/50',
    occupied: 'bg-brand-200 dark:bg-brand-800/50',
    maintenance: 'bg-amber-200 dark:bg-amber-800/50',
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all duration-200
        ${statusStyles[slot.status]}
      `}
    >
      {/* Status Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconStyles[slot.status]}`}>
        {isAvailable && <FiCheck className="w-5 h-5" />}
        {isOccupied && <FiTruck className="w-5 h-5" />}
        {isMaintenance && <FiAlertTriangle className="w-5 h-5" />}
      </div>
      
      {/* Slot Number */}
      <span className="text-lg font-bold">{slot.slotNumber}</span>
      
      {/* Owner Initial if occupied */}
      {isOccupied && slot.assignedMember && (
        <span className="text-xs font-medium opacity-80 truncate w-full text-center">
          {slot.assignedMember.ownerName?.split(' ')[0]}
        </span>
      )}
    </motion.button>
  );
}