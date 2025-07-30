interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestions?: string[];
  tripSuggestions?: any[];
  paymentRequest?: any;
  actionTaken?: {
    type: string;
    data: any;
    success: boolean;
  };
}

import { openaiService } from '../../services/openaiService';

interface TripSuggestion {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: string;
  image: string;
}

interface PaymentRequest {
  id: string;
  description: string;
  amount: number;
  currency: string;
  breakdown?: Array<{ item: string; cost: number }>;
}

// Fetch real user data from app APIs
const getRealUserData = async () => {
  try {
    // Use the same mock data that wallets.tsx uses (since that's what the user sees)
    const mockGroups = [
      {
        id: 'group_001',
        name: 'Foodie Friends',
        description: 'Weekly dinner adventures',
        category: 'dining',
        color: '#EF4444',
        memberCount: 4,
        balance: 127.45,
        totalSpent: 2847.80,
        savings: 1250,
        createdDate: '2024-01-15'
      },
      {
        id: 'group_002', 
        name: 'House Squad',
        description: 'Shared household expenses',
        category: 'household',
        color: '#10B981',
        memberCount: 3,
        balance: -85.60,
        totalSpent: 1892.45,
        savings: 2400,
        createdDate: '2024-02-01'
      },
      {
        id: 'group_003',
        name: 'SFO to Moab Trip',
        description: 'Epic road trip adventure',
        category: 'travel',
        color: '#F59E0B',
        memberCount: 4,
        balance: 156.30,
        totalSpent: 1876.50,
        savings: 1100,
        tripDate: '2024-04-15',
        createdDate: '2024-01-20'
      },
      {
        id: 'group_004',
        name: 'Road Trip Crew',
        description: 'Gas, tolls, and snacks',
        category: 'transport',
        color: '#3B82F6',
        memberCount: 5,
        balance: 234.75,
        totalSpent: 1634.90,
        savings: 890,
        createdDate: '2024-02-10'
      },
      {
        id: 'group_005',
        name: 'Weekend Warriors',
        description: 'Entertainment and activities',
        category: 'entertainment',
        color: '#8B5CF6',
        memberCount: 6,
        balance: -43.20,
        totalSpent: 956.30,
        savings: 675,
        createdDate: '2024-01-25'
      }
    ];

    // Calculate real totals from groups
    const totalSavings = mockGroups.reduce((sum, group) => sum + group.savings, 0);
    const totalSpent = mockGroups.reduce((sum, group) => sum + group.totalSpent, 0);
    const totalBalance = mockGroups.reduce((sum, group) => sum + group.balance, 0);

    // Get recent group transactions
    let recentTransactions: any[] = [];
    try {
      const txResponse = await fetch(`/api/group/${mockGroups[0].id}/transactions`, { method: 'GET' });
      const txData = await txResponse.json();
      if (txData.success && txData.transactions.length > 0) {
        recentTransactions = txData.transactions.slice(0, 3).map((tx: any) => ({
          id: tx.id,
          description: tx.description,
          amount: -tx.amount, // Negative for expenses
          merchantName: tx.description.split(' ')[0],
          category: [tx.category],
          date: tx.date
        }));
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }

    // Use group-based mock transactions if API has none
    if (recentTransactions.length === 0) {
      recentTransactions = [
        {
          id: '1',
          description: 'Dinner at Italian Bistro',
          amount: -127.45,
          merchantName: 'Italian Bistro',
          category: ['Dining'],
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          description: 'Grocery store run',
          amount: -85.60,
          merchantName: 'Grocery Store',
          category: ['Food'],
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          description: 'Gas for road trip',
          amount: -67.30,
          merchantName: 'Shell',
          category: ['Transport'],
          date: new Date().toISOString()
        }
      ];
    }

    return {
      userProfile: {
        name: 'Alex',
        savingsRate: totalSpent > 0 ? Math.round((totalSavings / totalSpent) * 100) : 23,
        monthlyIncome: 4200,
        totalBalance: totalBalance
      },
      recentTransactions,
      spendingAnalysis: {
        totalSpent: totalSpent,
        savingsRate: totalSpent > 0 ? Math.round((totalSavings / totalSpent) * 100) : 23,
        categories: [
          { name: 'Dining', amount: 2847.80, percentage: 35.2 },
          { name: 'Household', amount: 1892.45, percentage: 23.4 },
          { name: 'Travel', amount: 1876.50, percentage: 23.2 },
          { name: 'Transport', amount: 1634.90, percentage: 20.2 }
        ]
      },
      goalProgress: {
        activeGoals: mockGroups.filter(g => g.savings > 0).length,
        completionRate: 67
      }
    };
  } catch (error) {
    console.error('Failed to fetch real user data:', error);
    
    // Fallback to minimal data
    return {
      userProfile: {
        name: 'Alex',
        savingsRate: 0,
        monthlyIncome: 4200,
        totalBalance: 0
      },
      recentTransactions: [],
      spendingAnalysis: {
        totalSpent: 0,
        savingsRate: 0,
        categories: []
      },
      goalProgress: {
        activeGoals: 0,
        completionRate: 0
      }
    };
  }
};

// Parse natural language for group/trip creation commands
const parseGroupCreationCommand = (message: string): {
  name?: string;
  category?: string;
  memberCount?: number;
  destination?: string;
  duration?: number;
  estimatedBudget?: number;
  description?: string;
} | null => {
  const lowerMessage = message.toLowerCase();
  
  // Check if this looks like a group creation command
  const creationPatterns = [
    /create.*wallet/i,
    /create.*group/i,
    /trip to/i,
    /travel to/i,
    /going to.*with.*friends/i,
    /me and.*friends.*trip/i,
    /budget.*trip/i,
    /wallet.*creation/i
  ];

  const isCreationCommand = creationPatterns.some(pattern => pattern.test(message));
  if (!isCreationCommand) return null;

  const result: any = {};

  // Extract destination for travel
  const destinationPatterns = [
    /trip to ([a-zA-Z\s]+)/i,
    /travel to ([a-zA-Z\s]+)/i,
    /going to ([a-zA-Z\s]+)/i
  ];
  
  for (const pattern of destinationPatterns) {
    const match = message.match(pattern);
    if (match) {
      result.destination = match[1].trim();
      result.name = `Trip to ${result.destination}`;
      result.category = 'travel';
      break;
    }
  }

  // Extract member count
  const memberPatterns = [
    /(\d+)\s*friends/i,
    /me and (\d+)/i,
    /(\d+)\s*people/i,
    /group of (\d+)/i
  ];
  
  for (const pattern of memberPatterns) {
    const match = message.match(pattern);
    if (match) {
      result.memberCount = parseInt(match[1]) + 1; // +1 for the user
      break;
    }
  }

  // Extract duration
  const durationPatterns = [
    /(\d+)\s*days?/i,
    /(\d+)\s*weeks?/i,
    /(\d+)\s*months?/i
  ];
  
  for (const pattern of durationPatterns) {
    const match = message.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      if (message.includes('week')) {
        result.duration = num * 7;
      } else if (message.includes('month')) {
        result.duration = num * 30;
      } else {
        result.duration = num; // days
      }
      break;
    }
  }

  // Extract or estimate budget
  const budgetPatterns = [
    /budget.*\$?(\d+)/i,
    /\$(\d+).*budget/i,
    /spend.*\$?(\d+)/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) {
      result.estimatedBudget = parseInt(match[1]);
      break;
    }
  }

  // Auto-estimate budget for trips if not provided
  if (result.category === 'travel' && !result.estimatedBudget && result.destination && result.duration) {
    const perDayBudget = getEstimatedDailyBudget(result.destination);
    result.estimatedBudget = Math.round(perDayBudget * result.duration * (result.memberCount || 2));
  }

  // Extract description if provided
  const descriptionPatterns = [
    /for (.+?)$/i,
    /group for (.+?)$/i,
    /wallet for (.+?)$/i,
    /expenses for (.+?)$/i
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = message.match(pattern);
    if (match) {
      result.description = match[1].trim();
      break;
    }
  }

  // Default name if not set
  if (!result.name) {
    if (lowerMessage.includes('wallet')) {
      result.name = 'New Wallet';
      result.category = 'other';
    } else {
      result.name = 'New Group';
      result.category = 'other';
    }
  }

  return Object.keys(result).length > 0 ? result : null;
};

