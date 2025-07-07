import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Specific hooks for common API calls
export function useWallets() {
  return useApi(() => apiService.getWallets());
}

export function useWallet(id: string) {
  return useApi(() => apiService.getWallet(id), [id]);
}

export function useTransactions(walletId?: string, limit = 10) {
  return useApi(() => apiService.getTransactions(walletId, limit), [walletId, limit]);
}

export function useAnalytics(period = '6M') {
  return useApi(() => apiService.getAnalytics(period), [period]);
}

export function useUserProfile(userId?: string) {
  return useApi(() => apiService.getUserProfile(userId), [userId]);
}

export function useChatHistory(conversationId?: string) {
  return useApi(() => apiService.getChatHistory(conversationId), [conversationId]);
}