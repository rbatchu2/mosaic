export async function GET(request: Request, context?: any) {
  try {
    // Extract group ID from URL path
    const requestUrl = new URL(request.url);
    const pathParts = requestUrl.pathname.split('/');
    const groupId = pathParts[pathParts.indexOf('group') + 1];
    
    // Generate rich split request data based on group type
    const generateSplitRequestsForGroup = (groupId: string) => {
      const baseSplits = [
        {
          id: 'split_001',
          transactionId: 'tx_001',
          description: 'Starbucks Coffee & Breakfast',
          amount: 47.85,
          requestedBy: { id: '1', name: 'You' },
          status: 'accepted',
          participants: [
            { id: '1', name: 'You', amount: 15.95, status: 'accepted' },
            { id: '2', name: 'Sarah', amount: 15.95, status: 'accepted' },
            { id: '3', name: 'Mike', amount: 15.95, status: 'accepted' }
          ],
          createdAt: '2024-01-20T08:35:00Z',
          updatedAt: '2024-01-20T09:15:00Z',
          category: 'dining',
          splitType: 'equal',
          notes: 'Morning coffee run before work',
          aiSuggested: true,
          confidence: 0.87,
          groupId
        }
      ];

      if (groupId.includes('dining') || groupId === '30000000-0000-0000-0000-000000000001') {
        return [
          ...baseSplits,
          {
            id: 'split_002',
            transactionId: 'tx_004',
            description: 'Michelin Star Dinner at Le Bernardin',
            amount: 380.50,
            requestedBy: { id: '1', name: 'You' },
            status: 'pending',
            participants: [
              { id: '1', name: 'You', amount: 95.13, status: 'accepted' },
              { id: '2', name: 'Sarah', amount: 95.13, status: 'pending' },
              { id: '3', name: 'Mike', amount: 95.12, status: 'pending' },
              { id: '4', name: 'Emma', amount: 95.12, status: 'pending' }
            ],
            createdAt: '2024-01-17T20:45:00Z',
            updatedAt: '2024-01-17T20:45:00Z',
            category: 'dining',
            splitType: 'equal',
            notes: 'Special celebration dinner - amazing tasting menu! 🍽️✨',
            aiSuggested: true,
            confidence: 0.94,
            receipt: {
              imageUrl: 'https://example.com/receipt-lebernadin.jpg',
              items: [
                { name: 'Tasting Menu (4x)', amount: 320.00 },
                { name: 'Wine Pairing (2x)', amount: 45.50 },
                { name: 'Tax & Service', amount: 15.00 }
              ]
            },
            location: { lat: 40.7614, lng: -73.9776, name: 'Le Bernardin, NYC' },
            groupId
          },
          {
            id: 'split_003',
            transactionId: 'tx_006',
            description: 'Food Delivery - Thai Garden',
            amount: 67.20,
            requestedBy: { id: '3', name: 'Mike' },
            status: 'pending',
            participants: [
              { id: '1', name: 'You', amount: 16.80, status: 'pending' },
              { id: '2', name: 'Sarah', amount: 16.80, status: 'accepted' },
              { id: '3', name: 'Mike', amount: 16.80, status: 'accepted' },
              { id: '4', name: 'Emma', amount: 16.80, status: 'pending' }
            ],
            createdAt: '2024-01-12T19:20:00Z',
            updatedAt: '2024-01-12T19:45:00Z',
            category: 'dining',
            splitType: 'equal',
            notes: 'Friday night takeout - everyone ordered!',
            aiSuggested: true,
            confidence: 0.91,
            deliveryInfo: {
              app: 'DoorDash',
              deliveryFee: 4.99,
              tip: 8.21,
              estimatedDelivery: '45-60 min'
            },
            groupId
          },
          {
            id: 'split_004',
            transactionId: 'tx_005',
            description: 'Weekend Brunch at Bluestone Lane',
            amount: 89.75,
            requestedBy: { id: '2', name: 'Sarah' },
            status: 'accepted',
            participants: [
              { id: '1', name: 'You', amount: 22.44, status: 'accepted' },
              { id: '2', name: 'Sarah', amount: 22.44, status: 'accepted' },
              { id: '3', name: 'Mike', amount: 22.44, status: 'accepted' },
              { id: '4', name: 'Emma', amount: 22.43, status: 'accepted' }
            ],
            createdAt: '2024-01-14T11:15:00Z',
            updatedAt: '2024-01-14T13:30:00Z',
            category: 'dining',
            splitType: 'equal',
            notes: 'Perfect weekend brunch! ☕🥞',
            aiSuggested: false,
            groupId
          }
        ];
      } else if (groupId.includes('transport') || groupId === '30000000-0000-0000-0000-000000000002') {
        return [
          ...baseSplits,
          {
            id: 'split_005',
            transactionId: 'tx_007',
            description: 'Uber Pool to JFK Airport',
            amount: 85.40,
            requestedBy: { id: '2', name: 'Sarah' },
            status: 'pending',
            participants: [
              { id: '1', name: 'You', amount: 28.47, status: 'pending' },
              { id: '2', name: 'Sarah', amount: 28.47, status: 'accepted' },
              { id: '3', name: 'Mike', amount: 28.46, status: 'pending' }
            ],
            createdAt: '2024-01-19T05:45:00Z',
            updatedAt: '2024-01-19T05:45:00Z',
            category: 'transport',
            splitType: 'equal',
            notes: 'Airport ride for our flight to Miami ✈️',
            aiSuggested: true,
            confidence: 0.89,
            tripDetails: {
              pickup: 'Manhattan, NY',
              dropoff: 'JFK Terminal 4',
              distance: '17.2 miles',
              duration: '52 minutes',
              surge: '1.2x'
            },
            groupId
          },
          {
            id: 'split_006',
            transactionId: 'tx_008',
            description: 'Gas for Road Trip to Boston',
            amount: 78.90,
            requestedBy: { id: '1', name: 'You' },
            status: 'accepted',
            participants: [
              { id: '1', name: 'You', amount: 26.30, status: 'accepted' },
              { id: '2', name: 'Sarah', amount: 26.30, status: 'accepted' },
              { id: '3', name: 'Mike', amount: 26.30, status: 'accepted' }
            ],
            createdAt: '2024-01-16T14:25:00Z',
            updatedAt: '2024-01-16T16:40:00Z',
            category: 'transport',
            splitType: 'equal',
            notes: 'Gas for our awesome Boston weekend!',
            aiSuggested: false,
            tripDetails: {
              vehicle: '2023 Honda Civic',
              fuelType: 'Regular',
              gallons: 18.5,
              station: 'Shell - Route 95'
            },
            groupId
          }
        ];
      } else {
        return [
          ...baseSplits,
          {
            id: 'split_007',
            transactionId: 'tx_009',
            description: 'Household Cleaning Supplies',
            amount: 94.67,
            requestedBy: { id: '1', name: 'You' },
            status: 'pending',
            participants: [
              { id: '1', name: 'You', amount: 31.56, status: 'accepted' },
              { id: '2', name: 'Sarah', amount: 31.56, status: 'pending' },
              { id: '3', name: 'Mike', amount: 31.55, status: 'pending' }
            ],
            createdAt: '2024-01-16T14:00:00Z',
            updatedAt: '2024-01-16T14:00:00Z',
            category: 'household',
            splitType: 'equal',
            notes: 'Monthly supply run - everyone benefits!',
            aiSuggested: true,
            confidence: 0.85,
            items: [
              'Laundry detergent',
              'Paper towels',
              'Dish soap',
              'Toilet paper',
              'All-purpose cleaner'
            ],
            groupId
          }
        ];
      }
    };

    const mockSplitRequests = generateSplitRequestsForGroup(groupId);

    // Filter splits by status if requested
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    
    let filteredSplits = mockSplitRequests;
    if (statusFilter) {
      filteredSplits = mockSplitRequests.filter(split => split.status === statusFilter);
    }

    // Calculate summary stats
    const pendingSplits = mockSplitRequests.filter(s => s.status === 'pending').length;
    const totalSplitAmount = mockSplitRequests.reduce((sum, split) => sum + split.amount, 0);
    const yourPendingAmount = mockSplitRequests
      .filter(s => s.status === 'pending')
      .reduce((sum, split) => {
        const yourParticipation = split.participants.find(p => p.name === 'You');
        return sum + (yourParticipation?.amount || 0);
      }, 0);

    return new Response(JSON.stringify({
      success: true,
      splits: filteredSplits,
      summary: {
        totalSplits: mockSplitRequests.length,
        pendingSplits,
        acceptedSplits: mockSplitRequests.filter(s => s.status === 'accepted').length,
        rejectedSplits: mockSplitRequests.filter(s => s.status === 'rejected').length,
        totalSplitAmount,
        yourPendingAmount,
        avgSplitAmount: totalSplitAmount / mockSplitRequests.length
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching group splits:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch group splits'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request, context?: any) {
  try {
    // Extract group ID from URL path
    const requestUrl = new URL(request.url);
    const pathParts = requestUrl.pathname.split('/');
    const groupId = pathParts[pathParts.indexOf('group') + 1];
    const { action, splitId, userId } = await request.json();

    // In a real app, this would update the split request in Supabase
    if (action === 'accept' || action === 'reject') {
      return new Response(JSON.stringify({
        success: true,
        message: `Split request ${action}ed successfully`,
        splitId,
        action,
        updatedAt: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error updating split request:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update split request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 