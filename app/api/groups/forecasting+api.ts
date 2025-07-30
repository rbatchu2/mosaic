// AI-Powered Group Budget Forecasting API
// Generates predictive analytics for group spending and savings

import { openaiService } from '../../../services/openaiService';

interface GroupForecast {
  groupId: string;
  groupName: string;
  forecastPeriod: '1M' | '3M' | '6M' | '1Y';
  generatedAt: string;
  cashFlow: {
    projectedIncome: number;
    projectedExpenses: number;
    netFlow: number;
    confidence: number;
  };
  spendingForecast: {
    category: string;
    currentMonthly: number;
    projectedMonthly: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  }[];
  savingsProjection: {
    currentSavingsRate: number;
    projectedSavingsRate: number;
    goalProgress: {
      goalName: string;
      currentAmount: number;
      projectedCompletion: string;
      onTrack: boolean;
    }[];
  };
  aiInsights: {
    riskFactors: string[];
    opportunities: string[];
    recommendations: string[];
    seasonalTrends: string[];
  };
  smartAlerts: {
    type: 'warning' | 'opportunity' | 'milestone';
    message: string;
    action: string;
  }[];
}

// Mock forecasting data with realistic AI-generated insights
const generateGroupForecast = async (groupId: string, period: string, userId: string): Promise<GroupForecast> => {
  
  // Mock group spending patterns based on your existing groups
  const groupData = {
    'group_001': { // Foodie Friends
      name: 'Foodie Friends',
      monthlySpending: 1240,
      categories: ['dining', 'entertainment', 'travel'],
      growthRate: 0.05,
      seasonality: 'summer_high'
    },
    'group_002': { // Commute Crew  
      name: 'Commute Crew',
      monthlySpending: 450,
      categories: ['transport', 'fuel'],
      growthRate: -0.02,
      seasonality: 'stable'
    },
    'group_003': { // House Mates
      name: 'House Mates',
      monthlySpending: 2100,
      categories: ['household', 'utilities', 'groceries'],
      growthRate: 0.03,
      seasonality: 'winter_high'
    }
  };

  const group = groupData[groupId as keyof typeof groupData] || groupData['group_001'];
  const multiplier = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : 12;

  // Generate AI insights with fallback to smart mock data
  let aiGeneratedInsights;
  try {
    const prompt = `Provide financial forecasting insights for group "${group.name}" spending $${group.monthlySpending}/month on ${group.categories.join(', ')}. Growth: ${group.growthRate}. Give brief recommendations.`;
    
    const response = await openaiService.generateChatResponse(prompt);
    
    // Use AI suggestions as recommendations, create structured insights
    aiGeneratedInsights = {
      riskFactors: [
        `${group.growthRate > 0.03 ? 'High spending growth rate of ' + Math.round(group.growthRate * 100) + '%' : 'Spending growth under control'}`,
        `Seasonal variations in ${group.seasonality === 'summer_high' ? 'summer' : 'winter'} months`
      ],
      opportunities: [
        "Leverage group purchasing power for discounts",
        "Optimize recurring subscriptions and services"
      ],
      recommendations: response.suggestions || [
        "Set up automated savings transfers", 
        "Track weekly spending vs monthly budget"
      ],
      seasonalTrends: [
        `${group.seasonality === 'summer_high' ? 'Summer' : 'Winter'} spending typically 15-25% higher`,
        "Holiday periods show increased group activity"
      ]
    };
  } catch (error) {
    console.log('OpenAI not available, using mock insights:', error);
    aiGeneratedInsights = {
      riskFactors: [`${group.growthRate > 0 ? 'Increasing' : 'Stable'} spending trend in ${group.categories[0]}`, "Potential budget overruns during peak seasons"],
      opportunities: ["Bulk purchasing for recurring expenses", "Shared subscription optimizations"],
      recommendations: ["Set up automated savings transfers", "Track weekly spending vs monthly budget"],
      seasonalTrends: [`${group.seasonality === 'summer_high' ? 'Summer' : 'Winter'} spending typically 15-25% higher`]
    };
  }

  return {
    groupId,
    groupName: group.name,
    forecastPeriod: period as any,
    generatedAt: new Date().toISOString(),
    cashFlow: {
      projectedIncome: 0, // Groups typically don't have income, focus on expense management
      projectedExpenses: Math.round(group.monthlySpending * multiplier * (1 + group.growthRate)),
      netFlow: -Math.round(group.monthlySpending * multiplier * (1 + group.growthRate)),
      confidence: 0.78
    },
    spendingForecast: [
      {
        category: group.categories[0],
        currentMonthly: Math.round(group.monthlySpending * 0.6),
        projectedMonthly: Math.round(group.monthlySpending * 0.6 * (1 + group.growthRate)),
        trend: group.growthRate > 0 ? 'increasing' : group.growthRate < 0 ? 'decreasing' : 'stable',
        confidence: 0.82
      },
      {
        category: group.categories[1] || 'other',
        currentMonthly: Math.round(group.monthlySpending * 0.3),
        projectedMonthly: Math.round(group.monthlySpending * 0.3 * (1 + group.growthRate * 0.5)),
        trend: 'stable',
        confidence: 0.75
      },
      {
        category: group.categories[2] || 'miscellaneous',
        currentMonthly: Math.round(group.monthlySpending * 0.1),
        projectedMonthly: Math.round(group.monthlySpending * 0.1 * (1 + group.growthRate * 1.2)),
        trend: 'increasing',
        confidence: 0.65
      }
    ],
    savingsProjection: {
      currentSavingsRate: 0.08,
      projectedSavingsRate: Math.max(0.05, 0.08 - group.growthRate),
      goalProgress: [
        {
          goalName: "Tokyo Food Tour 2024",
          currentAmount: 3240,
          projectedCompletion: "2024-08-20",
          onTrack: true
        },
        {
          goalName: "House Emergency Fund", 
          currentAmount: 2100,
          projectedCompletion: "2024-11-15",
          onTrack: true
        }
      ]
    },
    aiInsights: aiGeneratedInsights,
    smartAlerts: [
      {
        type: 'opportunity',
        message: `Group spending efficiency is ${Math.round(85 + Math.random() * 10)}% - above average!`,
        action: 'Consider increasing shared savings goals'
      },
      {
        type: group.growthRate > 0.04 ? 'warning' : 'milestone',
        message: group.growthRate > 0.04 ? 
          `Spending growth rate of ${Math.round(group.growthRate * 100)}% exceeds recommended 3%` :
          `Great job maintaining spending discipline!`,
        action: group.growthRate > 0.04 ? 'Review recent expenses for optimization' : 'Continue current habits'
      }
    ]
  };
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId') || 'group_001';
    const period = url.searchParams.get('period') || '3M';
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

    const forecast = await generateGroupForecast(groupId, period, userId);

    return new Response(JSON.stringify({
      success: true,
      forecast: forecast
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating forecast:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate forecast'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST endpoint for generating custom forecasts with AI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { groupId, period, customParams, userId } = body;

    // Generate custom forecast with AI based on user inputs
    const customPrompt = `Generate a detailed financial forecast for group spending with these parameters:
    - Group ID: ${groupId}
    - Period: ${period} 
    - Custom parameters: ${JSON.stringify(customParams)}
    - User preferences: ${JSON.stringify(body.preferences || {})}
    
    Focus on actionable insights and realistic projections.`;

    let aiResponse;
         try {
       const response = await openaiService.generateChatResponse(customPrompt);
       aiResponse = response.text || "Based on your group's patterns, expect moderate spending growth with opportunities for optimization.";
     } catch (error) {
       console.log('Using fallback forecast generation');
       aiResponse = "Based on your group's patterns, expect moderate spending growth with opportunities for optimization.";
     }

    const forecast = await generateGroupForecast(groupId, period, userId);
    
    // Add custom AI response to the forecast
    forecast.aiInsights.recommendations.unshift(aiResponse.substring(0, 200) + "...");

    return new Response(JSON.stringify({
      success: true,
      forecast: forecast,
      customAnalysis: aiResponse
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating custom forecast:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate custom forecast'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 