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
  category_id: number;
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

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
}

export interface AuditLog {
  id: number;
  user_id: number;
  record_id: number;
  action: 'UPDATE' | 'DELETE';
  old_amount: string | null;
  new_amount: string | null;
  old_type: string | null;
  new_type: string | null;
  timestamp: string;
}

interface BudgetContextType {
  balance:         number;
  records:         Record[];
  allRecords:      Record[];
  accounts:        Account[];
  categories:      Category[];
  auditLogs:       AuditLog[];
  activeAccountId: number | null;
  setActiveAccountId: (id: number | null) => void;
  addRecord:       (amount: number, type: string, categoryId: number, accountId: number) => Promise<void>;
  updateRecord:    (id: number, amount: number, type: string, categoryId: number) => Promise<void>;
  deleteRecord:    (id: number) => Promise<void>;
  fetchRecords:    () => Promise<void>;
  fetchAllRecords: () => Promise<void>;
  fetchAccounts:   () => Promise<void>;
  addAccount:      (name: string, type: string, initial_balance: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addCategory:     (name: string, type: string) => Promise<Category>;
  fetchAuditLogs:  () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useContext(AuthContext);
  
  const [balance,    setBalance]    = useState(0);
  const [records,    setRecords]    = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [accounts,   setAccounts]   = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [auditLogs,  setAuditLogs]  = useState<AuditLog[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);

  // Re-fetch data when authentication changes or active account changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
      fetchCategories();
      fetchBalance();
      fetchRecords();
    } else {
      setAccounts([]);
      setCategories([]);
      setRecords([]);
      setAllRecords([]);
      setBalance(0);
      setActiveAccountId(null);
      setAuditLogs([]);
    }
  }, [isAuthenticated, activeAccountId]);

  async function fetchCategories() {
    try {
      const { data } = await axios.get(`http://localhost:3001${API}/categories`);
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  }

  async function addCategory(name: string, type: string) {
    const { data } = await axios.post(`http://localhost:3001${API}/categories`, { name, type });
    await fetchCategories();
    return data;
  }

  async function fetchAuditLogs() {
    try {
      const { data } = await axios.get(`http://localhost:3001${API}/audit`);
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  }

  async function fetchAccounts() {
    try {
      // Needs absolute URL if no proxy setup, using http://localhost:3001 as fallback
      const { data } = await axios.get(`http://localhost:3001${API}/accounts`);
      setAccounts(data);
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

  async function addRecord(amount: number, type: string, categoryId: number, accountId: number) {
    await axios.post(`http://localhost:3001${API}/records`, { amount, type, category_id: categoryId, account_id: accountId });
    await fetchAccounts();
    await fetchRecords();
    await fetchBalance();
  }

  async function updateRecord(id: number, amount: number, type: string, categoryId: number) {
    await axios.put(`http://localhost:3001${API}/records/${id}`, { amount, type, category_id: categoryId });
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
      balance, records, allRecords, accounts, categories, auditLogs, activeAccountId, setActiveAccountId,
      addRecord, updateRecord, deleteRecord,
      fetchRecords, fetchAllRecords, fetchAccounts, addAccount, fetchCategories, addCategory, fetchAuditLogs
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
