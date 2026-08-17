import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function CreateSlotsModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [loading, setLoading] = useState(false);
  
  // Single state
  const [singleSlot, setSingleSlot] = useState({ slotNumber: '', zone: '' });
  
  // Bulk state
  const [bulkConfig, setBulkConfig] = useState({ zone: '', start: 1, end: 10 });

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singleSlot.slotNumber || !singleSlot.zone) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/slots', { slots: [singleSlot] });
      toast.success('Slot created successfully');
      setSingleSlot({ slotNumber: '', zone: '' });
      onSuccess();
    } catch (error) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkConfig.zone || bulkConfig.start >= bulkConfig.end) {
      toast.error('Please check zone and number range');
      return;
    }
    
    const slotsToCreate = [];
    for (let i = bulkConfig.start; i <= bulkConfig.end; i++) {
      slotsToCreate.push({
        slotNumber: `${bulkConfig.zone}${i}`,
        zone: bulkConfig.zone
      });
    }

    setLoading(true);
    try {
      await api.post('/slots', { slots: slotsToCreate });
      toast.success(`${slotsToCreate.length} slots created successfully`);
      onSuccess();
    } catch (error) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Parking Slots" size="md">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'single' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Single Slot
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'bulk' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Bulk Generate
          </button>
        </div>

        {/* Single Form */}
        {mode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Zone (e.g., A)" 
                value={singleSlot.zone} 
                onChange={(e) => setSingleSlot({...singleSlot, zone: e.target.value.toUpperCase()})} 
                maxLength={2}
              />
              <Input 
                label="Slot Number (e.g., 1)" 
                value={singleSlot.slotNumber} 
                onChange={(e) => setSingleSlot({...singleSlot, slotNumber: e.target.value})} 
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Final Slot Name: <span className="font-bold text-slate-900 dark:text-white">{singleSlot.zone}{singleSlot.slotNumber}</span>
            </p>
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>Create Slot</Button>
            </div>
          </form>
        )}

        {/* Bulk Form */}
        {mode === 'bulk' && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <Input 
              label="Zone Letter (e.g., A, B, C)" 
              value={bulkConfig.zone} 
              onChange={(e) => setBulkConfig({...bulkConfig, zone: e.target.value.toUpperCase()})} 
              maxLength={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Start Number" 
                type="number" 
                value={bulkConfig.start} 
                onChange={(e) => setBulkConfig({...bulkConfig, start: parseInt(e.target.value)})} 
              />
              <Input 
                label="End Number" 
                type="number" 
                value={bulkConfig.end} 
                onChange={(e) => setBulkConfig({...bulkConfig, end: parseInt(e.target.value)})} 
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will generate <span className="font-bold text-slate-900 dark:text-white">{bulkConfig.end - bulkConfig.start + 1}</span> slots 
              (e.g., {bulkConfig.zone}{bulkConfig.start} to {bulkConfig.zone}{bulkConfig.end}).
            </p>
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>Generate Slots</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}