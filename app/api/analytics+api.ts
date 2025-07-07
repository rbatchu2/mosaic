export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '6M';

    // Mock analytics data - in production, calculate from real transactions
    const analytics = {
      totalSpent: 3456.78,
      totalSaved: 4238.60,
      monthlyGrowth: 12.5,
      savingsRate: 23,
      categories: [
        { name: 'Food & Dining', amount: 1245.50, percentage: 36, trend: '+5%', color: '#EF4444' },
        { name: 'Transportation', amount: 845.30, percentage: 24, trend: '-2%', color: '#0EA5E9' },
        { name: 'Entertainment', amount: 567.80, percentage: 16, trend: '+12%', color: '#10B981' },
        { name: 'Utilities', amount: 498.20, percentage: 14, trend: '+3%', color: '#F59E0B' },
        { name: 'Others', amount: 299.98, percentage: 10, trend: '-1%', color: '#6B7280' },
      ],
      monthlyTrends: [
        { month: 'Jan', amount: 2400, growth: 8, savings: 1800 },
        { month: 'Feb', amount: 2800, growth: 16, savings: 2100 },
        { month: 'Mar', amount: 3200, growth: 14, savings: 2400 },
        { month: 'Apr', amount: 2900, growth: -9, savings: 2200 },
        { month: 'May', amount: 3600, growth: 24, savings: 2700 },
        { month: 'Jun', amount: 4238, growth: 18, savings: 3200 },
      ],
      insights: [
        {
          title: 'Savings Rate',
          value: '+23%',
          description: 'Your savings rate improved this quarter',
          type: 'positive'
        },
        {
          title: 'Entertainment',
          value: '+15%',
          description: 'Above average spending this month',
          type: 'warning'
        },
        {
          title: 'Goal Progress',
          value: '2 months',
          description: 'Ahead of vacation goal schedule',
          type: 'positive'
        }
      ],
      period
    };

    return new Response(JSON.stringify({
      success: true,
      analytics
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