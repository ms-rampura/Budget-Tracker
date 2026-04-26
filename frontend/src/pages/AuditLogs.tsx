import { useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';

export default function AuditLogs() {
  const { auditLogs, fetchAuditLogs } = useBudget();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="w-full transition-colors duration-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Audit History</h2>
        <p className="text-slate-500 dark:text-secondary font-body-md">
          A secure ledger of all edits and deletions made to your transactions, powered by Database Triggers.
        </p>
      </div>

      <div className="bg-white dark:bg-surface-container rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
             No audit logs found. Try editing or deleting a transaction!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Record ID</th>
                  <th className="px-6 py-4">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                        log.action === 'DELETE' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-error-container/50 dark:text-error' 
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-primary'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.action === 'DELETE' ? 'bg-rose-500 dark:bg-error' : 'bg-blue-500 dark:bg-primary'}`}></span>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">#{log.record_id}</td>
                    <td className="px-6 py-4 text-sm">
                      {log.action === 'DELETE' ? (
                        <span className="text-slate-400 dark:text-slate-500 line-through">
                          Rs. {Number(log.old_amount).toLocaleString()} ({log.old_type})
                        </span>
                      ) : (
                        <div className="flex flex-col space-y-1">
                          <span className="text-slate-400 dark:text-slate-500 line-through text-[11px]">
                            Rs. {Number(log.old_amount).toLocaleString()} ({log.old_type})
                          </span>
                          <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                            → Rs. {Number(log.new_amount).toLocaleString()} ({log.new_type})
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
