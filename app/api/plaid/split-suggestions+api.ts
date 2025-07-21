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

    // Get transaction data from Supabase
    const transactions = await supabaseService.getTransactions(userId, undefined, 100);
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Transaction not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get expense groups from Supabase
    const expenseGroups = await supabaseService.getExpenseGroups(userId);
    
    // Get group members for each group
    const groupsWithMembers = await Promise.all(
      expenseGroups.map(async (group) => {
        const members = await supabaseService.getGroupMembers(group.id);
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          category: group.category,
          members: members.map(member => ({
            id: member.user_id || member.id,
            name: member.name,
            email: member.email
          })),
          context: {
            keywords: group.category === 'dining' 
              ? ['restaurant', 'dinner', 'food', 'dining', 'brunch']
              : group.category === 'transport'
              ? ['uber', 'lyft', 'taxi', 'transport', 'ride']
              : ['expense', 'bill', 'payment'],
            locations: ['San Francisco', 'Bay Area'],
            merchants: []
          }
        };
      })
    );

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

      // Use GPT to analyze the transaction and suggest splits
      const aiSuggestion = await openaiService.analyzeSplitSuggestion(
        aiTransaction,
        groupsWithMembers,
        {
          recentSplits: [
            { participants: ['1', '2', '3', '4'], merchant: 'Restaurant ABC', category: 'dining' },
            { participants: ['1', '2'], merchant: 'Uber', category: 'transport' },
            { participants: ['1', '2', '3'], merchant: 'Coffee Shop', category: 'dining' }
          ],
          preferences: {
            favoriteGroups: expenseGroups.slice(0, 1).map(g => g.id),
            defaultSplitType: 'equal'
          }
        }
      );

      // Save suggestion to database
      const savedSuggestion = await supabaseService.createSplitSuggestion({
        user_id: userId,
        transaction_id: transactionId,
        group_id: aiSuggestion.matchedGroup?.id || undefined,
        confidence: aiSuggestion.confidence,
        split_type: aiSuggestion.splitType,
        reasoning: aiSuggestion.reasoning,
        participants: JSON.stringify(aiSuggestion.suggestedParticipants),
        amounts: JSON.stringify(aiSuggestion.amounts),
        status: 'pending'
      });

      return new Response(JSON.stringify({
        success: true,
        suggestion: {
          id: savedSuggestion?.id || 'temp_id',
          transactionId,
          confidence: aiSuggestion.confidence,
          splitType: aiSuggestion.splitType,
          reasoning: aiSuggestion.reasoning,
          suggestedParticipants: aiSuggestion.suggestedParticipants,
          amounts: aiSuggestion.amounts,
          matchedGroup: aiSuggestion.matchedGroup,
          groupSuggestions: aiSuggestion.groupSuggestions || [],
          categories: aiSuggestion.categories
        }
      }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      
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
          suggestedParticipants: participants.map(member => ({
            id: member.id,
            name: member.name,
            confidence: 0.5,
            reason: 'Default group member'
          })),
          amounts: participants.reduce((acc, member) => {
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
            groupSuggestions: fallbackGroupSuggestions
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
    console.error('Error generating split suggestion:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate split suggestion'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}