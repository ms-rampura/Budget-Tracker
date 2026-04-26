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
      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-xl p-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary appearance-none transition-colors duration-200"
    >
      <option value="" disabled>Select a category</option>
      {filteredCategories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
      <option value="NEW_CATEGORY" className="font-bold text-blue-600 dark:text-primary">
        + Create New Category
      </option>
    </select>
  );
}
