import { useState, useEffect } from 'react';
import { plaidService } from '../services/plaidService';

interface UsePlaidState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlaid<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
): UsePlaidState<T> {
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

// Specific hooks for Plaid API calls
export function usePlaidAccounts(userId: string) {
  return usePlaid(() => plaidService.getAccounts(userId), [userId]);
}

export function usePlaidTransactions(userId: string, accountId?: string, limit = 50) {
  return usePlaid(() => plaidService.getTransactions(userId, accountId, limit), [userId, accountId, limit]);
}

export function useSpendingAnalysis(userId: string, period = '30d') {
  return usePlaid(() => plaidService.getSpendingAnalysis(userId, period), [userId, period]);
}

export function useSpendingInsights(userId: string) {
  return usePlaid(() => plaidService.getSpendingInsights(userId), [userId]);
}