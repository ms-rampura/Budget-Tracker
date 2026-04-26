import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const API = '/api'; // You may need to set axios baseURL elsewhere, assuming proxy is set

export interface Record {
  id:       number;
  user_id:  number;
  account_id: number;
  amount:   number;
  type:     'income' | 'expense';
  category: string;
  time:     string;
  bal:      number;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: string;
  balance: string | number; // MySQL decimals come as strings sometimes
}

interface BudgetContextType {
  balance:         number;
  records:         Record[];
  allRecords:      Record[];
  accounts:        Account[];
  activeAccountId: number | null;
  setActiveAccountId: (id: number | null) => void;
  addRecord:       (amount: number, type: string, category: string, accountId: number) => Promise<void>;
  updateRecord:    (id: number, amount: number, type: string, category: string) => Promise<void>;
  deleteRecord:    (id: number) => Promise<void>;
  fetchRecords:    () => Promise<void>;
  fetchAllRecords: () => Promise<void>;
  fetchAccounts:   () => Promise<void>;
  addAccount:      (name: string, type: string, initial_balance: number) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useContext(AuthContext);
  
  const [balance,    setBalance]    = useState(0);
  const [records,    setRecords]    = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [accounts,   setAccounts]   = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  // Re-fetch data when authentication changes or active account changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
      fetchBalance();
      fetchRecords();
    } else {
      setAccounts([]);
      setRecords([]);
      setAllRecords([]);
      setBalance(0);
      setActiveAccountId(null);
    }
  }, [isAuthenticated, activeAccountId]);

  async function fetchAccounts() {
    try {
      // Needs absolute URL if no proxy setup, using http://localhost:3001 as fallback
      const { data } = await axios.get(`http://localhost:3001${API}/accounts`);
      setAccounts(data);
      if (data.length > 0 && activeAccountId === null) {
        setActiveAccountId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    }
  }

  async function addAccount(name: string, type: string, initial_balance: number) {
    await axios.post(`http://localhost:3001${API}/accounts`, { name, type, initial_balance });
    await fetchAccounts();
    await fetchBalance();
  }

  async function fetchBalance() {
    try {
      if (activeAccountId) {
        // Find the specific account balance
        const acc = accounts.find(a => a.id === activeAccountId);
        if (acc) setBalance(Number(acc.balance));
      } else {
        const { data } = await axios.get(`http://localhost:3001${API}/records/balance`);
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Failed to fetch balance', err);
    }
  }

  async function fetchRecords() {
    try {
      const url = activeAccountId 
        ? `http://localhost:3001${API}/records?account_id=${activeAccountId}`
        : `http://localhost:3001${API}/records`;
      const { data } = await axios.get(url);
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records', err);
    }
  }

  async function fetchAllRecords() {
    try {
      const url = activeAccountId 
        ? `http://localhost:3001${API}/records/all?account_id=${activeAccountId}`
        : `http://localhost:3001${API}/records/all`;
      const { data } = await axios.get(url);
      setAllRecords(data);
    } catch (err) {
      console.error('Failed to fetch all records', err);
    }
  }

  async function addRecord(amount: number, type: string, category: string, accountId: number) {
    await axios.post(`http://localhost:3001${API}/records`, { amount, type, category, account_id: accountId });
    await fetchAccounts();
    await fetchRecords();
    await fetchBalance();
  }

  async function updateRecord(id: number, amount: number, type: string, category: string) {
    await axios.put(`http://localhost:3001${API}/records/${id}`, { amount, type, category });
    await fetchAccounts();
    await fetchRecords();
    await fetchAllRecords();
    await fetchBalance();
  }

  async function deleteRecord(id: number) {
    await axios.delete(`http://localhost:3001${API}/records/${id}`);
    await fetchAccounts();
    await fetchRecords();
    await fetchAllRecords();
    await fetchBalance();
  }

  return (
    <BudgetContext.Provider value={{
      balance, records, allRecords, accounts, activeAccountId, setActiveAccountId,
      addRecord, updateRecord, deleteRecord,
      fetchRecords, fetchAllRecords, fetchAccounts, addAccount
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
