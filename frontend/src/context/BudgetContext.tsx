import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';

const API = '/api';

export interface Record {
  id:       number;
  amount:   number;
  type:     'income' | 'expense';
  category: string;
  time:     string;
  bal:      number;
}

interface BudgetContextType {
  balance:         number;
  records:         Record[];
  allRecords:      Record[];
  addRecord:       (amount: number, type: string, category: string) => Promise<void>;
  updateRecord:    (id: number, amount: number, type: string, category: string) => Promise<void>;
  deleteRecord:    (id: number) => Promise<void>;
  fetchRecords:    () => Promise<void>;
  fetchAllRecords: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [balance,    setBalance]    = useState(0);
  const [records,    setRecords]    = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);

  useEffect(() => {
    fetchRecords();
    fetchBalance();
  }, []);

  async function fetchBalance() {
    const { data } = await axios.get(`${API}/records/balance`);
    setBalance(data.balance);
  }

  async function fetchRecords() {
    const { data } = await axios.get(`${API}/records`);
    setRecords(data);
  }

  async function fetchAllRecords() {
    const { data } = await axios.get(`${API}/records/all`);
    setAllRecords(data);
  }

  async function addRecord(amount: number, type: string, category: string) {
    await axios.post(`${API}/records`, { amount, type, category });
    await fetchRecords();
    await fetchBalance();
  }

  async function updateRecord(id: number, amount: number, type: string, category: string) {
    await axios.put(`${API}/records/${id}`, { amount, type, category });
    await fetchRecords();
    await fetchAllRecords();
    await fetchBalance();
  }

  async function deleteRecord(id: number) {
    await axios.delete(`${API}/records/${id}`);
    await fetchRecords();
    await fetchAllRecords();
    await fetchBalance();
  }

  return (
    <BudgetContext.Provider value={{
      balance, records, allRecords,
      addRecord, updateRecord, deleteRecord,
      fetchRecords, fetchAllRecords,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used inside BudgetProvider');
  return ctx;
}
