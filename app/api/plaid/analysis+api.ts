export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const period = url.searchParams.get('period') || '30d';

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI-powered spending analysis
    const analysis = {
      period,
      totalSpent: 1456.78,
      totalIncome: 2500.00,
      netCashFlow: 1043.22,
      savingsRate: 41.7,
      categories: [
        {
          name: 'Food & Dining',
          amount: 567.23,
          percentage: 38.9,
          transactions: 12,
          trend: '+15%',
          avgPerTransaction: 47.27,
          color: '#EF4444',
          subcategories: [
            { name: 'Restaurants', amount: 334.56, count: 7 },
            { name: 'Groceries', amount: 232.67, count: 5 }
          ]
        },
        {
          name: 'Transportation',
          amount: 234.56,
          percentage: 16.1,
          transactions: 8,
          trend: '+8%',
          avgPerTransaction: 29.32,
          color: '#0EA5E9',
          subcategories: [
            { name: 'Ride Share', amount: 156.78, count: 6 },
            { name: 'Gas', amount: 77.78, count: 2 }
          ]
        },
        {
          name: 'Entertainment',
          amount: 189.32,
          percentage: 13.0,
          transactions: 4,
          trend: '-5%',
          avgPerTransaction: 47.33,
          color: '#10B981',
          subcategories: [
            { name: 'Streaming', amount: 89.32, count: 2 },
            { name: 'Movies', amount: 100.00, count: 2 }
          ]
        },
        {
          name: 'Shopping',
          amount: 465.67,
          percentage: 32.0,
          transactions: 6,
          trend: '+22%',
          avgPerTransaction: 77.61,
          color: '#F59E0B',
          subcategories: [
            { name: 'Online Shopping', amount: 356.78, count: 4 },
            { name: 'Clothing', amount: 108.89, count: 2 }
          ]
        }
      ],
      insights: [
        {
          type: 'spending_spike',
          title: 'Dining Spending Up',
          description: 'Your restaurant spending increased 15% this month',
          impact: 'high',
          suggestion: 'Consider setting a dining budget of $400/month',
          amount: 85.34
        },
        {
          type: 'savings_opportunity',
          title: 'Subscription Optimization',
          description: 'You have 3 streaming services costing $89/month',
          impact: 'medium',
          suggestion: 'Cancel unused subscriptions to save $30/month',
          amount: 30.00
        },
        {
          type: 'split_suggestion',
          title: 'Splittable Expenses',
          description: '4 transactions could be split with friends',
          impact: 'medium',
          suggestion: 'Split group expenses to save $156 this month',
          amount: 156.78
        }
      ],
      monthlyTrends: [
        { month: 'Jan', spending: 1234, income: 2500, savings: 1266 },
        { month: 'Feb', spending: 1456, income: 2500, savings: 1044 },
        { month: 'Mar', spending: 1345, income: 2500, savings: 1155 },
        { month: 'Apr', spending: 1567, income: 2500, savings: 933 },
        { month: 'May', spending: 1234, income: 2500, savings: 1266 },
        { month: 'Jun', spending: 1457, income: 2500, savings: 1043 }
      ],
      budgetRecommendations: {
        dining: { current: 567, recommended: 400, difference: -167 },
        transportation: { current: 235, recommended: 300, difference: 65 },
        entertainment: { current: 189, recommended: 200, difference: 11 },
        shopping: { current: 466, recommended: 350, difference: -116 }
      }
    };

    return new Response(JSON.stringify({
      success: true,
      analysis
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate analysis'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}