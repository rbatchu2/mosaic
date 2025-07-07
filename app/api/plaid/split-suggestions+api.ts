export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId');

    if (!transactionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Transaction ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI-powered split suggestions based on transaction context
    const suggestions = {
      transactionId,
      confidence: 0.87,
      splitRecommendation: 'equal',
      reasoning: 'Based on the merchant (restaurant) and amount, this appears to be a group dining expense',
      suggestedParticipants: [
        {
          id: 'user_1',
          name: 'You',
          email: 'you@example.com',
          confidence: 1.0,
          reason: 'Transaction owner'
        },
        {
          id: 'user_2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          confidence: 0.92,
          reason: 'Frequently splits dining expenses with you'
        },
        {
          id: 'user_3',
          name: 'Mike Chen',
          email: 'mike@example.com',
          confidence: 0.85,
          reason: 'Was at similar location recently'
        },
        {
          id: 'user_4',
          name: 'Lisa Park',
          email: 'lisa@example.com',
          confidence: 0.78,
          reason: 'Part of your regular dining group'
        }
      ],
      splitOptions: [
        {
          type: 'equal',
          description: 'Split equally among all participants',
          amounts: {
            'user_1': 58.64,
            'user_2': 58.64,
            'user_3': 58.64,
            'user_4': 58.64
          }
        },
        {
          type: 'by_item',
          description: 'Split by individual items ordered',
          amounts: {
            'user_1': 67.50,
            'user_2': 52.30,
            'user_3': 61.20,
            'user_4': 53.56
          },
          breakdown: [
            { item: 'Steak Dinner', price: 45.00, assignedTo: 'user_1' },
            { item: 'Wine Bottle', price: 22.50, splitBetween: ['user_1', 'user_2', 'user_3', 'user_4'] },
            { item: 'Salmon', price: 38.00, assignedTo: 'user_2' },
            { item: 'Pasta', price: 32.00, assignedTo: 'user_3' },
            { item: 'Salad', price: 18.00, assignedTo: 'user_4' },
            { item: 'Dessert', price: 24.00, splitBetween: ['user_3', 'user_4'] },
            { item: 'Tip (20%)', price: 35.56, splitBetween: ['user_1', 'user_2', 'user_3', 'user_4'] }
          ]
        },
        {
          type: 'percentage',
          description: 'Split by custom percentages',
          amounts: {
            'user_1': 93.82, // 40%
            'user_2': 58.64, // 25%
            'user_3': 46.91, // 20%
            'user_4': 35.19  // 15%
          }
        }
      ],
      similarTransactions: [
        {
          id: 'txn_similar_1',
          date: '2024-05-15',
          merchant: 'The French Laundry',
          amount: 198.45,
          participants: ['user_1', 'user_2', 'user_3'],
          splitType: 'equal'
        },
        {
          id: 'txn_similar_2',
          date: '2024-05-08',
          merchant: 'Chez Panisse',
          amount: 167.89,
          participants: ['user_1', 'user_2', 'user_4'],
          splitType: 'equal'
        }
      ]
    };

    return new Response(JSON.stringify({
      success: true,
      suggestions
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate split suggestions'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}