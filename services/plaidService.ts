// Plaid integration service for real-time transaction fetching
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'web' && typeof window !== 'undefined' 
  ? window.location.origin 
  : '';

interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  institution: string;
  mask: string;
}

interface PlaidTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  merchantName?: string;
  category: string[];
  subcategory?: string;
  pending: boolean;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  paymentChannel: string;
  confidence?: number;
  suggestedSplit?: {
    participants: string[];
    amounts: { [userId: string]: number };
    confidence: number;
  };
}

interface PlaidLinkResult {
  publicToken: string;
  metadata: {
    institution: {
      name: string;
      institution_id: string;
    };
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      subtype: string;
    }>;
  };
}

class PlaidService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Request failed',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Plaid Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Initialize Plaid Link for account connection
  async createLinkToken(userId: string) {
    return this.request('/api/plaid/link-token', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Exchange public token for access token
  async exchangePublicToken(publicToken: string, userId: string) {
    return this.request('/api/plaid/exchange-token', {
      method: 'POST',
      body: JSON.stringify({ publicToken, userId }),
    });
  }

  // Get connected accounts
  async getAccounts(userId: string) {
    return this.request<{ accounts: PlaidAccount[] }>(`/api/plaid/accounts?userId=${userId}`);
  }

  // Get real-time transactions
  async getTransactions(userId: string, accountId?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (accountId) params.append('accountId', accountId);

    return this.request<{ transactions: PlaidTransaction[]; total: number }>(`/api/plaid/transactions?${params}`);
  }

  // Get categorized spending analysis
  async getSpendingAnalysis(userId: string, period = '30d') {
    return this.request(`/api/plaid/analysis?userId=${userId}&period=${period}`);
  }

  // AI-powered transaction categorization
  async categorizeTransaction(transactionId: string, category: string, subcategory?: string) {
    return this.request('/api/plaid/categorize', {
      method: 'POST',
      body: JSON.stringify({ transactionId, category, subcategory }),
    });
  }

  // Smart bill splitting suggestions
  async getSplitSuggestions(transactionId: string) {
    return this.request(`/api/plaid/split-suggestions?transactionId=${transactionId}`);
  }

  // Create split from transaction
  async createSplitFromTransaction(transactionId: string, participants: string[], splitType: 'equal' | 'custom', customAmounts?: { [userId: string]: number }) {
    return this.request('/api/plaid/create-split', {
      method: 'POST',
      body: JSON.stringify({ transactionId, participants, splitType, customAmounts }),
    });
  }

  // Get spending insights and patterns
  async getSpendingInsights(userId: string) {
    return this.request(`/api/plaid/insights?userId=${userId}`);
  }

  // Set up spending alerts and budgets
  async setBudgetAlert(userId: string, category: string, limit: number, period: 'weekly' | 'monthly') {
    return this.request('/api/plaid/budget-alerts', {
      method: 'POST',
      body: JSON.stringify({ userId, category, limit, period }),
    });
  }

  // Disconnect account
  async disconnectAccount(userId: string, accountId: string) {
    return this.request('/api/plaid/disconnect', {
      method: 'POST',
      body: JSON.stringify({ userId, accountId }),
    });
  }
}

export const plaidService = new PlaidService();
export default plaidService;