export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock connected accounts
    const accounts = [
      {
        id: 'acc_checking_001',
        name: 'Premier Checking',
        type: 'depository',
        subtype: 'checking',
        balance: 4238.60,
        institution: 'Chase Bank',
        mask: '0000',
        isConnected: true,
        lastSync: new Date().toISOString()
      },
      {
        id: 'acc_savings_001',
        name: 'Savings Account',
        type: 'depository',
        subtype: 'savings',
        balance: 12847.30,
        institution: 'Chase Bank',
        mask: '1111',
        isConnected: true,
        lastSync: new Date().toISOString()
      },
      {
        id: 'acc_credit_001',
        name: 'Freedom Unlimited',
        type: 'credit',
        subtype: 'credit card',
        balance: -1234.56,
        institution: 'Chase Bank',
        mask: '2222',
        isConnected: true,
        lastSync: new Date().toISOString()
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      accounts
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch accounts'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}