-- 1. Create the Users Table for the Login System
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the Accounts (Wallets) Table
-- This will store the different wallets (e.g., Cash, Bank, Credit Card) for each user
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL, -- e.g., 'Cash', 'Checking', 'Credit Card'
    type VARCHAR(20) DEFAULT 'general',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Recreate the Records (Transactions) Table
-- We need to add user_id and account_id to link each transaction to a specific user and wallet.
-- WARNING: This drops the existing records table. If you want to keep old data, 
-- you will need to use ALTER TABLE instead.
DROP TABLE IF EXISTS records;

CREATE TABLE records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(50) NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bal DECIMAL(15, 2) NOT NULL, -- Keeps track of the running balance for that specific account
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
-- 1. Create the new categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Add category_id to records
ALTER TABLE records ADD COLUMN category_id INT;
ALTER TABLE records ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
-- 1. Index for the main dashboard query (Filters by User ID and Time)
CREATE INDEX idx_records_user_time ON records (user_id, time DESC);

-- 2. Index for filtering records by a specific wallet/account
CREATE INDEX idx_records_user_account_time ON records (user_id, account_id, time DESC);

-- 3. Index for quickly fetching user accounts
CREATE INDEX idx_accounts_user ON accounts (user_id);
-- 1. Create the Audit Logs Table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    record_id INT NOT NULL,
    action ENUM('UPDATE', 'DELETE') NOT NULL,
    old_amount DECIMAL(10,2),
    new_amount DECIMAL(10,2),
    old_type VARCHAR(20),
    new_type VARCHAR(20),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create AFTER UPDATE Trigger
DELIMITER $$
CREATE TRIGGER after_record_update
AFTER UPDATE ON records
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, record_id, action, old_amount, new_amount, old_type, new_type)
    VALUES (OLD.user_id, OLD.id, 'UPDATE', OLD.amount, NEW.amount, OLD.type, NEW.type);
END $$
DELIMITER ;

-- 3. Create AFTER DELETE Trigger
DELIMITER $$
CREATE TRIGGER after_record_delete
AFTER DELETE ON records
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, record_id, action, old_amount, new_amount, old_type, new_type)
    VALUES (OLD.user_id, OLD.id, 'DELETE', OLD.amount, NULL, OLD.type, NULL);
END $$
DELIMITER ;
