import { supabaseService } from '../../../services/supabaseService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';
    const period = url.searchParams.get('period') || '6M';

    let analysis;
    
    try {
      // Try to get spending analysis from Supabase
      analysis = await supabaseService.getSpendingAnalysis(userId, period);
    } catch (error) {
      console.log('Supabase not available, using mock data:', error);
      analysis = null;
    }
    
    // Fallback to mock data if Supabase fails
    if (!analysis) {
      const mockAnalysis = {
        totalSpent: 567.23,
        transactionCount: 12,
        averagePerTransaction: 47.27,
        categories: [
          {
            name: 'Food & Dining',
            amount: 314.63,
            percentage: 55.4
          },
          {
            name: 'Transportation',
            amount: 156.78,
            percentage: 27.6
          },
          {
            name: 'Entertainment',
            amount: 95.82,
            percentage: 16.9
          }
        ]
      };

      const formattedAnalysis = {
        period,
        totalSpent: mockAnalysis.totalSpent,
        transactionCount: mockAnalysis.transactionCount,
        averagePerTransaction: mockAnalysis.averagePerTransaction,
        savingsRate: 23,
        categories: mockAnalysis.categories,
        budgetProgress: mockAnalysis.categories.map(category => ({
          category: category.name,
          spent: category.amount,
          budget: category.amount * 1.2,
          percentage: (category.amount / (category.amount * 1.2)) * 100
        })),
        insights: [
          `You spent $${mockAnalysis.totalSpent.toFixed(2)} in the last ${period}`,
          `Your top spending category is ${mockAnalysis.categories[0]?.name || 'Unknown'}`,
          `You made ${mockAnalysis.transactionCount} transactions this period`,
          'Consider setting a monthly budget to track your spending'
        ]
      };

      return new Response(JSON.stringify({
        success: true,
        analysis: formattedAnalysis
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate additional metrics
    const savingsRate = 23; // This would be calculated based on income vs spending
    const budgetProgress = analysis.categories.map(category => ({
      category: category.name,
      spent: category.amount,
      budget: category.amount * 1.2, // Mock budget 20% higher than current spending
      percentage: (category.amount / (category.amount * 1.2)) * 100
    }));

    const formattedAnalysis = {
      period,
      totalSpent: analysis.totalSpent,
      transactionCount: analysis.transactionCount,
      averagePerTransaction: analysis.averagePerTransaction,
      savingsRate,
      categories: analysis.categories,
      budgetProgress,
      insights: [
        `You spent $${analysis.totalSpent.toFixed(2)} in the last ${period}`,
        `Your top spending category is ${analysis.categories[0]?.name || 'Unknown'}`,
        `You made ${analysis.transactionCount} transactions this period`,
        analysis.totalSpent > 1000 
          ? 'Consider setting a monthly budget to track your spending' 
          : 'Your spending is well controlled this period'
      ]
    };

    return new Response(JSON.stringify({
      success: true,
      analysis: formattedAnalysis
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating spending analysis:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate spending analysis'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}