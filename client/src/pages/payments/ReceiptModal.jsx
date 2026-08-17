import { useState, useEffect } from 'react';
import { FiPrinter, FiX, FiDownload } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { MONTHS } from '../../utils/constants';

export default function ReceiptModal({ payment, onClose }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => setSettings({ parkingName: 'ParkMaster Parking' }));
  }, []);

  if (!payment) return null;

  const isPaid = payment.status === 'Paid';

  return (
    <Modal isOpen={!!payment} onClose={onClose} title="Receipt" size="sm">
      {/* Action bar */}
      <div className="no-print flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Receipt <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{payment.receiptNumber}</span>
        </p>
        <Button onClick={() => window.print()} size="sm">
          <FiPrinter className="w-4 h-4 mr-2" /> Print Receipt
        </Button>
      </div>

      {/* ===== The Receipt ===== */}
      <div id="receipt-print-area" className="print-area relative">
        <div className="bg-white text-slate-900 font-mono text-[12px] leading-relaxed px-6 pt-6 pb-2 shadow-inner rounded-t-lg border border-b-0 border-slate-200">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-4">
            <p className="text-base font-bold uppercase tracking-widest">{settings?.parkingName || 'ParkMaster Parking'}</p>
            {settings?.address && <p className="text-[11px] text-slate-600 mt-1">{settings.address}</p>}
            {settings?.phone && <p className="text-[11px] text-slate-600">Ph: {settings.phone}</p>}
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">— Parking Rent Receipt —</p>
          </div>

          {/* Meta */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt No.</span>
              <span className="font-semibold">{payment.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span>{new Date(payment.paymentDate).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Body */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">Received From</span>
              <span className="font-semibold text-right">{payment.member?.ownerName || payment.memberName || 'N/A'}</span>
            </div>
            {(payment.member?.phone || payment.memberPhone) && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Phone</span>
                <span className="text-right">{payment.member?.phone || payment.memberPhone}</span>
              </div>
            )}
            {payment.vehicle && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Vehicle</span>
                <span className="font-semibold text-right">{payment.vehicle.vehicleNumber}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">Rent Period</span>
              <span className="text-right">{MONTHS[payment.month - 1]} {payment.year}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">Mode</span>
              <span className="text-right uppercase">{payment.paymentMethod}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="py-4 flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider">Amount</span>
            <span className="text-xl font-bold">₹{Number(payment.amount).toLocaleString('en-IN')}</span>
          </div>

          {/* PAID Stamp */}
          <div className="relative h-16 flex items-center justify-center">
            <div className={`
              absolute rotate-[-12deg] border-4 px-6 py-1.5 rounded font-bold text-2xl uppercase tracking-[0.3em] opacity-80
              ${isPaid ? 'border-green-600 text-green-600' : 'border-amber-600 text-amber-600'}
            `}>
              {payment.status}
            </div>
          </div>

          {/* Barcode-style footer */}
          <div className="pt-3 pb-4 text-center">
            <div
              className="h-10 mx-auto w-48"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #0f172a 0 2px, transparent 2px 5px, #0f172a 5px 6px, transparent 6px 9px)',
              }}
            />
            <p className="text-[10px] tracking-[0.25em] mt-1.5 text-slate-600">{payment.receiptNumber}</p>
            <p className="text-[10px] text-slate-500 mt-2">Thank you for parking with us!</p>
          </div>
        </div>

        {/* Perforated tear edge */}
        <div className="receipt-zigzag" />
      </div>
    </Modal>
  );
}