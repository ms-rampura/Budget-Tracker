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
-- We have removed user_id, type, and category as they are redundant.
-- user_id is linked via accounts, and type/category are linked via categories.
DROP TABLE IF EXISTS records;

CREATE TABLE records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bal DECIMAL(15, 2) NOT NULL, -- Keeps track of the running balance for that specific account
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. Create the new categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Indexes for optimization
-- Index for fetching records for an account ordered by time
CREATE INDEX idx_records_account_time ON records (account_id, time DESC);

-- Index for quickly fetching user accounts
CREATE INDEX idx_accounts_user ON accounts (user_id);

-- 6. Create the Audit Logs Table
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

-- 7. Create AFTER UPDATE Trigger
DELIMITER $$
CREATE TRIGGER after_record_update
AFTER UPDATE ON records
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_old_type VARCHAR(20);
    DECLARE v_new_type VARCHAR(20);
    
    -- Fetch user_id from accounts table
    SELECT user_id INTO v_user_id FROM accounts WHERE id = NEW.account_id;
    
    -- Fetch types from categories table
    SELECT type INTO v_old_type FROM categories WHERE id = OLD.category_id;
    SELECT type INTO v_new_type FROM categories WHERE id = NEW.category_id;

    INSERT INTO audit_logs (user_id, record_id, action, old_amount, new_amount, old_type, new_type)
    VALUES (v_user_id, OLD.id, 'UPDATE', OLD.amount, NEW.amount, v_old_type, v_new_type);
END $$
DELIMITER ;

-- 8. Create AFTER DELETE Trigger
DELIMITER $$
CREATE TRIGGER after_record_delete
AFTER DELETE ON records
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_type VARCHAR(20);
    
    -- Fetch user_id from accounts table
    SELECT user_id INTO v_user_id FROM accounts WHERE id = OLD.account_id;
    
    -- Fetch type from categories table
    SELECT type INTO v_type FROM categories WHERE id = OLD.category_id;

    INSERT INTO audit_logs (user_id, record_id, action, old_amount, new_amount, old_type, new_type)
    VALUES (v_user_id, OLD.id, 'DELETE', OLD.amount, NULL, v_type, NULL);
END $$
DELIMITER ;
