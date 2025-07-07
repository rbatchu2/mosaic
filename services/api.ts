// API service layer for frontend-backend communication

import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'web' && typeof window !== 'undefined' 
  ? window.location.origin 
  : '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'An error occurred';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      return {
        success: data.success !== false,
        data: data,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Wallet endpoints
  async getWallets() {
    return this.request('/api/wallets');
  }

  async getWallet(id: string) {
    return this.request(`/api/wallets?id=${id}`);
  }

  async createWallet(walletData: any) {
    return this.request('/api/wallets', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  async updateWallet(id: string, updates: any) {
    return this.request('/api/wallets', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async deleteWallet(id: string) {
    return this.request(`/api/wallets?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Transaction endpoints
  async getTransactions(walletId?: string, limit = 10, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (walletId) params.append('walletId', walletId);

    return this.request(`/api/transactions?${params}`);
  }

  async createTransaction(transactionData: any) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Analytics endpoints
  async getAnalytics(period = '6M') {
    return this.request(`/api/analytics?period=${period}`);
  }

  // Chat endpoints
  async sendChatMessage(message: string, conversationId?: string) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  async getChatHistory(conversationId?: string) {
    const params = conversationId ? `?conversationId=${conversationId}` : '';
    return this.request(`/api/chat${params}`);
  }

  // User profile endpoints
  async getUserProfile(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/api/users/profile${params}`);
  }

  async updateUserProfile(userId: string, updates: any) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ userId, ...updates }),
    });
  }

  // Bill splitting endpoints
  async splitBill(billData: any) {
    return this.request('/api/bills/split', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  }

  async getBillSplits(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/api/bills/split${params}`);
  }

  // Trip planning endpoints
  async generateTripSuggestions(preferences: any) {
    return this.request('/api/trips/suggestions', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async bookTrip(tripData: any) {
    return this.request('/api/trips/book', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async processPayment(paymentData: any) {
    return this.request('/api/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;