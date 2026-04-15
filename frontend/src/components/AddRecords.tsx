import { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import CategoryDropdownMenu, { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './CategoryDropdownMenu';

export default function AddRecords() {
  const { addRecord } = useBudget();
  const [type,      setType]     = useState<'income' | 'expense'>('income');
  const [amount,    setAmount]   = useState('');
  const [category,  setCategory] = useState('');
  const [customCat, setCustomCat] = useState('');
  const [success,   setSuccess]  = useState(false);

  const isOther = category === 'Other Income' || category === 'Other Expense';

  async function handleSubmit() {
    const finalCat = isOther ? customCat : category;
    if (!amount || !finalCat) return;

    await addRecord(Number(amount), type, finalCat);
    setAmount('');
    setCategory('');
    setCustomCat('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
      {/* Income / Expense Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {(['income', 'expense'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setCategory(''); }}
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
      <CategoryDropdownMenu type={type} selected={category} onSelect={setCategory} />

      {/* Custom category input */}
      {isOther && (
        <input
          type="text"
          value={customCat}
          onChange={e => setCustomCat(e.target.value)}
          placeholder="Enter custom category"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-transparent text-gray-900 dark:text-white"
        />
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
      >
        Add Transaction
      </button>

      {success && (
        <p className="text-center text-green-500 font-semibold">Transaction added!</p>
      )}
    </div>
  );
}
