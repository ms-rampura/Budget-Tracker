import { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import CategoryDropdownMenu from './CategoryDropdownMenu';

export default function AddRecords() {
  const { addRecord, accounts, activeAccountId } = useBudget();
  const [type,      setType]     = useState<'income' | 'expense'>('income');
  const [amount,    setAmount]   = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [success,   setSuccess]  = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>(activeAccountId || '');

  useEffect(() => {
    if (activeAccountId && !selectedAccountId) {
      setSelectedAccountId(activeAccountId);
    }
  }, [activeAccountId, selectedAccountId]);

  async function handleSubmit() {
    if (!amount || !categoryId || !selectedAccountId) return;

    await addRecord(Number(amount), type, Number(categoryId), Number(selectedAccountId));
    setAmount('');
    setCategoryId('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
      {/* Wallet Selector */}
      <select
        value={selectedAccountId}
        onChange={(e) => setSelectedAccountId(Number(e.target.value))}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-transparent text-gray-900 dark:text-white"
      >
        <option value="" disabled>Select Wallet</option>
        {accounts.map(acc => (
          <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
        ))}
      </select>

      {/* Income / Expense Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {(['income', 'expense'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId(''); }}
            className={`flex-1 py-2 font-semibold capitalize transition-colors ${
              type === t
                ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Enter amount (Rs.)"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-transparent text-gray-900 dark:text-white text-lg"
      />

      {/* Category */}
      <CategoryDropdownMenu type={type} selected={categoryId} onSelect={setCategoryId} />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedAccountId || !amount || !categoryId}
        className="w-full py-3 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 transition-colors"
      >
        Add Transaction
      </button>

      {success && (
        <p className="text-center text-green-500 font-semibold">Transaction added!</p>
      )}
    </div>
  );
}