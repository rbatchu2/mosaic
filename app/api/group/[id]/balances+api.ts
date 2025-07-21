export async function GET(request: Request, context?: any) {
  try {
    // Extract group ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const groupId = pathParts[pathParts.indexOf('group') + 1];
    
    // Generate realistic balances based on group type and recent activity
    const generateBalancesForGroup = (groupId: string) => {
      if (groupId.includes('dining') || groupId === '30000000-0000-0000-0000-000000000001') {
        // Dining group with 4 members - more active spending
        return [
          {
            userId: '1',
            userName: 'You',
            balance: 156.83, // You paid for the expensive Le Bernardin dinner
            totalPaid: 523.48,
            totalOwed: 366.65,
            recentTransactions: 8,
            lastPayment: '2024-01-20T08:30:00Z',
            avgMonthlySpend: 425.30,
            mostFrequentCategory: 'Fine Dining'
          },
          {
            userId: '2',
            userName: 'Sarah',
            balance: -45.22,
            totalPaid: 137.60,
            totalOwed: 182.82,
            recentTransactions: 6,
            lastPayment: '2024-01-18T16:45:00Z',
            avgMonthlySpend: 278.90,
            mostFrequentCategory: 'Brunch & Coffee'
          },
          {
            userId: '3',
            userName: 'Mike',
            balance: -67.45,
            totalPaid: 83.19,
            totalOwed: 150.64,
            recentTransactions: 4,
            lastPayment: '2024-01-15T00:00:00Z',
            avgMonthlySpend: 195.50,
            mostFrequentCategory: 'Takeout & Delivery'
          },
          {
            userId: '4',
            userName: 'Emma',
            balance: -44.16,
            totalPaid: 0.00,
            totalOwed: 44.16,
            recentTransactions: 3,
            lastPayment: null,
            avgMonthlySpend: 156.80,
            mostFrequentCategory: 'Casual Dining',
            isNewMember: true
          }
        ];
      } else if (groupId.includes('transport') || groupId === '30000000-0000-0000-0000-000000000002') {
        // Transport group - split rides and gas
        return [
          {
            userId: '1',
            userName: 'You',
            balance: 52.37,
            totalPaid: 164.30,
            totalOwed: 111.93,
            recentTransactions: 5,
            lastPayment: '2024-01-20T08:30:00Z',
            avgMonthlySpend: 180.45,
            mostFrequentCategory: 'Gas & Parking'
          },
          {
            userId: '2',
            userName: 'Sarah',
            balance: 28.47,
            totalPaid: 211.25,
            totalOwed: 182.78,
            recentTransactions: 7,
            lastPayment: '2024-01-19T05:30:00Z',
            avgMonthlySpend: 195.60,
            mostFrequentCategory: 'Rideshare'
          },
          {
            userId: '3',
            userName: 'Mike',
            balance: -80.84,
            totalPaid: 31.09,
            totalOwed: 111.93,
            recentTransactions: 3,
            lastPayment: '2024-01-15T00:00:00Z',
            avgMonthlySpend: 124.30,
            mostFrequentCategory: 'Public Transport'
          }
        ];
      } else {
        // Household/other groups
        return [
          {
            userId: '1',
            userName: 'You',
            balance: 73.29,
            totalPaid: 268.98,
            totalOwed: 195.69,
            recentTransactions: 6,
            lastPayment: '2024-01-20T08:30:00Z',
            avgMonthlySpend: 245.80,
            mostFrequentCategory: 'Groceries & Supplies'
          },
          {
            userId: '2',
            userName: 'Sarah',
            balance: -15.67,
            totalPaid: 169.79,
            totalOwed: 185.46,
            recentTransactions: 5,
            lastPayment: '2024-01-18T16:45:00Z',
            avgMonthlySpend: 198.50,
            mostFrequentCategory: 'Utilities'
          },
          {
            userId: '3',
            userName: 'Mike',
            balance: -57.62,
            totalPaid: 127.67,
            totalOwed: 185.29,
            recentTransactions: 4,
            lastPayment: '2024-01-15T00:00:00Z',
            avgMonthlySpend: 167.90,
            mostFrequentCategory: 'Household Items'
          }
        ];
      }
    };

    const mockBalances = generateBalancesForGroup(groupId);

    // Calculate total group stats
    const totalSpent = mockBalances.reduce((sum, balance) => sum + balance.totalPaid, 0);
    const totalTransactions = mockBalances.reduce((sum, balance) => sum + balance.recentTransactions, 0);
    
    // Calculate settlement suggestions
    const settlements = [];
    const positiveBalances = mockBalances.filter(b => b.balance > 0);
    const negativeBalances = mockBalances.filter(b => b.balance < 0);
    
    for (const creditor of positiveBalances) {
      for (const debtor of negativeBalances) {
        if (Math.abs(debtor.balance) > 0.01 && creditor.balance > 0.01) {
          const settleAmount = Math.min(creditor.balance, Math.abs(debtor.balance));
          if (settleAmount > 0.01) {
            settlements.push({
              from: debtor.userName,
              to: creditor.userName,
              amount: settleAmount,
              description: `${debtor.userName} pays ${creditor.userName}`
            });
            // Update balances for next iteration
            creditor.balance -= settleAmount;
            debtor.balance += settleAmount;
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      balances: mockBalances.map(balance => ({
        ...balance,
        // Reset balance to original for display
        balance: balance.userId === '1' ? 26.73 : 
                 balance.userId === '2' ? -7.47 : -19.26
      })),
      summary: {
        totalSpent,
        totalTransactions,
        groupSize: mockBalances.length,
        avgSpentPerPerson: totalSpent / mockBalances.length
      },
      settlements: settlements.filter(s => s.amount > 0.01)
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching group balances:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch group balances'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 