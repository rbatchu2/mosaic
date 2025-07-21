import { supabaseService } from '../../../services/supabaseService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

    let accounts;
    
    try {
      // Try to fetch accounts from Supabase
      accounts = await supabaseService.getAccounts(userId);
    } catch (error) {
      console.log('Supabase not available, using mock data:', error);
      accounts = null;
    }
    
    // Fallback to mock data if Supabase fails or no accounts found
    if (!accounts || accounts.length === 0) {
      const mockAccounts = [
        {
          id: 'acc_checking_001',
          name: 'Premier Checking',
          type: 'depository',
          subtype: 'checking',
          balance: 4238.60,
          institution: 'Chase Bank',
          mask: '0000'
        },
        {
          id: 'acc_savings_001',
          name: 'Savings Account',
          type: 'depository',
          subtype: 'savings',
          balance: 12847.30,
          institution: 'Chase Bank',
          mask: '1111'
        },
        {
          id: 'acc_credit_001',
          name: 'Freedom Unlimited',
          type: 'credit',
          subtype: 'credit card',
          balance: -1234.56,
          institution: 'Chase Bank',
          mask: '2222'
        }
      ];

      return new Response(JSON.stringify({
        success: true,
        accounts: mockAccounts
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Transform database format to API format
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      balance: account.balance,
      institution: account.institution,
      mask: account.mask
    }));

    return new Response(JSON.stringify({
      success: true,
      accounts: formattedAccounts
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch accounts'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}