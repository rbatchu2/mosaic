// Mock database - in production, use a real database
let wallets = [
  {
    id: '1',
    name: 'Vacation Fund',
    balance: 2847.50,
    goal: 5000,
    members: [
      { id: '1', name: 'You', contribution: 800, avatar: 'Y', color: '#0EA5E9' },
      { id: '2', name: 'Sarah', contribution: 950, avatar: 'S', color: '#059669' },
      { id: '3', name: 'Mike', contribution: 697.50, avatar: 'M', color: '#D97706' },
      { id: '4', name: 'Lisa', contribution: 400, avatar: 'L', color: '#DC2626' },
    ],
    recentTransactions: [
      { id: '1', description: 'Sarah added funds', amount: 200, type: 'in', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), category: 'deposit' },
      { id: '2', description: 'Hotel booking', amount: -450, type: 'out', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), category: 'accommodation' },
      { id: '3', description: 'Flight tickets', amount: -680, type: 'out', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), category: 'transport' },
    ],
    color: '#0EA5E9',
    category: 'Travel',
    deadline: '2024-07-15',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10'
  },
  {
    id: '2',
    name: 'House Expenses',
    balance: 1234.80,
    goal: 2000,
    members: [
      { id: '1', name: 'You', contribution: 500, avatar: 'Y', color: '#0EA5E9' },
      { id: '5', name: 'Emma', contribution: 434.80, avatar: 'E', color: '#10B981' },
      { id: '6', name: 'James', contribution: 300, avatar: 'J', color: '#0891B2' },
    ],
    recentTransactions: [
      { id: '4', description: 'Rent payment', amount: -800, type: 'out', date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), category: 'rent' },
      { id: '5', description: 'Utilities', amount: -120, type: 'out', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), category: 'utilities' },
      { id: '6', description: 'Groceries', amount: -85, type: 'out', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), category: 'food' },
    ],
    color: '#059669',
    category: 'Living',
    deadline: '2024-06-30',
    createdAt: '2024-02-01',
    updatedAt: '2024-06-09'
  },
  {
    id: '3',
    name: 'Dinner Club',
    balance: 156.30,
    goal: 500,
    members: [
      { id: '1', name: 'You', contribution: 50, avatar: 'Y', color: '#0EA5E9' },
      { id: '7', name: 'Alex', contribution: 40, avatar: 'A', color: '#D97706' },
      { id: '8', name: 'Sam', contribution: 35, avatar: 'S', color: '#DC2626' },
      { id: '9', name: 'Jordan', contribution: 31.30, avatar: 'J', color: '#10B981' },
    ],
    recentTransactions: [
      { id: '7', description: 'Mike added funds', amount: 50, type: 'in', date: new Date(Date.now() - 60 * 60 * 1000).toISOString(), category: 'deposit' },
      { id: '8', description: 'Restaurant dinner', amount: -120, type: 'out', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), category: 'dining' },
    ],
    color: '#DC2626',
    category: 'Social',
    deadline: '2024-06-20',
    createdAt: '2024-03-01',
    updatedAt: '2024-06-08'
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const walletId = url.searchParams.get('id');

    if (walletId) {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Wallet not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      return new Response(JSON.stringify({
        success: true,
        wallet
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      wallets
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
    const { name, goal, category, deadline, members } = await request.json();

    const newWallet = {
      id: (wallets.length + 1).toString(),
      name,
      balance: 0,
      goal,
      members: members || [
        { id: '1', name: 'You', contribution: 0, avatar: 'Y', color: '#0EA5E9' }
      ],
      recentTransactions: [],
      color: '#0EA5E9',
      category,
      deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    wallets.push(newWallet);

    return new Response(JSON.stringify({
      success: true,
      wallet: newWallet
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

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();

    const walletIndex = wallets.findIndex(w => w.id === id);
    if (walletIndex === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Wallet not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    wallets[walletIndex] = {
      ...wallets[walletIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      wallet: wallets[walletIndex]
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const walletId = url.searchParams.get('id');

    if (!walletId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Wallet ID required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const walletIndex = wallets.findIndex(w => w.id === walletId);
    if (walletIndex === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Wallet not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    wallets.splice(walletIndex, 1);

    return new Response(JSON.stringify({
      success: true,
      message: 'Wallet deleted'
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