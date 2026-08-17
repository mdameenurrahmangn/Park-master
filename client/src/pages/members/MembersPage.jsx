import { useState, useEffect, useCallback } from 'react';  // ← Add useCallback
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiUsers, FiTruck } from 'react-icons/fi';  // ← Add FiTruck
import useMembers from '../../hooks/useMembers';
import Input from '../../components/ui/Input';
import MembersTable from './MembersTable';
import MemberFormModal from './MemberFormModal';
import RemoveMemberModal from './RemoveMemberModal';
import DeleteMemberModal from './DeleteMemberModal';
import VehicleFormModal from '../vehicles/VehicleFormModal';  // ← Add this import

export default function MembersPage() {
  const { members, loading, pagination, params, updateParams, refetch } = useMembers();
  
  // Member states
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedDeleteMember, setSelectedDeleteMember] = useState(null);
  
  // Vehicle states ← ADD THESE
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [prefillMember, setPrefillMember] = useState(null);

  // Handler for adding member
  const handleAddMember = useCallback(() => {
    setSelectedMember(null);
    setPrefillMember(null);
    setIsMemberFormOpen(true);
  }, []);

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsMemberFormOpen(true);
  };

  const handleRemove = (member) => {
    setSelectedMember(member);
    setIsRemoveOpen(true);
  };

  const handleDeleteMember = (member) => {
    setSelectedDeleteMember(member);
    setIsDeleteOpen(true);
  };

  // Handler for adding vehicle ← ADD THIS
  const handleAddVehicle = useCallback((member = null) => {
    setPrefillMember(member);
    setIsVehicleFormOpen(true);
  }, []);

  const handleCloseMemberModal = () => {
    setIsMemberFormOpen(false);
    setSelectedMember(null);
  };

  const handleCloseVehicleModal = () => {
    setIsVehicleFormOpen(false);
    setPrefillMember(null);
  };

  const handleMemberSuccess = () => {
    handleCloseMemberModal();
    refetch();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteOpen(false);
    setSelectedDeleteMember(null);
    refetch();
  };

  const handleVehicleSuccess = () => {
    handleCloseVehicleModal();
    // Optionally refresh members or just navigate to vehicles page
  };

  // Listen for custom event from table ← ADD THIS
  useEffect(() => {
    const handleEvent = (e) => {
      handleAddVehicle(e.detail.member);
    };
    
    window.addEventListener('add-vehicle', handleEvent);
    return () => window.removeEventListener('add-vehicle', handleEvent);
  }, [handleAddVehicle]);

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
            <FiUsers className="text-brand-600" /> Members
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your parking shed members and their details.</p>
        </div>
        <button 
          onClick={handleAddMember}
          className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" /> Add New Member
        </button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Search by name, phone, email, or aadhar..."
            icon={FiSearch}
            value={params.search}
            onChange={(e) => updateParams({ search: e.target.value })}
          />
        </div>
        <select 
          className="input-base sm:w-48"
          value={params.status}
          onChange={(e) => updateParams({ status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </motion.div>

      {/* Table */}
      <MembersTable 
        members={members} 
        loading={loading} 
        pagination={pagination}
        params={params}
        updateParams={updateParams}
        onEdit={handleEditMember}
        onRemove={handleRemove}
        onDelete={handleDeleteMember}
        onAddVehicle={handleAddVehicle}  // ← Pass this prop to table
      />

      {/* Modals */}
      <MemberFormModal 
        isOpen={isMemberFormOpen} 
        onClose={handleCloseMemberModal} 
        member={selectedMember} 
        onSuccess={handleMemberSuccess} 
      />
      
      <RemoveMemberModal 
        isOpen={isRemoveOpen} 
        onClose={() => setIsRemoveOpen(false)} 
        member={selectedMember} 
        onSuccess={handleMemberSuccess} 
      />
      
      <DeleteMemberModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        member={selectedDeleteMember}
        onSuccess={handleDeleteSuccess}
      />

      {/* Add Vehicle Modal ← ADD THIS */}
      <VehicleFormModal 
        isOpen={isVehicleFormOpen} 
        onClose={handleCloseVehicleModal} 
        vehicle={null} 
        prefillMember={prefillMember}
        onSuccess={handleVehicleSuccess} 
      />
    </div>
  );
}