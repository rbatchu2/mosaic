interface SplitBillRequest {
  amount: number;
  description: string;
  participants: string[];
  tip?: number;
  tax?: number;
  splitType: 'equal' | 'custom' | 'percentage';
  customAmounts?: { [userId: string]: number };
  walletId?: string;
}

export async function POST(request: Request) {
  try {
    const {
      amount,
      description,
      participants,
      tip = 0,
      tax = 0,
      splitType = 'equal',
      customAmounts,
      walletId
    }: SplitBillRequest = await request.json();

    if (!amount || !description || !participants || participants.length === 0) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const totalAmount = amount + tip + tax;
    let splits: { [userId: string]: number } = {};

    switch (splitType) {
      case 'equal':
        const equalShare = totalAmount / participants.length;
        participants.forEach(userId => {
          splits[userId] = parseFloat(equalShare.toFixed(2));
        });
        break;

      case 'custom':
        if (!customAmounts) {
          return Response.json(
            { success: false, error: 'Custom amounts required for custom split' },
            { status: 400 }
          );
        }
        splits = customAmounts;
        break;

      case 'percentage':
        // For percentage-based splits (implementation would depend on frontend input)
        const equalPercentage = 100 / participants.length;
        participants.forEach(userId => {
          splits[userId] = parseFloat((totalAmount * (equalPercentage / 100)).toFixed(2));
        });
        break;
    }

    // Validate that splits add up to total amount
    const splitTotal = Object.values(splits).reduce((sum, amount) => sum + amount, 0);
    if (Math.abs(splitTotal - totalAmount) > 0.01) {
      return Response.json(
        { success: false, error: 'Split amounts do not match total' },
        { status: 400 }
      );
    }

    const billSplit = {
      id: Date.now().toString(),
      description,
      totalAmount,
      baseAmount: amount,
      tip,
      tax,
      splitType,
      splits,
      participants,
      walletId,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // If walletId is provided, create transactions for the wallet
    if (walletId) {
      for (const [userId, splitAmount] of Object.entries(splits)) {
        // Create transaction for each participant
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletId,
            description: `${description} - Split bill`,
            amount: -splitAmount,
            category: 'split-bill',
            userId,
            userName: `User ${userId}`
          })
        });
      }
    }

    return Response.json({
      success: true,
      billSplit,
      message: 'Bill split successfully'
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const billId = url.searchParams.get('billId');
    const userId = url.searchParams.get('userId');

    // Mock bill splits data
    const billSplits = [
      {
        id: '1',
        description: 'Dinner at Italian Restaurant',
        totalAmount: 156.50,
        baseAmount: 140.00,
        tip: 16.50,
        tax: 0,
        splitType: 'equal',
        splits: {
          '1': 39.13,
          '2': 39.13,
          '3': 39.12,
          '4': 39.12
        },
        participants: ['1', '2', '3', '4'],
        walletId: '3',
        createdAt: '2024-06-08T19:30:00Z',
        status: 'completed'
      }
    ];

    if (billId) {
      const bill = billSplits.find(b => b.id === billId);
      if (!bill) {
        return Response.json(
          { success: false, error: 'Bill not found' },
          { status: 404 }
        );
      }
      return Response.json({ success: true, billSplit: bill });
    }

    let filteredBills = billSplits;
    if (userId) {
      filteredBills = billSplits.filter(bill => bill.participants.includes(userId));
    }

    return Response.json({ success: true, billSplits: filteredBills });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}