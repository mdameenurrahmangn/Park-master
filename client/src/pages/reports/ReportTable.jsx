import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';
import { Skeleton } from '../../components/ui/Loader';

export default function ReportTable({ config, rows, loading, footer }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${config.key}-${rows.length}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b-2 border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-10">#</th>
                  {config.columns.map((col) => (
                    <th key={col} className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={config.columns.length + 1} className="px-5 py-2">
                        <Skeleton className="h-9" />
                      </td>
                    </tr>
                  ))
                ) : rows.length > 0 ? (
                  rows.map((row, rowIndex) => (
                    <motion.tr
                      key={rowIndex}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rowIndex * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400 dark:text-slate-500">
                        {String(rowIndex + 1).padStart(2, '0')}
                    </td>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-5 py-3.5 text-sm whitespace-nowrap ${
                            String(cell).startsWith('₹')
                              ? 'font-display font-bold text-slate-900 dark:text-white tabular-nums'
                              : cellIndex === 0
                                ? 'font-medium text-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="px-5 py-16 text-center">
                      <FiBookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">This register is empty</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No entries found for the selected period.</p>
                    </td>
                  </tr>
                )}
              </tbody>
              {footer && rows.length > 0 && !loading && (
                <tfoot>
                  <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                    <td className="px-5 py-3.5" />
                    {footer.map((cell, i) => (
                      <td key={i} className="px-5 py-3.5 text-sm font-display font-bold tabular-nums whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}