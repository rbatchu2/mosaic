export async function GET(request: Request, context?: any) {
  try {
    // Extract group ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const groupId = pathParts[pathParts.indexOf('group') + 1];
    
    if (!groupId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Group ID not found'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const mockTransactions = [
      {
        id: 'tx_001',
        description: 'Starbucks Coffee & Breakfast',
        amount: 47.85,
        date: '2024-01-20T08:30:00Z',
        paidBy: { id: '1', name: 'You' },
        category: 'dining',
        participants: [
          { id: '1', name: 'You', amount: 15.95 },
          { id: '2', name: 'Sarah', amount: 15.95 },
          { id: '3', name: 'Mike', amount: 15.95 }
        ],
        status: 'completed',
        groupId
      },
      {
        id: 'tx_002',
        description: 'Le Bernardin Fine Dining',
        amount: 380.50,
        date: '2024-01-17T20:30:00Z',
        paidBy: { id: '1', name: 'You' },
        category: 'dining',
        participants: [
          { id: '1', name: 'You', amount: 95.13 },
          { id: '2', name: 'Sarah', amount: 95.13 },
          { id: '3', name: 'Mike', amount: 95.12 },
          { id: '4', name: 'Emma', amount: 95.12 }
        ],
        status: 'pending',
        groupId,
        aiSuggested: true,
        confidence: 0.94,
        location: 'Le Bernardin, NYC'
      },
      {
        id: 'tx_003',
        description: 'Uber Pool to JFK Airport',
        amount: 85.40,
        date: '2024-01-19T05:30:00Z',
        paidBy: { id: '2', name: 'Sarah' },
        category: 'transport',
        participants: [
          { id: '1', name: 'You', amount: 28.47 },
          { id: '2', name: 'Sarah', amount: 28.47 },
          { id: '3', name: 'Mike', amount: 28.46 }
        ],
        status: 'pending',
        groupId,
        aiSuggested: true,
        confidence: 0.89
      },
      {
        id: 'tx_004',
        description: 'Whole Foods Groceries',
        amount: 127.34,
        date: '2024-01-18T16:45:00Z',
        paidBy: { id: '2', name: 'Sarah' },
        category: 'household',
        participants: [
          { id: '1', name: 'You', amount: 42.45 },
          { id: '2', name: 'Sarah', amount: 42.45 },
          { id: '3', name: 'Mike', amount: 42.44 }
        ],
        status: 'completed',
        groupId
      },
      {
        id: 'tx_005',
        description: 'Food Delivery - Thai Garden',
        amount: 67.20,
        date: '2024-01-12T19:15:00Z',
        paidBy: { id: '3', name: 'Mike' },
        category: 'dining',
        participants: [
          { id: '1', name: 'You', amount: 16.80 },
          { id: '2', name: 'Sarah', amount: 16.80 },
          { id: '3', name: 'Mike', amount: 16.80 },
          { id: '4', name: 'Emma', amount: 16.80 }
        ],
        status: 'completed',
        groupId,
        deliveryApp: 'DoorDash'
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      transactions: mockTransactions
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching group transactions:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch group transactions'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 