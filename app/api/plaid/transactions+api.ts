import { supabaseService } from '../../../services/supabaseService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';
    const accountId = url.searchParams.get('accountId') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let transactions;
    
    try {
      // Try to fetch transactions from Supabase
      transactions = await supabaseService.getTransactions(userId, accountId, limit);
    } catch (error) {
      console.log('Supabase not available, using mock data:', error);
      transactions = null;
    }
    
    // Fallback to mock data if Supabase fails
    if (!transactions || transactions.length === 0) {
      const mockTransactions = [
        {
          id: 'txn_001',
          description: 'Whole Foods Market',
          amount: -67.82,
          merchantName: 'Whole Foods',
          category: ['Food and Drink', 'Groceries'],
          date: '2024-06-10T14:30:00Z',
          location: { city: 'San Francisco', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_002',
          description: 'Uber ride downtown',
          amount: -18.50,
          merchantName: 'Uber',
          category: ['Transportation'],
          date: '2024-06-10T09:15:00Z',
          location: { city: 'San Francisco', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_003',
          description: 'Dinner at The French Laundry',
          amount: -234.56,
          merchantName: 'The French Laundry',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-06-09T19:30:00Z',
          location: { city: 'Yountville', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_004',
          description: 'Coffee shop downtown',
          amount: -12.75,
          merchantName: 'Blue Bottle Coffee',
          category: ['Food and Drink', 'Coffee Shops'],
          date: '2024-06-09T08:00:00Z',
          location: { city: 'San Francisco', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_005',
          description: 'Monthly salary deposit',
          amount: 4200.00,
          merchantName: 'TechCorp Inc',
          category: ['Payroll', 'Income'],
          date: '2024-06-01T09:00:00Z',
          location: {},
          accountId: 'acc_checking_001'
        }
      ];

      return new Response(JSON.stringify({
        success: true,
        transactions: mockTransactions,
        total: mockTransactions.length
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Transform database format to API format
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      merchantName: transaction.merchant_name,
      category: transaction.category,
      date: transaction.date,
      location: transaction.location,
      accountId: transaction.account_id
    }));

    return new Response(JSON.stringify({
      success: true,
      transactions: formattedTransactions,
      total: formattedTransactions.length
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch transactions'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}