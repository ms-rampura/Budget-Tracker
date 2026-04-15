# Migration Guide: React Native Finance App → Web App (Node.js + Express + MySQL)

This guide walks you through migrating the **Personal Finance Tracker** from a React Native/Expo mobile app with SQLite to a full-stack web application using React (Vite), Node.js, Express, and MySQL.

---

## Table of Contents

1. [Project Overview & Architecture Change](#1-project-overview--architecture-change)
2. [Set Up the MySQL Database](#2-set-up-the-mysql-database)
3. [Initialize the Backend (Node.js + Express)](#3-initialize-the-backend-nodejs--express)
4. [Create the Database Connection & Schema](#4-create-the-database-connection--schema)
5. [Build the API Routes](#5-build-the-api-routes)
6. [Initialize the Frontend (React + Vite)](#6-initialize-the-frontend-react--vite)
7. [Migrate the Context Providers](#7-migrate-the-context-providers)
8. [Migrate the Screens to React Pages](#8-migrate-the-screens-to-react-pages)
9. [Migrate the Components](#9-migrate-the-components)
10. [Handle Theming (Dark/Light Mode)](#10-handle-theming-darklight-mode)
11. [Replace Charts](#11-replace-charts)
12. [Finalize & Test](#12-finalize--test)

---

## 1. Project Overview & Architecture Change

### What's Changing

| Concern | Before (Mobile) | After (Web) |
|---|---|---|
| Framework | React Native + Expo | React (Vite) |
| Styling | NativeWind (Tailwind for RN) | Tailwind CSS |
| Navigation | expo-router (file-based) | React Router v6 |
| Database | SQLite (on-device) | MySQL (server-side) |
| Backend | None (direct DB access) | Node.js + Express REST API |
| Charts | react-native-gifted-charts | recharts |
| Icons | @expo/vector-icons | react-icons |

### New Folder Structure

```
finance-web/
├── backend/                   # Express server
│   ├── src/
│   │   ├── db.js              # MySQL connection pool
│   │   ├── routes/
│   │   │   └── records.js     # All /api/records routes
│   │   └── index.js           # Entry point
│   ├── package.json
│   └── .env
│
└── frontend/                  # React (Vite) app
    ├── src/
    │   ├── context/
    │   │   ├── BudgetContext.tsx
    │   │   └── ThemeContext.tsx
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Add.tsx
    │   │   ├── AllRecords.tsx
    │   │   └── About.tsx
    │   ├── components/
    │   │   ├── AddRecords.tsx
    │   │   ├── LastRecordsCard.tsx
    │   │   ├── LineGraph.tsx
    │   │   └── CategoryDropdownMenu.tsx
    │   ├── App.tsx
    │   └── main.tsx
    ├── tailwind.config.js
    └── package.json
```

---

## 2. Set Up the MySQL Database

### 2.1 Install MySQL

If you don't have MySQL installed, download **MySQL Community Server** from [mysql.com](https://dev.mysql.com/downloads/mysql/) and install it. During setup, set a `root` password and note it down(root).

You can also use a GUI like **MySQL Workbench** or **TablePlus** to manage the database visually.

### 2.2 Create the Database and Table

Open your MySQL terminal or Workbench and run the following SQL. This mirrors the schema you had in SQLite, but adapted for MySQL.

```sql
-- Create a dedicated database for the app
CREATE DATABASE IF NOT EXISTS finance_tracker;

-- Switch to it
USE finance_tracker;

-- Create the records table
-- Note: MySQL uses DATETIME instead of TEXT for timestamps,
-- and AUTO_INCREMENT instead of AUTOINCREMENT
CREATE TABLE IF NOT EXISTS records (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  amount    INT         NOT NULL,
  type      VARCHAR(10) NOT NULL,   -- 'income' or 'expense'
  category  VARCHAR(50) NOT NULL,
  time      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  bal       INT         NOT NULL
);
```

> **Why DATETIME instead of TEXT?**
> In your SQLite app, `time` was stored as an ISO string (TEXT). MySQL has a proper `DATETIME` type that stores timestamps natively. This allows you to sort, filter, and compute date ranges correctly with SQL functions like `DATE_SUB` and `NOW()`. The Express backend will convert this to a JS Date/ISO string automatically.

### 2.3 Create a Dedicated MySQL User (Optional but Recommended)

Instead of using `root` in your app, create a limited user:

```sql
CREATE USER 'finance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON finance_tracker.* TO 'finance_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Initialize the Backend (Node.js + Express)

### 3.1 Create the Backend Directory and Install Dependencies

```bash
mkdir finance-web
cd finance-web
mkdir backend
cd backend
npm init -y
npm install express mysql2 cors dotenv
npm install --save-dev nodemon
```

**What each package does:**

- `express` — the web server framework that handles routing and HTTP
- `mysql2` — MySQL driver for Node.js; more modern and promise-based than the older `mysql` package
- `cors` — middleware that allows your React frontend (running on a different port) to call your API without browser security blocks
- `dotenv` — loads environment variables from a `.env` file so credentials never appear in source code
- `nodemon` — dev tool that auto-restarts the server when you save a file

### 3.2 Add Start Scripts to `package.json`

Open `backend/package.json` and update the `scripts` section:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

### 3.3 Create the `.env` File

Create `backend/.env`. This file holds your database credentials and should **never** be committed to Git.

```env
DB_HOST=localhost
DB_USER=finance_user
DB_PASSWORD=your_secure_password
DB_NAME=finance_tracker
PORT=3001
```

Add a `.gitignore` in `backend/`:

```
node_modules/
.env
```

### 3.4 Create the Server Entry Point

Create `backend/src/index.js`:

```js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const recordsRouter = require('./routes/records');

const app  = express();
const PORT = process.env.PORT || 3001;

// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from the React dev server (localhost:5173)
// In production, replace the origin with your actual domain
app.use(cors({ origin: 'http://localhost:5173' }));

// Mount the records API at /api/records
app.use('/api/records', recordsRouter);

// Health check route
app.get('/', (req, res) => res.json({ status: 'Finance API running' }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

---

## 4. Create the Database Connection & Schema

### 4.1 Create the Connection Pool

Create `backend/src/db.js`:

```js
const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool reuses connections instead of opening
// and closing one for every request. This is faster and
// prevents hitting MySQL's max connection limit.
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

> **Why a pool?** In SQLite, the database was a single local file and one connection was fine. MySQL is a network service; opening a new TCP connection per request adds latency and can exhaust server limits. A pool keeps a set of connections alive and lends them out as needed.

---

## 5. Build the API Routes

This is the core of the backend. Your React app previously called SQLite functions directly inside `budgetContext.tsx`. Now it will make HTTP fetch calls to these routes instead.

Create `backend/src/routes/records.js`:

```js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ─── GET /api/records ───────────────────────────────────────────────────────
// Returns the last 30 days of records, newest first.
// Replaces: fetchRecords() in budgetContext
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM records
       WHERE time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY time DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/records/all ────────────────────────────────────────────────────
// Returns ALL records.
// Replaces: fetchAllRecords() in budgetContext
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM records ORDER BY time DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/records/balance ─────────────────────────────────────────────
// Returns the current balance (the `bal` of the most recent record).
// Replaces: the balance derived from records in budgetContext
router.get('/balance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bal FROM records ORDER BY time DESC LIMIT 1`
    );
    const balance = rows.length > 0 ? rows[0].bal : 0;
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/records ───────────────────────────────────────────────────────
// Adds a new transaction.
// Replaces: addRecords() in budgetContext
// Body: { amount, type, category }
router.post('/', async (req, res) => {
  const { amount, type, category } = req.body;

  if (!amount || !type || !category) {
    return res.status(400).json({ error: 'amount, type, and category are required' });
  }

  try {
    // Get the current balance from the last record
    const [lastRow] = await pool.query(
      `SELECT bal FROM records ORDER BY time DESC LIMIT 1`
    );
    const currentBal = lastRow.length > 0 ? lastRow[0].bal : 0;
    const newBal = type === 'income'
      ? currentBal + amount
      : currentBal - amount;

    const [result] = await pool.query(
      `INSERT INTO records (amount, type, category, time, bal)
       VALUES (?, ?, ?, NOW(), ?)`,
      [amount, type, category, newBal]
    );

    res.status(201).json({ id: result.insertId, bal: newBal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/records/:id ────────────────────────────────────────────────────
// Updates an existing record.
// Replaces: updateRecord() in budgetContext
// Body: { amount, type, category }
router.put('/:id', async (req, res) => {
  const { id }                    = req.params;
  const { amount, type, category } = req.body;

  try {
    // Fetch the record being edited and all records that came after it
    const [target] = await pool.query(`SELECT * FROM records WHERE id = ?`, [id]);
    if (target.length === 0) return res.status(404).json({ error: 'Record not found' });

    // Get the balance just BEFORE this record
    const [prev] = await pool.query(
      `SELECT bal FROM records WHERE time < ? ORDER BY time DESC LIMIT 1`,
      [target[0].time]
    );
    const balBefore = prev.length > 0 ? prev[0].bal : 0;

    // Recalculate the balance for this record with the new values
    const updatedBal = type === 'income'
      ? balBefore + amount
      : balBefore - amount;

    await pool.query(
      `UPDATE records SET amount = ?, type = ?, category = ?, bal = ? WHERE id = ?`,
      [amount, type, category, updatedBal, id]
    );

    res.json({ success: true, bal: updatedBal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/records/:id ──────────────────────────────────────────────────
// Deletes a record.
// Replaces: deleteRecord() in budgetContext
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(`DELETE FROM records WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

> **Note on balance recalculation:** In your SQLite app, the `bal` field was maintained as a running total in the app context. In this web version, the backend recalculates it whenever a record is added or edited. For a production app with many records, you may want to recalculate balances for all subsequent records when one is edited — this is a known trade-off.

---

## 6. Initialize the Frontend (React + Vite)

### 6.1 Create the React Project

From the `finance-web/` root:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom axios tailwindcss postcss autoprefixer recharts react-icons
npx tailwindcss init -p
```

**What each package does:**

- `react-router-dom` — replaces `expo-router`; handles page navigation in the browser
- `axios` — cleaner HTTP client than raw `fetch`, replaces direct SQLite calls
- `tailwindcss` — the CSS framework; the same utility classes you used in NativeWind but for the browser DOM
- `recharts` — React charting library; replaces `react-native-gifted-charts`
- `react-icons` — replaces `@expo/vector-icons` (Ionicons)

### 6.2 Configure Tailwind CSS

Open `frontend/tailwind.config.js` and update it:

```js
/** @type {import('tailwindcss').Config} */
export default {
  // darkMode: 'class' allows toggling dark mode by adding/removing
  // the 'dark' class on the <html> element, which matches your
  // existing ThemeContext pattern.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mirror your existing theme colors exactly
        primary:  { light: '#6366F1', dark: '#8e7bbd' },
        success:  { light: '#10B981', dark: '#48b470'  },
        danger:   { light: '#EF4444', dark: '#cc6464'  },
      }
    }
  },
  plugins: [],
};
```

Add Tailwind to `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6.3 Set Up React Router in `App.tsx`

Replace the contents of `frontend/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import { ThemeProvider }  from './context/ThemeContext';
import Home       from './pages/Home';
import Add        from './pages/Add';
import AllRecords from './pages/AllRecords';
import About      from './pages/About';

export default function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <BrowserRouter>
          {/* Tab bar — replaces expo-router's tab layout */}
          <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3 z-10">
            <NavLink to="/"           className={({ isActive }) => isActive ? 'text-indigo-500' : 'text-gray-500'}>Home</NavLink>
            <NavLink to="/add"        className={({ isActive }) => isActive ? 'text-indigo-500' : 'text-gray-500'}>Add</NavLink>
            <NavLink to="/allrecords" className={({ isActive }) => isActive ? 'text-indigo-500' : 'text-gray-500'}>Records</NavLink>
            <NavLink to="/about"      className={({ isActive }) => isActive ? 'text-indigo-500' : 'text-gray-500'}>About</NavLink>
          </nav>

          <main className="pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/add"        element={<Add />} />
              <Route path="/allrecords" element={<AllRecords />} />
              <Route path="/about"      element={<About />} />
            </Routes>
          </main>
        </BrowserRouter>
      </BudgetProvider>
    </ThemeProvider>
  );
}
```

> **Why `pb-16` on `<main>`?** The tab bar is `fixed` at the bottom, so content underneath it would be hidden. `pb-16` (padding-bottom: 4rem) pushes page content up above the nav bar.

---

## 7. Migrate the Context Providers

### 7.1 BudgetContext

This is the most important migration step. You're replacing direct SQLite calls with `fetch`/`axios` calls to your Express API.

Create `frontend/src/context/BudgetContext.tsx`:

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

// Point all API calls at your Express server
const API = 'http://localhost:3001/api';

export interface Record {
  id:       number;
  amount:   number;
  type:     'income' | 'expense';
  category: string;
  time:     string;
  bal:      number;
}

interface BudgetContextType {
  balance:        number;
  records:        Record[];   // Last 30 days
  allRecords:     Record[];   // All time
  addRecord:      (amount: number, type: string, category: string) => Promise<void>;
  updateRecord:   (id: number, amount: number, type: string, category: string) => Promise<void>;
  deleteRecord:   (id: number) => Promise<void>;
  fetchRecords:   () => Promise<void>;
  fetchAllRecords:() => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [balance,    setBalance]    = useState(0);
  const [records,    setRecords]    = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);

  // Load balance and last-30-day records on mount
  useEffect(() => {
    fetchRecords();
    fetchBalance();
  }, []);

  async function fetchBalance() {
    const { data } = await axios.get(`${API}/records/balance`);
    setBalance(data.balance);
  }

  // Replaces the old fetchRecords() that queried SQLite
  async function fetchRecords() {
    const { data } = await axios.get(`${API}/records`);
    setRecords(data);
  }

  // Replaces the old fetchAllRecords() that queried SQLite
  async function fetchAllRecords() {
    const { data } = await axios.get(`${API}/records/all`);
    setAllRecords(data);
  }

  // Replaces addRecords() — now a POST request
  async function addRecord(amount: number, type: string, category: string) {
    await axios.post(`${API}/records`, { amount, type, category });
    // Refresh both the 30-day view and the running balance
    await fetchRecords();
    await fetchBalance();
  }

  // Replaces updateRecord() — now a PUT request
  async function updateRecord(id: number, amount: number, type: string, category: string) {
    await axios.put(`${API}/records/${id}`, { amount, type, category });
    await fetchRecords();
    await fetchAllRecords();
    await fetchBalance();
  }

  // Replaces deleteRecord() — now a DELETE request
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
```

### 7.2 ThemeContext

This is almost identical to the mobile version, but instead of a custom theme object you toggle a CSS class on `<html>` so Tailwind's `dark:` utilities work.

Create `frontend/src/context/ThemeContext.tsx`:

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark:      boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // Persist user's preference in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') applyDark(true);
  }, []);

  function applyDark(dark: boolean) {
    setIsDark(dark);
    // Adding 'dark' to <html> activates all Tailwind dark: classes
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  function toggleTheme() {
    applyDark(!isDark);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
```

> **Key difference from the mobile version:** In React Native, you passed a theme object with hex colors into component props. On the web, Tailwind's `dark:` variant handles dark mode entirely via CSS, so your components just write `className="text-gray-900 dark:text-gray-100"` and the browser does the switching. This is much simpler.

---

## 8. Migrate the Screens to React Pages

### 8.1 Home Page

Create `frontend/src/pages/Home.tsx`. Replace `StyleSheet` and RN `View`/`Text` components with HTML tags and Tailwind classes.

```tsx
import { useBudget }  from '../context/BudgetContext';
import { useTheme }   from '../context/ThemeContext';
import LastRecordsCard from '../components/LastRecordsCard';
import LineGraph       from '../components/LineGraph';
import { IoCash }      from 'react-icons/io5';

export default function Home() {
  const { balance, records } = useBudget();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finance Tracker</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-4 flex items-center gap-4">
        <IoCash size={40} className="text-indigo-500 dark:text-purple-400" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            Rs. {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 30-Day Chart */}
      <LineGraph records={records} />

      {/* Recent Transactions */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
        Recent Transactions
      </h2>
      <LastRecordsCard records={records} />
    </div>
  );
}
```

### 8.2 Add Transaction Page

Create `frontend/src/pages/Add.tsx`:

```tsx
import AddRecords from '../components/AddRecords';

export default function Add() {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Add Transaction</h1>
      <AddRecords />
    </div>
  );
}
```

### 8.3 All Records Page

Create `frontend/src/pages/AllRecords.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import type { Record } from '../context/BudgetContext';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../components/CategoryDropdownMenu';

export default function AllRecords() {
  const { allRecords, fetchAllRecords, updateRecord, deleteRecord } = useBudget();
  const [editTarget, setEditTarget] = useState<Record | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType,   setEditType]   = useState('income');
  const [editCat,    setEditCat]    = useState('');

  useEffect(() => { fetchAllRecords(); }, []);

  function openEdit(record: Record) {
    setEditTarget(record);
    setEditAmount(String(record.amount));
    setEditType(record.type);
    setEditCat(record.category);
  }

  async function handleUpdate() {
    if (!editTarget) return;
    await updateRecord(editTarget.id, Number(editAmount), editType, editCat);
    setEditTarget(null);
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">All Records</h1>

      <div className="space-y-2">
        {allRecords.map(record => (
          <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{record.category}</p>
              <p className="text-xs text-gray-500">{new Date(record.time).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${record.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {record.type === 'income' ? '+' : '-'} Rs. {record.amount.toLocaleString()}
              </span>
              <button onClick={() => openEdit(record)}    className="text-indigo-500 text-sm">Edit</button>
              <button onClick={() => deleteRecord(record.id)} className="text-red-500 text-sm">Del</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Record</h2>

            <input
              type="number"
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-3 bg-transparent text-gray-900 dark:text-white"
              placeholder="Amount"
            />

            <select
              value={editType}
              onChange={e => setEditType(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={editCat}
              onChange={e => setEditCat(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {(editType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={handleUpdate} className="flex-1 bg-indigo-500 text-white rounded-lg py-2">Save</button>
              <button onClick={() => setEditTarget(null)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 8.4 About Page

Create `frontend/src/pages/About.tsx`:

```tsx
export default function About() {
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-indigo-500 mb-2">Finance Tracker</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        A simple, local-first personal finance tool.
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow text-left space-y-2">
        <p className="text-gray-700 dark:text-gray-300">✅ Track income and expenses</p>
        <p className="text-gray-700 dark:text-gray-300">✅ Category breakdown</p>
        <p className="text-gray-700 dark:text-gray-300">✅ 30-day balance chart</p>
        <p className="text-gray-700 dark:text-gray-300">✅ Dark / Light mode</p>
      </div>
    </div>
  );
}
```

---

## 9. Migrate the Components

### 9.1 AddRecords Component

Create `frontend/src/components/AddRecords.tsx`. The calculator keypad from the mobile version can be replaced with a standard HTML number input:

```tsx
import { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import CategoryDropdownMenu, { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './CategoryDropdownMenu';

export default function AddRecords() {
  const { addRecord } = useBudget();
  const [type,       setType]     = useState<'income' | 'expense'>('income');
  const [amount,     setAmount]   = useState('');
  const [category,   setCategory] = useState('');
  const [customCat,  setCustomCat] = useState('');
  const [success,    setSuccess]  = useState(false);

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
      <CategoryDropdownMenu
        type={type}
        selected={category}
        onSelect={setCategory}
      />

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
```

### 9.2 LastRecordsCard Component

Create `frontend/src/components/LastRecordsCard.tsx`:

```tsx
import type { Record } from '../context/BudgetContext';

export default function LastRecordsCard({ records }: { records: Record[] }) {
  if (records.length === 0) {
    return <p className="text-center text-gray-400 mt-4">No transactions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {records.slice(0, 10).map(record => (
        <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{record.category}</p>
            <p className="text-xs text-gray-500">{new Date(record.time).toLocaleDateString()}</p>
          </div>
          <span className={`font-bold text-sm ${record.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            {record.type === 'income' ? '+' : '-'} Rs. {record.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 9.3 CategoryDropdownMenu Component

Create `frontend/src/components/CategoryDropdownMenu.tsx`:

```tsx
// Export these so AllRecords.tsx can reuse them for the edit modal
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
```

---

## 10. Handle Theming (Dark/Light Mode)

In the mobile app, you passed a `theme` object with hex colors into components as props. On the web, this is handled by Tailwind's `dark:` variant, which is already configured in Step 6.2.

The key principle is: **every component uses paired classes like `text-gray-900 dark:text-gray-100` instead of reading from a theme object.** The `ThemeContext` only needs to toggle the `dark` class on `<html>`, which you already did in Step 7.2.

Your existing theme colors map to Tailwind classes like this:

| Old Theme Key | Light Tailwind Class | Dark Tailwind Class |
|---|---|---|
| `background` | `bg-gray-50` | `dark:bg-gray-900` |
| `surface` | `bg-white` | `dark:bg-gray-800` |
| `text` | `text-gray-900` | `dark:text-gray-100` |
| `subText` | `text-gray-500` | `dark:text-gray-400` |
| `primary` | `text-indigo-500` | `dark:text-purple-400` |
| `success` | `text-green-500` | `dark:text-green-400` |
| `danger` | `text-red-500` | `dark:text-red-400` |
| `border` | `border-gray-200` | `dark:border-gray-700` |

---

## 11. Replace Charts

### 11.1 LineGraph Component

The mobile app used `react-native-gifted-charts`. Replace it with `recharts`, which works in the browser.

Create `frontend/src/components/LineGraph.tsx`:

```tsx
import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { Record } from '../context/BudgetContext';

interface Props { records: Record[]; }

export default function LineGraph({ records }: Props) {
  // Build a data point per day from the records.
  // records are newest-first, so we reverse them for the chart.
  const data = useMemo(() => {
    return [...records]
      .reverse()
      .map(r => ({
        date: new Date(r.time).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        balance: r.bal,
      }));
  }, [records]);

  if (data.length === 0) {
    return <p className="text-center text-gray-400 mt-4">No data for chart yet.</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">30-Day Balance Trend</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#F3F4F6' }}
            itemStyle={{ color: '#8e7bbd' }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#6366F1"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 12. Finalize & Test

### 12.1 Configure the Vite Proxy (Avoids CORS in Dev)

Instead of hardcoding `http://localhost:3001` in every API call, you can proxy API requests through Vite. This also means your production build won't need to change the URL.

Edit `frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/* in the frontend will be forwarded
      // to your Express server running on port 3001
      '/api': 'http://localhost:3001',
    }
  }
});
```

Then update the `API` constant in `BudgetContext.tsx` from `http://localhost:3001/api` to just `/api`.

### 12.2 Running Both Servers

You'll need two terminal windows during development.

**Terminal 1 — Backend:**
```bash
cd finance-web/backend
npm run dev
# Output: Backend running on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd finance-web/frontend
npm run dev
# Output: Vite running on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

### 12.3 Checklist

Go through each feature and verify it works end-to-end:

- [ ] Home page loads with correct balance and recent transactions
- [ ] 30-day line chart renders
- [ ] Adding an income transaction updates balance correctly
- [ ] Adding an expense transaction updates balance correctly
- [ ] Custom "Other" category input appears and is stored
- [ ] All Records page shows every transaction
- [ ] Edit modal pre-fills with the record's current values
- [ ] Saving an edit updates the record in MySQL
- [ ] Deleting a record removes it from the list
- [ ] Dark mode toggles and persists on page refresh
- [ ] Browser DevTools → Network tab shows correct API calls to `/api/records`

### 12.4 What Was Removed / Not Migrated

| Feature | Reason |
|---|---|
| `exportDb()` | SQLite had a single file you could copy. MySQL is a server process; use `mysqldump` instead from the command line: `mysqldump -u finance_user -p finance_tracker > backup.sql` |
| `DbViewerScreen` | This was a dev-only tool. You can use MySQL Workbench or TablePlus as a GUI replacement |
| `PieChartCategorywise` | Was a stub in the original; can be added with `recharts` `PieChart` using the same `allRecords` data |
| Calculator keypad | Replaced with a standard HTML `<input type="number">`, which is more appropriate for web |

---

## Summary

You have successfully migrated the Finance Tracker from:

**React Native + Expo + SQLite (no backend)**

to:

**React (Vite) + Tailwind + React Router + Node.js + Express + MySQL**

The core logic — categories, balance calculation, running totals, dark/light mode — is preserved. The only structural change is that database operations now go through a REST API instead of running in-process on the device.
