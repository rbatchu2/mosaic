export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In production, use actual Plaid client
    // const plaidClient = new PlaidApi(configuration);
    // const response = await plaidClient.linkTokenCreate({
    //   user: { client_user_id: userId },
    //   client_name: 'WalletShare',
    //   products: [Products.Transactions],
    //   country_codes: [CountryCode.Us],
    //   language: 'en',
    // });

    // Mock link token for development
    const linkToken = {
      link_token: 'link-development-' + Math.random().toString(36).substr(2, 20),
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };

    return new Response(JSON.stringify({
      success: true,
      linkToken: linkToken.link_token,
      expiration: linkToken.expiration
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create link token'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}