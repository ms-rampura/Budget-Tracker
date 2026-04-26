import { useEffect, useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import type { Record } from '../context/BudgetContext';
import CategoryDropdownMenu from '../components/CategoryDropdownMenu';

export default function AllRecords() {
  const { allRecords, fetchAllRecords, updateRecord, deleteRecord } = useBudget();
  const [editTarget, setEditTarget] = useState<Record | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType,   setEditType]   = useState<'income' | 'expense'>('income');
  const [editCatId,  setEditCatId]  = useState<number | ''>('');

  useEffect(() => { fetchAllRecords(); }, []);

  function openEdit(record: Record) {
    setEditTarget(record);
    setEditAmount(String(record.amount));
    setEditType(record.type);
    setEditCatId(record.category_id || '');
  }

  async function handleUpdate() {
    if (!editTarget || !editCatId) return;
    await updateRecord(editTarget.id, Number(editAmount), editType, Number(editCatId));
    setEditTarget(null);
  }

  return (
    <div className="w-full transition-colors duration-200">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">All Transactions</h2>
          <p className="text-slate-500 dark:text-secondary font-body-md">
            View and manage your entire financial history.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-container rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        {allRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
             No records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-200">
                {allRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                        record.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-error-container/50 dark:text-error'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${record.type === 'income' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-error'}`}></span>
                        {record.type === 'income' ? 'Received' : 'Spent'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">#{record.account_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{record.category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(record.time).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-bold ${record.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                        {record.type === 'income' ? '+' : '-'}Rs. {record.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(record)} className="text-blue-600 hover:text-blue-700 dark:text-primary dark:hover:text-blue-400 text-sm font-medium">Edit</button>
                        <button onClick={() => deleteRecord(record.id)} className="text-rose-600 hover:text-rose-700 dark:text-error dark:hover:text-red-400 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-container rounded-2xl p-6 w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-xl transition-colors duration-200">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Edit Transaction</h3>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Amount</label>
                 <input
                   type="number"
                   value={editAmount}
                   onChange={e => setEditAmount(e.target.value)}
                   className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-xl p-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-colors"
                   placeholder="Amount"
                 />
               </div>

               <div>
                 <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
                 <select
                   value={editType}
                   onChange={e => {
                     setEditType(e.target.value as 'income' | 'expense');
                     setEditCatId('');
                   }}
                   className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-xl p-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-colors"
                 >
                   <option value="income">Income</option>
                   <option value="expense">Expense</option>
                 </select>
               </div>

               <div>
                 <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                 <CategoryDropdownMenu type={editType} selected={editCatId} onSelect={setEditCatId} />
               </div>

               <div className="flex gap-3 pt-4">
                 <button onClick={() => setEditTarget(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl py-3 font-medium transition-colors">Cancel</button>
                 <button onClick={handleUpdate} className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-blue-600 text-white rounded-xl py-3 font-medium transition-colors">Save Changes</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
