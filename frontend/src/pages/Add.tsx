import AddRecords from '../components/AddRecords';

export default function Add() {
  return (
    <div className="w-full transition-colors duration-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">New Transaction</h2>
        <p className="text-slate-500 dark:text-secondary font-body-md">Record a new income or expense to keep your budget up to date.</p>
      </div>
      <AddRecords />
    </div>
  );
}
