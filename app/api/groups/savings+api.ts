// Shared Group Savings API
// Mock data for group savings goals

interface SavingsGoal {
  id: string;
  groupId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'vacation' | 'house' | 'emergency' | 'event' | 'other';
  createdBy: string;
  createdAt: string;
  participants: {
    userId: string;
    name: string;
    contributionTarget: number;
    contributedAmount: number;
  }[];
  aiInsights: {
    monthlyTarget: number;
    completionProbability: number;
    suggestions: string[];
  };
}

interface Contribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: string;
  method: 'auto' | 'manual';
}

// Mock savings goals data
const mockSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal_001',
    groupId: 'group_001',
    name: 'Tokyo Food Tour 2024',
    description: 'Epic food adventure through Tokyo with the gang',
    targetAmount: 8000,
    currentAmount: 3240,
    targetDate: '2024-09-15',
    category: 'vacation',
    createdBy: '00000000-0000-0000-0000-000000000001',
    createdAt: '2024-02-01T10:00:00Z',
    participants: [
      {
        userId: '00000000-0000-0000-0000-000000000001',
        name: 'Alex Johnson',
        contributionTarget: 2000,
        contributedAmount: 850
      },
      {
        userId: 'user_002',
        name: 'Sarah Chen',
        contributionTarget: 2000,
        contributedAmount: 920
      },
      {
        userId: 'user_003',
        name: 'Mike Rodriguez',
        contributionTarget: 2000,
        contributedAmount: 740
      },
      {
        userId: 'user_004',
        name: 'Emma Wilson',
        contributionTarget: 2000,
        contributedAmount: 730
      }
    ],
    aiInsights: {
      monthlyTarget: 680,
      completionProbability: 0.85,
      suggestions: [
        'Set up auto-transfers of $170/week per person',
        'Consider reducing dining out by 15% to boost savings',
        'Track flight prices - book when under $650'
      ]
    }
  },
  {
    id: 'goal_002',
    groupId: 'group_003',
    name: 'House Emergency Fund',
    description: 'Shared emergency fund for house repairs and maintenance',
    targetAmount: 5000,
    currentAmount: 2100,
    targetDate: '2024-12-31',
    category: 'emergency',
    createdBy: '00000000-0000-0000-0000-000000000001',
    createdAt: '2024-01-15T10:00:00Z',
    participants: [
      {
        userId: '00000000-0000-0000-0000-000000000001',
        name: 'Alex Johnson',
        contributionTarget: 1250,
        contributedAmount: 600
      },
      {
        userId: 'user_005',
        name: 'Jordan Kim',
        contributionTarget: 1250,
        contributedAmount: 520
      },
      {
        userId: 'user_006',
        name: 'Taylor Swift',
        contributionTarget: 1250,
        contributedAmount: 480
      },
      {
        userId: 'user_007',
        name: 'Chris Park',
        contributionTarget: 1250,
        contributedAmount: 500
      }
    ],
    aiInsights: {
      monthlyTarget: 290,
      completionProbability: 0.92,
      suggestions: [
        'On track! Continue current $72.50/week contributions',
        'Consider automatic deduction from shared utilities savings',
        'Great progress - emergency fund reduces household risk by 67%'
      ]
    }
  },
  {
    id: 'goal_003',
    groupId: 'group_001',
    name: 'Concert Festival Pass',
    description: 'VIP passes for Coachella weekend trip',
    targetAmount: 2400,
    currentAmount: 890,
    targetDate: '2024-04-15',
    category: 'event',
    createdBy: 'user_002',
    createdAt: '2024-01-10T10:00:00Z',
    participants: [
      {
        userId: '00000000-0000-0000-0000-000000000001',
        name: 'Alex Johnson',
        contributionTarget: 600,
        contributedAmount: 250
      },
      {
        userId: 'user_002',
        name: 'Sarah Chen',
        contributionTarget: 600,
        contributedAmount: 280
      },
      {
        userId: 'user_003',
        name: 'Mike Rodriguez',
        contributionTarget: 600,
        contributedAmount: 180
      },
      {
        userId: 'user_004',
        name: 'Emma Wilson',
        contributionTarget: 600,
        contributedAmount: 180
      }
    ],
    aiInsights: {
      monthlyTarget: 755,
      completionProbability: 0.45,
      suggestions: [
        'URGENT: Need $377/week per person to reach goal',
        'Consider reducing target to $1800 for general admission',
        'Alternative: postpone to next year for better savings rate'
      ]
    }
  }
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId');
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

    let goals = mockSavingsGoals;
    
    // Filter by group if specified
    if (groupId) {
      goals = goals.filter(goal => goal.groupId === groupId);
    } else {
      // Return goals for groups user is part of
      goals = goals.filter(goal => 
        goal.participants.some(p => p.userId === userId)
      );
    }

    return new Response(JSON.stringify({
      success: true,
      goals: goals
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch savings goals'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}`,
      groupId: body.groupId,
      name: body.name,
      description: body.description,
      targetAmount: body.targetAmount,
      currentAmount: 0,
      targetDate: body.targetDate,
      category: body.category,
      createdBy: body.userId,
      createdAt: new Date().toISOString(),
      participants: body.participants.map((p: any) => ({
        ...p,
        contributedAmount: 0
      })),
      aiInsights: {
        monthlyTarget: Math.round(body.targetAmount / 6), // Assume 6 month default
        completionProbability: 0.75, // Default optimistic probability
        suggestions: [
          `Set up auto-transfers to reach your goal`,
          `Track progress weekly for best results`,
          `Consider linking to group expense reductions`
        ]
      }
    };

    // In a real app, save to database
    mockSavingsGoals.push(newGoal);

    return new Response(JSON.stringify({
      success: true,
      goal: newGoal
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating savings goal:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create savings goal'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 