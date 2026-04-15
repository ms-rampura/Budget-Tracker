import AddRecords from '../components/AddRecords';

export default function Add() {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Add Transaction</h1>
      <AddRecords />
    </div>
  );
}
