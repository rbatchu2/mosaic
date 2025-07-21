-- Mosaic Financial App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  avatar TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- depository, credit, etc.
  subtype VARCHAR NOT NULL, -- checking, savings, credit card, etc.
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  institution VARCHAR NOT NULL,
  mask VARCHAR, -- last 4 digits
  plaid_account_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  merchant_name VARCHAR,
  category TEXT[] DEFAULT '{}', -- array of category strings
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location JSONB, -- store location data as JSON
  plaid_transaction_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense groups table
CREATE TABLE expense_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  color VARCHAR DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES expense_groups(id) ON DELETE CASCADE,
  user_id UUID, -- Can be null for external members
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Split suggestions table
CREATE TABLE split_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  group_id UUID REFERENCES expense_groups(id) ON DELETE SET NULL,
  confidence DECIMAL(3, 2) NOT NULL, -- 0.00 to 1.00
  split_type VARCHAR NOT NULL CHECK (split_type IN ('equal', 'custom', 'percentage')),
  reasoning TEXT,
  participants JSONB NOT NULL, -- array of participant objects
  amounts JSONB NOT NULL, -- object mapping user_id to amount
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  suggestions TEXT[], -- array of suggestion strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_expense_groups_user_id ON expense_groups(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_split_suggestions_user_id ON split_suggestions(user_id);
CREATE INDEX idx_split_suggestions_status ON split_suggestions(status);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

-- Update triggers for updated_at fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_groups_updated_at BEFORE UPDATE ON expense_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_split_suggestions_updated_at BEFORE UPDATE ON split_suggestions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (for now, allow all operations - adjust for production)
CREATE POLICY "Users can manage their own data" ON users FOR ALL USING (true);
CREATE POLICY "Users can manage their own accounts" ON accounts FOR ALL USING (true);
CREATE POLICY "Users can manage their own transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Users can manage their own expense groups" ON expense_groups FOR ALL USING (true);
CREATE POLICY "Users can access group members" ON group_members FOR ALL USING (true);
CREATE POLICY "Users can manage their own split suggestions" ON split_suggestions FOR ALL USING (true);
CREATE POLICY "Users can manage their own chat messages" ON chat_messages FOR ALL USING (true);

-- Seed Data
-- Insert demo user
INSERT INTO users (id, email, name, avatar, member_since) VALUES 
('00000000-0000-0000-0000-000000000001', 'alex@example.com', 'Alex Johnson', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=150', '2023-01-15 10:00:00');

-- Insert demo accounts
INSERT INTO accounts (id, user_id, name, type, subtype, balance, institution, mask) VALUES 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Premier Checking', 'depository', 'checking', 4238.60, 'Chase Bank', '0000'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Savings Account', 'depository', 'savings', 12847.30, 'Chase Bank', '1111'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Freedom Unlimited', 'credit', 'credit card', -1234.56, 'Chase Bank', '2222');

-- Insert demo transactions
INSERT INTO transactions (id, user_id, account_id, description, amount, merchant_name, category, date, location) VALUES 
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Whole Foods Market', -67.82, 'Whole Foods', '{"Food and Drink","Groceries"}', '2024-06-10 14:30:00', '{"city": "San Francisco", "region": "CA"}'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Uber ride downtown', -18.50, 'Uber', '{"Transportation"}', '2024-06-10 09:15:00', '{"city": "San Francisco", "region": "CA"}'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Dinner at The French Laundry', -234.56, 'The French Laundry', '{"Food and Drink","Restaurants"}', '2024-06-09 19:30:00', '{"city": "Yountville", "region": "CA"}'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Coffee shop downtown', -12.75, 'Blue Bottle Coffee', '{"Food and Drink","Coffee Shops"}', '2024-06-09 08:00:00', '{"city": "San Francisco", "region": "CA"}'),
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Gas station', -45.20, 'Shell', '{"Transportation","Gas Stations"}', '2024-06-08 16:45:00', '{"city": "San Francisco", "region": "CA"}'),
('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Monthly salary deposit', 4200.00, 'TechCorp Inc', '{"Payroll","Income"}', '2024-06-01 09:00:00', '{}'),
('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Netflix subscription', -15.99, 'Netflix', '{"Entertainment","Subscription Services"}', '2024-06-01 12:00:00', '{}'),
('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Grocery shopping', -89.34, 'Safeway', '{"Food and Drink","Groceries"}', '2024-06-07 14:22:00', '{"city": "San Francisco", "region": "CA"}'),
('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Gym membership', -79.99, 'Equinox', '{"Recreation","Gyms and Fitness Centers"}', '2024-06-01 06:00:00', '{"city": "San Francisco", "region": "CA"}'),
('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Online shopping', -156.78, 'Amazon', '{"Shops","Online Marketplaces"}', '2024-06-06 20:15:00', '{}');

-- Insert demo expense groups
INSERT INTO expense_groups (id, user_id, name, description, category, color) VALUES 
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Foodie Friends', 'Our regular dining group', 'dining', '#EF4444'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Commute Crew', 'Shared rides and transport', 'transport', '#3B82F6'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Roommates', 'Shared household expenses', 'household', '#10B981');

-- Insert demo group members
INSERT INTO group_members (group_id, user_id, name, email) VALUES 
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alex Johnson', 'alex@example.com'),
('30000000-0000-0000-0000-000000000001', NULL, 'Sarah Chen', 'sarah@example.com'),
('30000000-0000-0000-0000-000000000001', NULL, 'Mike Rodriguez', 'mike@example.com'),
('30000000-0000-0000-0000-000000000001', NULL, 'Lisa Park', 'lisa@example.com'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Alex Johnson', 'alex@example.com'),
('30000000-0000-0000-0000-000000000002', NULL, 'Sarah Chen', 'sarah@example.com'),
('30000000-0000-0000-0000-000000000002', NULL, 'David Kim', 'david@example.com'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Alex Johnson', 'alex@example.com'),
('30000000-0000-0000-0000-000000000003', NULL, 'Emma Wilson', 'emma@example.com'),
('30000000-0000-0000-0000-000000000003', NULL, 'James Brown', 'james@example.com');

-- Insert demo split suggestions
INSERT INTO split_suggestions (id, user_id, transaction_id, group_id, confidence, split_type, reasoning, participants, amounts, status) VALUES 
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 0.92, 'equal', 'This appears to be a restaurant expense that matches your dining group pattern', '["00000000-0000-0000-0000-000000000001", "sarah@example.com", "mike@example.com"]', '{"00000000-0000-0000-0000-000000000001": 78.19, "sarah@example.com": 78.19, "mike@example.com": 78.18}', 'pending');

-- Insert demo chat messages
INSERT INTO chat_messages (id, user_id, message, response, suggestions) VALUES 
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'How can I save money on dining out?', 'Based on your spending patterns, you spent $314.63 on dining last month. Here are some strategies to reduce this: 1) Set a monthly dining budget, 2) Cook more meals at home, 3) Look for restaurant deals and happy hours, 4) Share meals with friends to split costs.', '{"Set a dining budget", "Find cooking recipes", "Track restaurant spending", "Plan group dinners"}');

-- Create a view for transaction analytics
CREATE VIEW transaction_analytics AS
SELECT 
  t.user_id,
  DATE_TRUNC('month', t.date) as month,
  t.category[1] as primary_category,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_spent,
  SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_earned,
  AVG(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE NULL END) as avg_transaction_amount
FROM transactions t
GROUP BY t.user_id, DATE_TRUNC('month', t.date), t.category[1];

-- Grant permissions for the view
GRANT SELECT ON transaction_analytics TO anon, authenticated; 