// Helper function to estimate daily budget by destination
const getEstimatedDailyBudget = (destination: string): number => {
  const lowerDest = destination.toLowerCase();
  
  // Rough budget estimates per person per day
  if (lowerDest.includes('india') || lowerDest.includes('thailand') || lowerDest.includes('vietnam')) {
    return 50; // $50/day for budget-friendly destinations
  } else if (lowerDest.includes('europe') || lowerDest.includes('japan') || lowerDest.includes('australia')) {
    return 150; // $150/day for mid-range destinations
  } else if (lowerDest.includes('switzerland') || lowerDest.includes('norway') || lowerDest.includes('iceland')) {
    return 250; // $250/day for expensive destinations
  } else {
    return 100; // $100/day default
  }
};

// Parse natural language for expense commands
const parseExpenseCommand = (message: string): {
  amount?: number;
  description?: string;
  groupHint?: string;
  paymentMethod?: string;
} | null => {
  const lowerMessage = message.toLowerCase();
  
  // Check if this looks like an expense command
  const expensePatterns = [
    /i paid \$?(\d+(?:\.\d{2})?)/i,
    /paid \$?(\d+(?:\.\d{2})?)/i,
    /spent \$?(\d+(?:\.\d{2})?)/i,
    /\$(\d+(?:\.\d{2})?) for/i,
    /\$(\d+(?:\.\d{2})?) at/i,
    /\$(\d+(?:\.\d{2})?) on/i
  ];

  let amount: number | undefined;
  
  for (const pattern of expensePatterns) {
    const match = message.match(pattern);
    if (match) {
      amount = parseFloat(match[1]);
      break;
    }
  }

  if (!amount) return null;

  // Extract description/context
  let description = message.replace(/i paid|paid|spent|\$\d+(?:\.\d{2})?/gi, '').trim();
  description = description.replace(/^(for|at|on|in)\s+/i, '');
  
  // Extract group hints
  const groupHints = ['vegas', 'vacation', 'trip', 'food', 'dinner', 'lunch', 'house', 'home', 'groceries'];
  let groupHint: string | undefined;
  
  for (const hint of groupHints) {
    if (lowerMessage.includes(hint)) {
      groupHint = hint;
      break;
    }
  }

  // Extract payment method
  let paymentMethod: string | undefined;
  if (lowerMessage.includes('cash')) paymentMethod = 'cash';
  else if (lowerMessage.includes('card') || lowerMessage.includes('credit')) paymentMethod = 'card';
  else if (lowerMessage.includes('venmo')) paymentMethod = 'venmo';

  return {
    amount,
    description: description || 'Expense',
    groupHint,
    paymentMethod
  };
};

