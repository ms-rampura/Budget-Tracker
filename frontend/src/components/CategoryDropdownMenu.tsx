export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Business',
  'Gifts', 'Savings Interest', 'Rental Income',
  'Reimbursements', 'Cashback/Rewards', 'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Food & Drinks', 'Transportation', 'Shopping', 'Groceries',
  'Rent', 'Utilities', 'Entertainment', 'Health', 'Education',
  'Subscriptions', 'Gifts & Donations', 'Travel',
  'Insurance', 'Debt/Loans', 'Other Expense',
];

interface Props {
  type:     'income' | 'expense';
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryDropdownMenu({ type, selected, onSelect }: Props) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <select
      value={selected}
      onChange={e => onSelect(e.target.value)}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      <option value="" disabled>Select a category</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}
