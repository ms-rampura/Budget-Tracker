import { useBudget } from './../context/BudgetContext';

interface Props {
  type:     'income' | 'expense';
  selected: number | '';
  onSelect: (catId: number | '') => void;
}

export default function CategoryDropdownMenu({ type, selected, onSelect }: Props) {
  const { categories, addCategory } = useBudget();
  
  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type);

  const handleSelect = async (val: string) => {
    if (val === 'NEW_CATEGORY') {
      const name = window.prompt(`Enter new ${type} category name:`);
      if (name) {
        const newCat = await addCategory(name, type);
        onSelect(newCat.id);
      } else {
        onSelect('');
      }
    } else {
      onSelect(Number(val));
    }
  };

  return (
    <select
      value={selected === '' ? '' : selected}
      onChange={e => handleSelect(e.target.value)}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      <option value="" disabled>Select a category</option>
      {filteredCategories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
      <option value="NEW_CATEGORY" className="font-bold text-emerald-500">
        + Create New Category
      </option>
    </select>
  );
}