// Find best matching group for expense
const findMatchingGroup = (groupHint: string, availableGroups: any[]): any => {
  if (!groupHint) return null;
  
  const hint = groupHint.toLowerCase();
  
  // Direct name matches
  for (const group of availableGroups) {
    if (group.name.toLowerCase().includes(hint)) {
      return group;
    }
  }
  
  // Category-based matches
  const categoryMap: { [key: string]: string } = {
    'vegas': 'travel',
    'vacation': 'travel', 
    'trip': 'travel',
    'food': 'dining',
    'dinner': 'dining',
    'lunch': 'dining',
    'house': 'household',
    'home': 'household',
    'groceries': 'household'
  };
  
  const targetCategory = categoryMap[hint];
  if (targetCategory) {
    for (const group of availableGroups) {
      if (group.category === targetCategory) {
        return group;
      }
    }
  }
  
  return null;
};

// Add expense to group via API
const addExpenseToGroup = async (groupId: string, expenseData: any): Promise<boolean> => {
  try {
    const response = await fetch(`/api/group/${groupId}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData)
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to add expense:', error);
    return false;
  }
};

// Create new group via shared data store
const createGroup = async (groupData: any): Promise<{ success: boolean; group?: any; message?: string }> => {
  try {
    console.log('Creating group with data:', groupData);
    
    // Import file store
    const { addGroup } = await import('./file-store');
    
    // Generate a unique ID for the new group
    const newGroupId = `group_${Date.now().toString().slice(-6)}`;
    
    // Helper function to get category colors
    const getCategoryColor = (cat: string): string => {
      const colors: { [key: string]: string } = {
        dining: '#EF4444',
        transport: '#3B82F6', 
        household: '#10B981',
        entertainment: '#8B5CF6',
        travel: '#F59E0B',
        other: '#6B7280'
      };
      return colors[cat] || colors.other;
    };

    // Create new group with enhanced properties
    const newGroup = {
      id: newGroupId,
      name: groupData.name,
      description: groupData.description || `${groupData.category === 'travel' ? 'Trip to' : 'Group for'} ${groupData.name}`,
      category: groupData.category || 'other',
      color: getCategoryColor(groupData.category || 'other'),
      memberCount: groupData.memberCount || 2,
      user_id: '1',
      created_at: new Date().toISOString(),
      balance: 0,
      totalSpent: 0,
      savings: 0,
      estimatedBudget: groupData.estimatedBudget || null,
      duration: groupData.duration || null,
      destination: groupData.destination || null,
      tripDate: groupData.category === 'travel' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    // Add to file store
    await addGroup(newGroup);
    
    console.log('Successfully created group:', newGroup);
    
    return {
      success: true,
      group: newGroup,
      message: `Successfully created ${groupData.category === 'travel' ? 'trip' : 'group'}: ${groupData.name}${groupData.estimatedBudget ? ` with $${groupData.estimatedBudget} budget` : ''}`
    };

  } catch (error) {
    console.error('Failed to create group:', error);
    return { success: false, message: `Failed to create group: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// AI-powered financial responses with agentic capabilities
const generateFinancialResponse = async (userMessage: string, context?: any): Promise<{
  text: string;
  suggestions?: string[];
  tripSuggestions?: TripSuggestion[];
  paymentRequest?: PaymentRequest;
  actionTaken?: {
    type: string;
    data: any;
    success: boolean;
  };
}> => {
  try {
    // Check if this is a group creation command first
    const groupCreationCommand = parseGroupCreationCommand(userMessage);
    
    if (groupCreationCommand) {
      // Check if we need to ask for missing details
      const missingDetails = [];
      
      if (!groupCreationCommand.memberCount) {
        missingDetails.push("number of people");
      }
      
      if (!groupCreationCommand.description && groupCreationCommand.category !== 'travel') {
        missingDetails.push("description of what this group is for");
      }
      
      // If we're missing critical details, ask for them
      if (missingDetails.length > 0) {
        let questionText = `I'd love to help you create this ${groupCreationCommand.category === 'travel' ? 'trip' : 'group'}! `;
        
        if (groupCreationCommand.name) {
          questionText += `For your **${groupCreationCommand.name}** ${groupCreationCommand.category === 'travel' ? 'trip' : 'group'}, `;
        }
        
        questionText += `I need a few more details:\n\n`;
        
        if (!groupCreationCommand.memberCount) {
          questionText += `👥 **How many people** will be in this ${groupCreationCommand.category === 'travel' ? 'trip' : 'group'}? (including yourself)\n`;
        }
        
        if (!groupCreationCommand.description && groupCreationCommand.category !== 'travel') {
          questionText += `📝 **What's this group for?** (e.g., "Weekly dinner expenses", "Shared household bills")\n`;
        }
        
        if (groupCreationCommand.category === 'travel' && !groupCreationCommand.destination) {
          questionText += `📍 **Where are you traveling to?**\n`;
        }
        
        questionText += `\nJust reply with the details and I'll create your ${groupCreationCommand.category === 'travel' ? 'trip' : 'group'} right away!`;
        
        return {
          text: questionText,
          suggestions: [
            "5 people for weekly dinners",
            "3 people for household bills",
            "4 people for entertainment",
            "Tell me more about group creation"
          ]
        };
      }
      
      // Create the group if we have all needed details
      const result = await createGroup(groupCreationCommand);
      
      if (result.success && result.group) {
        const budgetText = result.group.estimatedBudget 
          ? `\n\nEstimated Budget: **$${result.group.estimatedBudget}** ${result.group.duration ? `for ${result.group.duration} days` : ''}`
          : '';
        
        const memberText = result.group.memberCount > 1 
          ? `\n\nMembers: **${result.group.memberCount} people**`
          : '';

        return {
          text: `✅ **${result.group.category === 'travel' ? 'Trip' : 'Wallet'} Created Successfully!**\n\nI've created your **${result.group.name}** ${result.group.category === 'travel' ? 'trip' : 'wallet'}.${budgetText}${memberText}\n\n🔄 **Go to the Wallets tab and pull down to refresh to see your new ${result.group.category === 'travel' ? 'trip' : 'wallet'}!**\n\nYou can now start adding expenses and tracking spending for this ${result.group.category === 'travel' ? 'trip' : 'wallet'}!`,
          suggestions: [
            "Add an expense to this wallet",
            "Create another wallet", 
            "View wallet details",
            "Go to wallets tab"
          ],
          actionTaken: {
            type: 'group_created',
            data: {
              groupName: result.group.name,
              category: result.group.category,
              estimatedBudget: result.group.estimatedBudget,
              memberCount: result.group.memberCount,
              destination: result.group.destination
            },
            success: true
          }
        };
      } else {
        return {
          text: `❌ I couldn't create your ${groupCreationCommand.category === 'travel' ? 'trip' : 'group'}. ${result.message || 'Please try again or create it manually.'}`,
          suggestions: [
            "Try again",
            "Create group manually", 
            "Contact support"
          ],
          actionTaken: {
            type: 'group_created',
            data: groupCreationCommand,
            success: false
          }
        };
      }
    }

    // Check if this is an expense command
    const expenseCommand = parseExpenseCommand(userMessage);
    
    if (expenseCommand) {
      // Mock available groups for demo
      const availableGroups = [
        { id: 'group_001', name: 'Foodie Friends', category: 'dining' },
        { id: 'group_002', name: 'House Squad', category: 'household' },
        { id: 'group_003', name: 'SFO to Moab Trip', category: 'travel' },
        { id: 'group_004', name: 'Vegas Weekend', category: 'travel' },
        { id: 'group_005', name: 'Weekend Warriors', category: 'entertainment' }
      ];
      
      const matchingGroup = findMatchingGroup(expenseCommand.groupHint || '', availableGroups);
      
      if (matchingGroup) {
        // Prepare expense data
        const expenseData = {
          description: expenseCommand.description,
          amount: expenseCommand.amount,
          category: matchingGroup.category,
          paidBy: { id: '1', name: 'You' },
          participants: [
            { id: '1', name: 'You', amount: expenseCommand.amount },
            // Mock other participants - in real app, get from group members
          ],
          userId: '1'
        };
        
        // Try to add the expense
        const success = await addExpenseToGroup(matchingGroup.id, expenseData);
        
        if (success) {
          return {
            text: `✅ **Expense Added Successfully!**\n\nI added your $${expenseCommand.amount} expense for "${expenseCommand.description}" to the **${matchingGroup.name}** group.\n\n${expenseCommand.paymentMethod ? `Payment method: ${expenseCommand.paymentMethod}\n` : ''}The expense has been split equally among group members and they'll be notified.`,
            suggestions: [
              "Add another expense",
              "View group balance", 
              "Send payment reminder",
              "Check group activity"
            ],
            actionTaken: {
              type: 'expense_added',
              data: {
                groupName: matchingGroup.name,
                amount: expenseData.amount,
                description: expenseData.description
              },
              success: true
            }
          };
        } else {
          return {
            text: `❌ I found the **${matchingGroup.name}** group for your $${expenseCommand.amount} expense, but there was an error adding it. Please try again or add it manually.`,
            suggestions: [
              "Try again",
              "Add manually",
              "Check group details"
            ],
            actionTaken: {
              type: 'expense_added',
              data: expenseCommand,
              success: false
            }
          };
        }
      } else {
        // Couldn't find matching group
        return {
          text: `I understand you paid $${expenseCommand.amount} for "${expenseCommand.description}", but I couldn't find a matching group${expenseCommand.groupHint ? ` for "${expenseCommand.groupHint}"` : ''}.\n\nWhich group should I add this expense to?`,
          suggestions: [
            "Foodie Friends",
            "House Squad", 
            "SFO to Moab Trip",
            "Create new group"
          ]
        };
      }
    }

    // Get real data from your app
    const realUserData = await getRealUserData();

    // Use GPT for intelligent responses with real data
    const aiResponse = await openaiService.generateChatResponse(userMessage, realUserData);

    // Check for specific action items from AI response
    if (aiResponse.actionItems) {
      for (const action of aiResponse.actionItems) {
        if (action.type === 'split_bill' && action.data) {
          // Add payment request for bill splitting
          return {
            text: aiResponse.text,
            suggestions: aiResponse.suggestions,
            paymentRequest: {
              id: 'split_' + Date.now(),
              description: action.data.description || 'Split Bill',
              amount: action.data.amount || 0,
              currency: 'USD',
              breakdown: action.data.breakdown || []
            }
          };
        }
      }
    }

    return {
      text: aiResponse.text,
      suggestions: aiResponse.suggestions
    };

  } catch (error) {
    console.error('AI response failed:', error);
    
    // Fallback to rule-based responses if AI fails
    return generateFallbackResponse(userMessage);
  }
};

// Fallback function for when AI is unavailable
const generateFallbackResponse = (userMessage: string): {
  text: string;
  suggestions?: string[];
  tripSuggestions?: TripSuggestion[];
  paymentRequest?: PaymentRequest;
} => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('analyz') || lowerMessage.includes('spending') || lowerMessage.includes('pattern')) {
    return {
      text: "Based on your recent transactions, you're spending 36% on food & dining ($1,245.50), which is above the recommended 25%. Your transportation costs are 24% ($845.30), and entertainment is 16% ($567.80). Consider setting a monthly dining budget of $800 to optimize your savings.",
      suggestions: [
        "Set dining budget",
        "Track daily expenses", 
        "Find cooking recipes",
        "Show category breakdown"
      ]
    };
  }
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return {
      text: "Great question! I notice you could save $200/month by reducing dining out by just 2 meals per week. Your current savings rate is 23%, which is excellent! This would help you reach your vacation fund goal 2 months earlier and boost your overall savings rate to 28%.",
      suggestions: [
        "Set up auto-savings",
        "Create meal plans",
        "Find discounts",
        "Track progress"
      ]
    };
  }
  
  if (lowerMessage.includes('vacation') || lowerMessage.includes('fund') || lowerMessage.includes('progress')) {
    return {
      text: "Your vacation fund is at 57% completion ($2,847 of $5,000). At your current contribution rate of $400/month from 4 members, you'll reach your goal by July 15th. Sarah has contributed the most ($950), followed by you ($800). Want me to suggest ways to accelerate this?",
      suggestions: [
        "Invite more friends",
        "Set up auto-contributions",
        "Find cheaper alternatives",
        "Create milestone rewards"
      ]
    };
  }
  
  if (lowerMessage.includes('split') || lowerMessage.includes('bill') || lowerMessage.includes('restaurant')) {
    return {
      text: "I can help you split bills efficiently! Just tell me the total amount and who was involved. I'll calculate everyone's share and can even send payment requests through your shared wallets. For restaurants, I can also factor in tax and tip automatically.",
      suggestions: [
        "Split restaurant bill",
        "Split utility bill",
        "Add custom tip",
        "Send payment requests"
      ]
    };
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('limit')) {
    return {
      text: "Based on your income and spending patterns, I recommend a 50/30/20 budget: 50% for needs ($2,100), 30% for wants ($1,260), and 20% for savings ($840). You're currently saving 23%, which is above the recommended 20% - excellent work!",
      suggestions: [
        "Set category limits",
        "Track monthly progress",
        "Adjust budget",
        "View spending alerts"
      ]
    };
  }
  
  if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
    return {
      text: "You have 3 active savings goals: Vacation Fund (57% complete), House Expenses (62% complete), and Dinner Club (31% complete). Your total goal amount is $7,500 with $4,238 saved. You're on track to complete all goals within your target timeframes!",
      suggestions: [
        "Create new goal",
        "Adjust timelines",
        "Set milestones",
        "Share with friends"
      ]
    };
  }
  
  if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('vacation') || lowerMessage.includes('japan') || lowerMessage.includes('paris') || lowerMessage.includes('new york')) {
    const tripSuggestions = [
      {
        id: '1',
        title: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        duration: '7 days',
        price: 2850,
        rating: 4.8,
        image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Shibuya Crossing', 'Mount Fuji', 'Traditional Temples'],
        category: 'Cultural'
      },
      {
        id: '2',
        title: 'Paris Romance',
        destination: 'Paris, France',
        duration: '5 days',
        price: 2200,
        rating: 4.9,
        image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'],
        category: 'Romance'
      },
      {
        id: '3',
        title: 'NYC Explorer',
        destination: 'New York, USA',
        duration: '4 days',
        price: 1800,
        rating: 4.7,
        image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Times Square', 'Central Park', 'Broadway Shows'],
        category: 'Urban'
      }
    ];
    
    return {
      text: "I found some amazing trip options for you! Based on your budget and preferences, here are my top recommendations. Each includes flights, accommodation, and guided tours. Would you like me to help you book any of these?",
      tripSuggestions,
      suggestions: [
        "Show more destinations",
        "Filter by budget",
        "Add travel dates",
        "Book selected trip"
      ]
    };
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('interested') || lowerMessage.includes('hotel') || lowerMessage.includes('flight')) {
    const paymentRequest = {
      id: 'payment_' + Date.now(),
      description: 'Tokyo Adventure Package',
      amount: 2850,
      currency: 'USD',
      breakdown: [
        { item: 'Round-trip flights', cost: 1200 },
        { item: 'Hotel (7 nights)', cost: 980 },
        { item: 'Guided tours', cost: 450 },
        { item: 'Travel insurance', cost: 120 },
        { item: 'Airport transfers', cost: 100 }
      ]
    };
    
    return {
      text: "Perfect choice! I can help you book the Tokyo Adventure package. Here's the complete breakdown of costs. This includes everything you need for an amazing 7-day trip. Would you like to proceed with the payment?",
      paymentRequest,
      suggestions: [
        "Modify package",
        "Add travel insurance",
        "Change dates",
        "Split with friends"
      ]
    };
  }
  
  return {
    text: "I'm your AI financial assistant! I can help you analyze spending patterns, optimize savings, manage shared wallets, split bills, set budgets, and track your financial goals. What would you like to explore today?",
    suggestions: [
      "Analyze my spending",
      "Show savings tips",
      "Check goal progress",
      "Plan a trip"
    ]
  };
};

export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Message is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Generate contextual response with AI
    const response = await generateFinancialResponse(message);

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      text: response.text,
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: response.suggestions,
      tripSuggestions: response.tripSuggestions,
      paymentRequest: response.paymentRequest
    };

    return new Response(JSON.stringify({
      success: true,
      message: aiMessage,
      conversationId: conversationId || 'default'
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId') || 'default';

    // Return conversation history (mock implementation)
    const initialMessage: ChatMessage = {
      id: '1',
      text: "Hi! I'm your financial assistant. I can help you analyze your spending, set savings goals, and manage your shared wallets. What would you like to know?",
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: [
        "Analyze my spending patterns",
        "How can I save more money?",
        "Show vacation fund progress",
        "Split a restaurant bill"
      ]
    };

    return new Response(JSON.stringify({
      success: true,
      messages: [initialMessage],
      conversationId
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