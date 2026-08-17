import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiPlus, FiFilter, FiTrash2 } from 'react-icons/fi';
import usePayments from '../../hooks/usePayments';
import PaymentsTable from './PaymentsTable';
import RecordPaymentModal from './RecordPaymentModal';
import ReceiptModal from './ReceiptModal';
import DeletePaymentModal from './DeletePaymentModal';
import ClearAllPaymentsModal from './ClearAllPaymentsModal';
import PendingDuesPanel from './PendingDuesPanel';
import CollectionTicker from './CollectionTicker';
import Button from '../../components/ui/Button';
import { MONTHS, YEARS } from '../../utils/constants';

export default function PaymentsPage() {
  const { payments, loading, pagination, params, updateParams, refetch } = usePayments();
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [prefillMember, setPrefillMember] = useState(null);
  const [duesRefreshKey, setDuesRefreshKey] = useState(0);

  // Deletion modal states
  const [selectedDeletePayment, setSelectedDeletePayment] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  const openRecord = (member = null) => {
    setPrefillMember(member);
    setIsRecordOpen(true);
  };

  const handlePaymentCreated = (createdPayment) => {
    setIsRecordOpen(false);
    setPrefillMember(null);
    refetch();
    setDuesRefreshKey(k => k + 1);
    setReceiptPayment(createdPayment);
  };

  const handleDeleteSingle = (payment) => {
    setSelectedDeletePayment(payment);
    setIsDeleteOpen(true);
  };

  const handleDeletionSuccess = () => {
    setIsDeleteOpen(false);
    setSelectedDeletePayment(null);
    refetch();
    setDuesRefreshKey(k => k + 1);
  };

  const handleClearAllSuccess = () => {
    setIsClearAllOpen(false);
    refetch();
    setDuesRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiCreditCard className="text-brand-600" /> Payments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Record rent, track dues, clear records, and print receipts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="danger"
            onClick={() => setIsClearAllOpen(true)}
            disabled={payments.length === 0}
            className="text-xs font-semibold"
          >
            <FiTrash2 className="w-4 h-4 mr-1.5" /> Clear All Payments
          </Button>
          <button
            onClick={() => openRecord()}
            className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg shadow-sm shadow-brand-600/20 hover:bg-brand-700 transition-colors"
          >
            <FiPlus className="w-4 h-4 mr-2" /> Record Payment
          </button>
        </div>
      </motion.div>

      {/* Collection Ticker */}
      <CollectionTicker
        onCollectPending={() => openRecord()}
        pendingCount={undefined}
      />

      {/* Main grid: table + dues panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark flex flex-wrap items-center gap-3"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              <FiFilter className="w-3.5 h-3.5" /> Filter
            </span>
            <select className="input-base !w-36 !py-2" value={params.month} onChange={(e) => updateParams({ month: e.target.value })}>
              <option value="">All Months</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className="input-base !w-28 !py-2" value={params.year} onChange={(e) => updateParams({ year: e.target.value })}>
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="input-base !w-32 !py-2" value={params.status} onChange={(e) => updateParams({ status: e.target.value })}>
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </motion.div>

          <PaymentsTable
            payments={payments}
            loading={loading}
            pagination={pagination}
            params={params}
            updateParams={updateParams}
            onPrintReceipt={setReceiptPayment}
            onDeletePayment={handleDeleteSingle}
          />
        </div>

        {/* Pending dues column */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PendingDuesPanel onCollect={openRecord} refreshKey={duesRefreshKey} />
        </motion.div>
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isRecordOpen}
        onClose={() => { setIsRecordOpen(false); setPrefillMember(null); }}
        prefillMember={prefillMember}
        onSuccess={handlePaymentCreated}
      />
      <ReceiptModal payment={receiptPayment} onClose={() => setReceiptPayment(null)} />
      
      <DeletePaymentModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedDeletePayment(null); }}
        payment={selectedDeletePayment}
        onSuccess={handleDeletionSuccess}
      />

      <ClearAllPaymentsModal
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onSuccess={handleClearAllSuccess}
      />
    </div>
  );
}