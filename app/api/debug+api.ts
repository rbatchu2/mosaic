import { getGroups, addGroup } from './file-store';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';
    
    if (action === 'status') {
      const groups = await getGroups();
      return new Response(JSON.stringify({
        success: true,
        action: 'status',
        groupsCount: groups.length,
        groups: groups.map(g => ({ id: g.id, name: g.name, category: g.category }))
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'add-test-group') {
      const testGroup = {
        id: 'test_group_' + Date.now(),
        name: 'Test Wallet from Debug',
        description: 'This is a test wallet created via debug API',
        category: 'other',
        color: '#6B7280',
        memberCount: 2,
        user_id: '1',
        created_at: new Date().toISOString(),
        balance: 0,
        totalSpent: 0,
        savings: 0
      };
      
      await addGroup(testGroup);
      
      return new Response(JSON.stringify({
        success: true,
        action: 'add-test-group',
        message: 'Test group added successfully',
        group: testGroup
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Unknown action'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Debug API error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 