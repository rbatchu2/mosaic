// Mock transaction database
let transactions = [
  {
    id: '1',
    walletId: '1',
    description: 'Sarah added funds',
    amount: 200,
    type: 'in',
    category: 'deposit',
    userId: '2',
    userName: 'Sarah',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    walletId: '1',
    description: 'Hotel booking',
    amount: -450,
    type: 'out',
    category: 'accommodation',
    userId: '1',
    userName: 'You',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    walletId: '2',
    description: 'Rent payment',
    amount: -800,
    type: 'out',
    category: 'rent',
    userId: '1',
    userName: 'You',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    walletId: '3',
    description: 'Mike added funds',
    amount: 50,
    type: 'in',
    category: 'deposit',
    userId: '3',
    userName: 'Mike',
    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const walletId = url.searchParams.get('walletId');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let filteredTransactions = transactions;

    if (walletId) {
      filteredTransactions = transactions.filter(t => t.walletId === walletId);
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
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const { walletId, description, amount, category, userId, userName } = await request.json();

    if (!walletId || !description || amount === undefined) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const newTransaction = {
      id: (transactions.length + 1).toString(),
      walletId,
      description,
      amount: parseFloat(amount),
      type: amount > 0 ? 'in' : 'out',
      category: category || 'general',
      userId: userId || '1',
      userName: userName || 'You',
      date: new Date().toISOString(),
    };

    transactions.push(newTransaction);

    return new Response(JSON.stringify({
      success: true,
      transaction: newTransaction
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}