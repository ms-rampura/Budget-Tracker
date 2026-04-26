import { useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';

export default function AuditLogs() {
  const { auditLogs, fetchAuditLogs } = useBudget();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Audit History</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This is a secure ledger of all edits and deletions made to your transactions, powered by Database Triggers.
      </p>

      {auditLogs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No audit logs found. Try editing or deleting a transaction!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                <th className="py-3 px-4 font-semibold text-sm">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-sm">Action</th>
                <th className="py-3 px-4 font-semibold text-sm">Record ID</th>
                <th className="py-3 px-4 font-semibold text-sm">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-800 dark:text-gray-200">
                  <td className="py-3 px-4">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.action === 'DELETE' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">#{log.record_id}</td>
                  <td className="py-3 px-4">
                    {log.action === 'DELETE' ? (
                      <span className="text-gray-500 line-through">
                        Rs. {Number(log.old_amount).toLocaleString()} ({log.old_type})
                      </span>
                    ) : (
                      <div className="flex flex-col space-y-1">
                        <span className="text-gray-500 line-through text-xs">
                          Rs. {Number(log.old_amount).toLocaleString()} ({log.old_type})
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
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
  );
}
