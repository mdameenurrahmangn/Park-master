import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiPrinter, FiDownload, FiFileText, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useReports from '../../hooks/useReports';
import useCountUp from '../../hooks/useCountUp';
import { REPORT_TYPES, PERIOD_PRESETS, formatRangeLabel } from './reportConfig';
import ReportTable from './ReportTable';
import { exportToCSV, exportToPDF, printReport } from '../../utils/exporters';
import api from '../../services/api';

export default function ReportsPage() {
  const {
    reportType, setReportType,
    period, setPeriod,
    customRange, setCustomRange,
    range, data, loading, error, refetch
  } = useReports();

  const [settings, setSettings] = useState(null);
  const config = REPORT_TYPES[reportType];
  const rows = useMemo(() => config.buildRows(data?.data), [config, data]);

  useEffect(() => {
    api.get('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  // ===== Summary figures per report type =====
  const summary = useMemo(() => {
    if (!data) return { headline: 0, headlineLabel: '', stats: [] };

    if (reportType === 'collection') {
      const avg = data.totalTransactions ? Math.round(data.totalAmount / data.totalTransactions) : 0;
      return {
        headline: data.totalAmount,
        headlineLabel: 'Total Collected',
        isCurrency: true,
        stats: [
          { label: 'Transactions', value: data.totalTransactions },
          { label: 'Avg. Receipt', value: `₹${avg.toLocaleString('en-IN')}` }
        ]
      };
    }
    if (reportType === 'members') {
      const totalRent = (data.data || []).reduce((s, m) => s + (m.monthlyRent || 0), 0);
      return {
        headline: data.totalNewMembers || (data.data || []).length,
        headlineLabel: 'New Members Joined',
        stats: [
          { label: 'Added Monthly Revenue', value: `₹${totalRent.toLocaleString('en-IN')}` },
          { label: 'Period', value: formatRangeLabel(range) }
        ]
      };
    }
    if (reportType === 'removed') {
      return {
        headline: data.totalRemoved !== undefined ? data.totalRemoved : (data.data || []).length,
        headlineLabel: 'Members Removed',
        stats: [
          { label: 'Total Refund', value: `₹${(data.totalRefund || 0).toLocaleString('en-IN')}` },
          { label: 'Period', value: formatRangeLabel(range) }
        ]
      };
    }
    const potentialDues = (data.data || []).reduce((s, m) => s + (m.monthlyRent || 0), 0);
    return {
      headline: (data.data || []).length,
      headlineLabel: 'Members With Dues',
      stats: [
        { label: 'Potential Collection', value: `₹${potentialDues.toLocaleString('en-IN')}` },
        { label: 'Status', value: 'Action required' }
      ]
    };
  }, [data, reportType, range]);

  const animatedHeadline = useCountUp(typeof summary.headline === 'number' ? summary.headline : 0);

  // ===== Export handlers =====
  const handleExportCSV = () => {
    if (!rows.length) return toast.error('Nothing to export');
    exportToCSV({ columns: config.columns, rows, filename: `${config.shortLabel}-register` });
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    if (!rows.length) return toast.error('Nothing to export');
    exportToPDF({
      title: config.label,
      subtitle: formatRangeLabel(range),
      columns: config.columns,
      rows,
      summary: [
        { label: summary.headlineLabel, value: summary.isCurrency ? `Rs. ${summary.headline.toLocaleString('en-IN')}` : summary.headline },
        ...summary.stats.map(s => ({ label: s.label, value: s.value }))
      ],
      businessName: settings?.parkingName || 'ParkMaster Parking'
    });
    toast.success('PDF generated');
  };

  const footer = reportType === 'collection' && rows.length
    ? ['', '', '', '', '', 'TOTAL', `₹${(data?.totalAmount || 0).toLocaleString('en-IN')}`]
    : null;

  return (
    <div className="space-y-6">
      {/* ===== The Register Desk ===== */}
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden"
      >
        {/* Ledger-ruled header band */}
        <div
          className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-200 dark:border-slate-700"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(100,116,139,0.09) 27px, rgba(100,116,139,0.09) 28px)'
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Reports & Registers</p>
              <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1.5">{config.label}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{config.description}</p>
            </div>

            {/* Period presets */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5" /> Reporting Period
              </p>
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg w-fit">
                {PERIOD_PRESETS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`
                      px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
                      ${period === p.key
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm scale-105'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {period === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 mt-3"
                >
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    className="input-base !w-40 !py-1.5 !text-xs"
                  />
                  <span className="text-slate-400 text-xs font-bold">TO</span>
                  <input
                    type="date"
                    value={customRange.end}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    className="input-base !w-40 !py-1.5 !text-xs"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Report type file-tabs */}
        <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row gap-3">
          {Object.values(REPORT_TYPES).map(rt => {
            const Icon = rt.icon;
            const active = reportType === rt.key;
            return (
              <motion.button
                key={rt.key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setReportType(rt.key)}
                className={`
                  relative flex items-center gap-3 px-5 py-3.5 rounded-lg border-2 text-left transition-all duration-200 flex-1 overflow-hidden
                  ${active
                    ? rt.accent.active
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}
                `}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${rt.accent.spine} ${active ? 'opacity-100' : 'opacity-30'}`} />
                <span className={`p-2.5 rounded-lg ${rt.accent.iconBox}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{rt.shortLabel}</span>
                  <span className="block text-[11px] opacity-70 mt-0.5 hidden sm:block">{rt.description}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ===== Summary + Export toolbar ===== */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 dark:bg-slate-950 rounded-2xl px-6 sm:px-8 py-6 flex flex-col lg:flex-row lg:items-center gap-6 relative overflow-hidden"
      >
        {/* ambient glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-8 lg:gap-12 relative">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">{summary.headlineLabel}</p>
            <p className="font-display text-5xl font-bold text-white tabular-nums mt-1 leading-none">
              {summary.isCurrency ? `₹${animatedHeadline.toLocaleString('en-IN')}` : animatedHeadline}
            </p>
          </div>
          <div className="hidden sm:block w-px self-stretch bg-white/10" />
          <div className="hidden sm:flex gap-10 relative">
            {summary.stats.map(s => (
              <div key={s.label}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
                <p className="font-display text-lg font-bold text-slate-200 mt-1 tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export toolbar */}
        <div className="lg:ml-auto flex items-center gap-2 relative">
          <span className="text-[11px] font-mono text-slate-500 mr-2 hidden md:block">{formatRangeLabel(range)}</span>
          <button
            onClick={refetch}
            className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ExportButton icon={FiPrinter} label="Print" onClick={printReport} />
          <ExportButton icon={FiDownload} label="Excel" onClick={handleExportCSV} />
          <ExportButton icon={FiFileText} label="PDF" onClick={handleExportPDF} primary />
        </div>
      </motion.section>

      {/* ===== The Register ===== */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div id="report-print-area" className="print-area">
          {/* Print-only letterhead */}
          <div className="hidden print:block mb-4">
            <h2 className="text-xl font-bold">{settings?.parkingName || 'ParkMaster Parking'} — {config.label}</h2>
            <p className="text-xs text-slate-500">Period: {formatRangeLabel(range)} · Generated {new Date().toLocaleString('en-IN')}</p>
          </div>
          <ReportTable config={config} rows={rows} loading={loading} footer={footer} />
        </div>
      )}
    </div>
  );
}

function ExportButton({ icon: Icon, label, onClick, primary = false }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors
        ${primary
          ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 shadow-lg shadow-yellow-400/20'
          : 'bg-white/10 text-white hover:bg-white/20'}
      `}
    >
      <Icon className="w-4 h-4" /> {label}
    </motion.button>
  );
}