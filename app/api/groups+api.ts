import { supabaseService } from '../../services/supabaseService';

// In-memory store when Supabase is unavailable
export let groupsMemory: any[] = [
  {
    id: 'group_1',
    name: 'Foodie Friends',
    description: 'Our regular dining group',
    category: 'dining',
    color: '#EF4444',
    memberCount: 4,
  },
  {
    id: 'group_2',
    name: 'Commute Crew',
    description: 'Shared rides and transport',
    category: 'transport',
    color: '#3B82F6',
    memberCount: 3,
  },
  {
    id: 'group_3',
    name: 'Roommates',
    description: 'Shared household expenses',
    category: 'household',
    color: '#10B981',
    memberCount: 3,
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

    // Use mock expense groups instead of Supabase
    const mockGroups = [
      {
        id: 'group_001',
        name: 'Foodie Friends',
        description: 'Regular dining group for restaurants and food experiences',
        category: 'dining',
        color: '#EF4444',
        memberCount: 3,
        user_id: userId,
        created_at: '2024-06-01T10:00:00Z'
      },
      {
        id: 'group_002',
        name: 'Commute Crew',
        description: 'Transportation sharing for daily commutes',
        category: 'transport',
        color: '#3B82F6',
        memberCount: 2,
        user_id: userId,
        created_at: '2024-06-02T15:30:00Z'
      },
      {
        id: 'group_003',
        name: 'House Mates',
        description: 'Household expenses and utilities',
        category: 'household',
        color: '#10B981',
        memberCount: 4,
        user_id: userId,
        created_at: '2024-06-03T09:15:00Z'
      },
      {
        id: 'group_004',
        name: 'Weekend Warriors',
        description: 'Entertainment and social activities',
        category: 'entertainment',
        color: '#8B5CF6',
        memberCount: 5,
        user_id: userId,
        created_at: '2024-06-04T18:45:00Z'
      },
      {
        id: 'group_005',
        name: 'Road Trip Crew',
        description: 'Epic SFO to Moab adventure - sharing all travel, lodging, and activity costs',
        category: 'travel',
        color: '#F59E0B',
        memberCount: 4,
        user_id: userId,
        created_at: '2024-03-08T12:00:00Z'
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      groups: mockGroups
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch groups'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, category, userId } = await request.json();

    if (!name || !description || !category || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock creating a new group
    const newGroup = {
      id: 'group_' + Date.now(),
      name,
      description,
      category,
      color: '#6B7280', // Default color
      memberCount: 1,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      group: newGroup,
      message: 'Group created successfully'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create group'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 