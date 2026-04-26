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
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">All Records</h1>

      <div className="space-y-2">
        {allRecords.map(record => (
          <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{record.category}</p>
              <p className="text-xs text-gray-500">{new Date(record.time).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${record.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {record.type === 'income' ? '+' : '-'} Rs. {record.amount.toLocaleString()}
              </span>
              <button onClick={() => openEdit(record)}       className="text-indigo-500 text-sm">Edit</button>
              <button onClick={() => deleteRecord(record.id)} className="text-red-500 text-sm">Del</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Record</h2>

            <input
              type="number"
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-3 bg-transparent text-gray-900 dark:text-white"
              placeholder="Amount"
            />

            <select
              value={editType}
              onChange={e => {
                setEditType(e.target.value as 'income' | 'expense');
                setEditCatId('');
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <div className="mb-4">
              <CategoryDropdownMenu type={editType} selected={editCatId} onSelect={setEditCatId} />
            </div>

            <div className="flex gap-3">
              <button onClick={handleUpdate}          className="flex-1 bg-indigo-500 text-white rounded-lg py-2">Save</button>
              <button onClick={() => setEditTarget(null)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
