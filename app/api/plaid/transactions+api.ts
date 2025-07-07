// Mock transaction data with AI categorization
const mockTransactions = [
  {
    id: 'txn_001',
    accountId: 'acc_checking_001',
    amount: -45.67,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'UBER TRIP 06/10',
    merchantName: 'Uber',
    category: ['Transportation', 'Ride Share'],
    subcategory: 'Ride Share',
    pending: false,
    location: {
      city: 'San Francisco',
      region: 'CA',
      country: 'US'
    },
    paymentChannel: 'online',
    confidence: 0.95,
    suggestedSplit: {
      participants: ['user_1', 'user_2'],
      amounts: { 'user_1': 22.84, 'user_2': 22.83 },
      confidence: 0.85
    }
  },
  {
    id: 'txn_002',
    accountId: 'acc_checking_001',
    amount: -127.45,
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    description: 'WHOLE FOODS MARKET',
    merchantName: 'Whole Foods Market',
    category: ['Food and Drink', 'Groceries'],
    subcategory: 'Groceries',
    pending: false,
    location: {
      city: 'San Francisco',
      region: 'CA',
      country: 'US'
    },
    paymentChannel: 'in store',
    confidence: 0.98
  },
  {
    id: 'txn_003',
    accountId: 'acc_checking_001',
    amount: -89.32,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    description: 'NETFLIX.COM',
    merchantName: 'Netflix',
    category: ['Entertainment', 'Streaming'],
    subcategory: 'Streaming Services',
    pending: false,
    paymentChannel: 'online',
    confidence: 0.99,
    suggestedSplit: {
      participants: ['user_1', 'user_2', 'user_3'],
      amounts: { 'user_1': 29.77, 'user_2': 29.77, 'user_3': 29.78 },
      confidence: 0.92
    }
  },
  {
    id: 'txn_004',
    accountId: 'acc_checking_001',
    amount: -234.56,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    description: 'RESTAURANT DINNER',
    merchantName: 'The French Laundry',
    category: ['Food and Drink', 'Restaurants'],
    subcategory: 'Fine Dining',
    pending: false,
    location: {
      city: 'Yountville',
      region: 'CA',
      country: 'US'
    },
    paymentChannel: 'in store',
    confidence: 0.97,
    suggestedSplit: {
      participants: ['user_1', 'user_2', 'user_3', 'user_4'],
      amounts: { 'user_1': 58.64, 'user_2': 58.64, 'user_3': 58.64, 'user_4': 58.64 },
      confidence: 0.88
    }
  },
  {
    id: 'txn_005',
    accountId: 'acc_savings_001',
    amount: 2500.00,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    description: 'PAYROLL DEPOSIT',
    merchantName: 'ACME CORP',
    category: ['Deposit', 'Payroll'],
    subcategory: 'Salary',
    pending: false,
    paymentChannel: 'other',
    confidence: 0.99
  },
  {
    id: 'txn_006',
    accountId: 'acc_credit_001',
    amount: -156.78,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'AMAZON.COM',
    merchantName: 'Amazon',
    category: ['Shops', 'Online'],
    subcategory: 'Online Shopping',
    pending: false,
    paymentChannel: 'online',
    confidence: 0.94
  }
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const accountId = url.searchParams.get('accountId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Filter transactions by account if specified
    let filteredTransactions = mockTransactions;
    if (accountId) {
      filteredTransactions = mockTransactions.filter(t => t.accountId === accountId);
    }

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    return new Response(JSON.stringify({
      success: true,
      transactions: paginatedTransactions,
      total: filteredTransactions.length,
      hasMore: offset + limit < filteredTransactions.length
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch transactions'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}