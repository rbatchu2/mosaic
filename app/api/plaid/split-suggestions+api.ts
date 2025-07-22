import { openaiService } from '../../../services/openaiService';
import { supabaseService } from '../../../services/supabaseService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId');
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

    if (!transactionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Transaction ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use same transactions as main transactions API for consistency
    const mockTransactions = [
      // March 10 - Day 1: San Francisco departure  
      {
        id: 'txn_001',
        description: 'Shell Gas Station - Fuel up for the road',
        amount: -89.45,
        merchant_name: 'Shell',
        category: ['Transportation', 'Gas Stations'],
        date: '2024-03-10T08:30:00Z',
        location: { city: 'San Francisco', region: 'CA' }
      },
      {
        id: 'txn_002',
        description: 'Whole Foods - Road trip snacks and water',
        amount: -127.82,
        merchant_name: 'Whole Foods Market',
        category: ['Food and Drink', 'Groceries'],
        date: '2024-03-10T09:15:00Z',
        location: { city: 'San Francisco', region: 'CA' }
      },
      {
        id: 'txn_003',
        description: 'REI Co-op - Last minute camping gear',
        amount: -234.67,
        merchant_name: 'REI Co-op',
        category: ['Shopping', 'Sporting Goods'],
        date: '2024-03-10T10:45:00Z',
        location: { city: 'San Francisco', region: 'CA' }
      },
      {
        id: 'txn_004',
        description: 'Blue Bottle Coffee - Morning coffee before departure',
        amount: -18.50,
        merchant_name: 'Blue Bottle Coffee',
        category: ['Food and Drink', 'Coffee Shops'],
        date: '2024-03-10T11:30:00Z',
        location: { city: 'San Francisco', region: 'CA' }
      },
      {
        id: 'txn_005',
        description: 'In-N-Out Burger - Lunch in Modesto',
        amount: -32.45,
        merchant_name: 'In-N-Out Burger',
        category: ['Food and Drink', 'Fast Food'],
        date: '2024-03-10T14:20:00Z',
        location: { city: 'Modesto', region: 'CA' }
      },
      // March 10-11 - Yosemite
      {
        id: 'txn_006',
        description: 'Yosemite National Park - Entrance fee',
        amount: -35.00,
        merchant_name: 'National Park Service',
        category: ['Travel', 'Recreation'],
        date: '2024-03-10T16:45:00Z',
        location: { city: 'Yosemite Valley', region: 'CA' }
      },
      {
        id: 'txn_007',
        description: 'Ahwahnee Hotel - Dinner at iconic lodge',
        amount: -156.78,
        merchant_name: 'Ahwahnee Hotel',
        category: ['Food and Drink', 'Restaurants'],
        date: '2024-03-10T19:30:00Z',
        location: { city: 'Yosemite Valley', region: 'CA' }
      },
      {
        id: 'txn_008',
        description: 'Curry Village - Camping supplies',
        amount: -45.20,
        merchant_name: 'Curry Village Store',
        category: ['Shopping', 'General'],
        date: '2024-03-11T08:15:00Z',
        location: { city: 'Yosemite Valley', region: 'CA' }
      },
      {
        id: 'txn_009',
        description: 'Degnan\'s Kitchen - Breakfast and coffee',
        amount: -28.90,
        merchant_name: 'Degnan\'s Kitchen',
        category: ['Food and Drink', 'Restaurants'],
        date: '2024-03-11T09:00:00Z',
        location: { city: 'Yosemite Valley', region: 'CA' }
      },
      {
        id: 'txn_010',
        description: 'Yosemite Valley Lodge - Gift shop',
        amount: -67.45,
        merchant_name: 'Yosemite Valley Lodge',
        category: ['Shopping', 'Souvenirs'],
        date: '2024-03-11T15:30:00Z',
        location: { city: 'Yosemite Valley', region: 'CA' }
      }
    ];

    const transaction = mockTransactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Transaction not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use mock expense groups instead of Supabase
    const mockExpenseGroups = [
      {
        id: 'group_001',
        name: 'Foodie Friends',
        description: 'Regular dining group for restaurants and food experiences',
        category: 'dining',
        color: '#EF4444'
      },
      {
        id: 'group_002',
        name: 'Commute Crew',
        description: 'Transportation sharing for daily commutes',
        category: 'transport',
        color: '#3B82F6'
      },
      {
        id: 'group_003',
        name: 'House Mates',
        description: 'Household expenses and utilities',
        category: 'household',
        color: '#10B981'
      },
      {
        id: 'group_005',
        name: 'Road Trip Crew',
        description: 'Epic SFO to Moab adventure - sharing all travel, lodging, and activity costs',
        category: 'travel',
        color: '#F59E0B'
      }
    ];

    // Mock group members
    const mockGroupMembers: { [key: string]: Array<{id: string; name: string; email: string}> } = {
      'group_001': [
        { id: 'user_001', name: 'Alex Johnson', email: 'alex@example.com' },
        { id: 'user_002', name: 'Sarah Chen', email: 'sarah@example.com' },
        { id: 'user_003', name: 'Mike Rodriguez', email: 'mike@example.com' }
      ],
      'group_002': [
        { id: 'user_001', name: 'Alex Johnson', email: 'alex@example.com' },
        { id: 'user_004', name: 'Emma Wilson', email: 'emma@example.com' }
      ],
      'group_003': [
        { id: 'user_001', name: 'Alex Johnson', email: 'alex@example.com' },
        { id: 'user_002', name: 'Sarah Chen', email: 'sarah@example.com' },
        { id: 'user_005', name: 'David Park', email: 'david@example.com' },
        { id: 'user_006', name: 'Lisa Zhang', email: 'lisa@example.com' }
      ],
      'group_005': [
        { id: 'user_001', name: 'Alex Johnson', email: 'alex@example.com' },
        { id: 'user_002', name: 'Sarah Chen', email: 'sarah@example.com' },
        { id: 'user_003', name: 'Mike Rodriguez', email: 'mike@example.com' },
        { id: 'user_007', name: 'Jordan Kim', email: 'jordan@example.com' }
      ]
    };

    // Create groups with members
    const groupsWithMembers = mockExpenseGroups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      color: group.color,
      members: mockGroupMembers[group.id] || [],
      context: {
        keywords: group.category === 'dining' 
          ? ['restaurant', 'dinner', 'food', 'dining', 'brunch', 'coffee']
          : group.category === 'transport'
          ? ['uber', 'lyft', 'taxi', 'transport', 'ride', 'commute']
          : group.category === 'travel'
          ? ['hotel', 'gas', 'national park', 'tour', 'adventure', 'moab', 'vegas', 'zion', 'yosemite', 'antelope', 'death valley', 'road trip', 'travel', 'vacation', 'camping', 'lodge', 'resort']
          : ['expense', 'bill', 'payment', 'utilities', 'rent'],
        locations: group.category === 'travel'
          ? ['San Francisco', 'Yosemite Valley', 'Death Valley', 'Las Vegas', 'Springdale', 'Page', 'Moab', 'Utah', 'Nevada', 'Arizona', 'California']
          : ['San Francisco', 'Bay Area'],
        merchants: group.category === 'dining'
          ? ['The French Laundry', 'Blue Bottle Coffee', 'Whole Foods']
          : group.category === 'transport'
          ? ['Uber', 'Lyft']
          : group.category === 'travel'
          ? ['MGM Grand', 'Cable Mountain Lodge', 'Red Cliffs Lodge', 'National Park Service', 'Shell', 'Chevron', 'Exxon', 'Antelope Canyon Tours', 'Moab Adventure Center', 'Curry Village Store', 'Ahwahnee Hotel', 'Yosemite Valley Lodge', 'Degnan\'s Kitchen']
          : []
      }
    }));

    try {
      // Transform transaction to format expected by OpenAI service
      const aiTransaction = {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        merchantName: transaction.merchant_name,
        category: transaction.category,
        date: transaction.date,
        location: transaction.location || {}
      };

      // Enhanced context for road trip scenario
      const enhancedUserContext = {
        recentSplits: [
          { participants: ['user_001', 'user_002', 'user_003', 'user_007'], merchant: 'MGM Grand', category: 'travel' },
          { participants: ['user_001', 'user_002', 'user_003', 'user_007'], merchant: 'National Park Service', category: 'travel' },
          { participants: ['user_001', 'user_002', 'user_003'], merchant: 'The French Laundry', category: 'dining' },
          { participants: ['user_001', 'user_004'], merchant: 'Uber', category: 'transport' }
        ],
        preferences: {
          favoriteGroups: ['group_005'], // Road Trip Crew is preferred
          defaultSplitType: 'equal'
        },
        currentTrip: {
          name: 'SFO to Moab Road Trip',
          dates: '2024-03-10 to 2024-03-20',
          locations: ['San Francisco', 'Yosemite', 'Death Valley', 'Las Vegas', 'Zion', 'Page', 'Moab'],
          participants: ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Jordan Kim']
        }
      };

      // Use GPT to analyze the transaction and suggest splits
      let aiAnalysisAttempted = false;
      let aiSuggestion;
      
      try {
        aiAnalysisAttempted = true;
        aiSuggestion = await openaiService.analyzeSplitSuggestion(
          aiTransaction,
          groupsWithMembers,
          enhancedUserContext
        );
        
        console.log('✅ OpenAI successful! Suggestion:', JSON.stringify(aiSuggestion, null, 2));

        // Mock saving suggestion to database (since no Supabase)
        const savedSuggestionId = 'split_' + Date.now();

        return new Response(JSON.stringify({
          success: true,
          suggestion: {
            id: savedSuggestionId,
            transactionId,
            confidence: aiSuggestion.confidence,
            splitType: aiSuggestion.splitType,
            reasoning: aiSuggestion.reasoning,
            suggestedParticipants: aiSuggestion.suggestedParticipants,
            amounts: aiSuggestion.amounts,
            matchedGroup: aiSuggestion.matchedGroup,
            groupSuggestions: aiSuggestion.groupSuggestions || [],
            categories: aiSuggestion.categories || [],
            aiAnalysisAttempted: aiAnalysisAttempted
          }
        }), {
          headers: { 'Content-Type': 'application/json' },
        });

      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        
        // Store error details for debugging
        const errorDetails = {
          message: aiError instanceof Error ? aiError.message : String(aiError),
          stack: aiError instanceof Error ? aiError.stack?.substring(0, 500) : 'No stack trace',
          type: typeof aiError
        };
        
        // Fallback to simple equal split with first available group
        const fallbackGroup = groupsWithMembers[0];
        if (fallbackGroup) {
          const amount = Math.abs(transaction.amount);
          const participants = fallbackGroup.members;
          const equalAmount = participants.length > 0 ? amount / participants.length : amount;
          
          const fallbackSuggestion = {
            confidence: 0.5,
            splitType: 'equal' as const,
            reasoning: 'Basic equal split suggestion (AI analysis unavailable)',
            suggestedParticipants: participants.map((member: {id: string; name: string; email: string}) => ({
              id: member.id,
              name: member.name,
              confidence: 0.5,
              reason: 'Default group member'
            })),
            amounts: participants.reduce((acc: { [userId: string]: number }, member: {id: string; name: string; email: string}) => {
              acc[member.id] = parseFloat(equalAmount.toFixed(2));
              return acc;
            }, {} as { [userId: string]: number }),
            matchedGroup: fallbackGroup,
            categories: ['general']
          };

          // Create multiple group suggestions for fallback
          const fallbackGroupSuggestions = groupsWithMembers.map((group, index) => ({
            group: group,
            confidence: index === 0 ? 0.6 : Math.max(0.4, 0.6 - (index * 0.15)),
            reasoning: index === 0 ? 'Best available group match' : `Alternative option based on group size and category`,
            matchingFactors: index === 0 ? ['category_fit'] : ['group_available']
          }));

          return new Response(JSON.stringify({
            success: true,
            suggestion: {
              id: 'fallback_' + Date.now(),
              transactionId,
              ...fallbackSuggestion,
              groupSuggestions: fallbackGroupSuggestions,
              errorDetails: errorDetails // Add error details to the response
            }
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            error: 'No expense groups available for split suggestions'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

    } catch (error) {
      console.error('Error generating split suggestions:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to generate split suggestions'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error generating split suggestions:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate split suggestions'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}