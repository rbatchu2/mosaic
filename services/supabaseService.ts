import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Environment configuration for Supabase
const getSupabaseConfig = () => {
  const url = Platform.OS === 'web' 
    ? (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL)
    : process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  const anonKey = Platform.OS === 'web'
    ? (process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
    : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase URL and anonymous key are required. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
  }

  return { url, anonKey };
};

// Initialize Supabase client
let supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    const config = getSupabaseConfig();
    supabase = createClient(config.url, config.anonKey);
  }
  return supabase;
};

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  member_since: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  institution: string;
  mask: string;
  plaid_account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  merchant_name?: string;
  category: string[];
  date: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
  };
  plaid_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseGroup {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface SplitSuggestion {
  id: string;
  user_id: string;
  transaction_id: string;
  group_id?: string;
  confidence: number;
  split_type: 'equal' | 'custom' | 'percentage';
  reasoning: string;
  participants: any;
  amounts: any;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  suggestions?: string[];
  created_at: string;
}

// Database Service Class
class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  // User Operations
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  // Account Operations
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await this.client
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }

    return data || [];
  }

  async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account | null> {
    const { data, error } = await this.client
      .from('accounts')
      .insert([account])
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      return null;
    }

    return data;
  }

  // Transaction Operations
  async getTransactions(userId: string, accountId?: string, limit: number = 50): Promise<Transaction[]> {
    let query = this.client
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data, error } = await query
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction | null> {
    const { data, error } = await this.client
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    return data;
  }

  // Expense Group Operations
  async getExpenseGroups(userId: string): Promise<ExpenseGroup[]> {
    const { data, error } = await this.client
      .from('expense_groups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expense groups:', error);
      return [];
    }

    return data || [];
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await this.client
      .from('group_members')
      .select('*')
      .eq('group_id', groupId);

    if (error) {
      console.error('Error fetching group members:', error);
      return [];
    }

    return data || [];
  }

  async createExpenseGroup(group: Omit<ExpenseGroup, 'id' | 'created_at' | 'updated_at'>): Promise<ExpenseGroup | null> {
    const { data, error } = await this.client
      .from('expense_groups')
      .insert([group])
      .select()
      .single();

    if (error) {
      console.error('Error creating expense group:', error);
      return null;
    }

    return data;
  }

  // Split Suggestion Operations
  async getSplitSuggestions(userId: string): Promise<SplitSuggestion[]> {
    const { data, error } = await this.client
      .from('split_suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching split suggestions:', error);
      return [];
    }

    return data || [];
  }

  async createSplitSuggestion(suggestion: Omit<SplitSuggestion, 'id' | 'created_at' | 'updated_at'>): Promise<SplitSuggestion | null> {
    const { data, error } = await this.client
      .from('split_suggestions')
      .insert([suggestion])
      .select()
      .single();

    if (error) {
      console.error('Error creating split suggestion:', error);
      return null;
    }

    return data;
  }

  async updateSplitSuggestion(id: string, updates: Partial<SplitSuggestion>): Promise<SplitSuggestion | null> {
    const { data, error } = await this.client
      .from('split_suggestions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating split suggestion:', error);
      return null;
    }

    return data;
  }

  // Chat Operations
  async getChatHistory(userId: string, limit: number = 20): Promise<ChatMessage[]> {
    const { data, error } = await this.client
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }

    return data || [];
  }

  async saveChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage | null> {
    const { data, error } = await this.client
      .from('chat_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error saving chat message:', error);
      return null;
    }

    return data;
  }

  // Analytics
  async getSpendingAnalysis(userId: string, period: string = '6M') {
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    const { data: transactions, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', now.toISOString());

    if (error) {
      console.error('Error fetching spending analysis:', error);
      return null;
    }

    // Process transactions for analysis
    const totalSpent = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categorySpending = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const category = t.category[0] || 'Other';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const categories = Object.entries(categorySpending)
      .map(([name, amount]) => ({
        name,
        amount: amount as number,
        percentage: ((amount as number) / totalSpent) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSpent,
      period,
      transactionCount: transactions.length,
      categories,
      averagePerTransaction: totalSpent / transactions.filter(t => t.amount < 0).length || 0
    };
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService; 