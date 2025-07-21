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

    let groups;
    
    try {
      // Try to fetch groups from Supabase
      groups = await supabaseService.getExpenseGroups(userId);
    } catch (error) {
      console.log('Supabase not available, using mock data:', error);
      groups = null;
    }
    
    // Fallback to mock data if Supabase fails
    if (!groups || groups.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        groups: groupsMemory
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get member counts for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const members = await supabaseService.getGroupMembers(group.id);
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          category: group.category,
          color: group.color,
          memberCount: members.length
        };
      })
    );

    return new Response(JSON.stringify({
      success: true,
      groups: groupsWithCounts
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
    const { name, description, category, color, members, userId } = await request.json();

    if (!name || !category) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name and category are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groupData = {
      user_id: userId || '00000000-0000-0000-0000-000000000001',
      name,
      description: description || '',
      category,
      color: color || '#3B82F6'
    };

    try {
      // Try to create group in Supabase
      const newGroup = await supabaseService.createExpenseGroup(groupData);
      
      if (newGroup && members && members.length > 0) {
        // Add members to the group - using direct client access
        // TODO: Add createGroupMember method to supabaseService
        console.log('Group created successfully, members would be added here');
      }

      return new Response(JSON.stringify({
        success: true,
        group: {
          id: newGroup?.id,
          name,
          description,
          category,
          color,
          memberCount: members ? members.length : 0
        }
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (supabaseError) {
      console.log('Supabase not available, using mock response:', supabaseError);
      
      // Mock response when Supabase is not available
      const mockGroup = {
        id: 'group_' + Date.now(),
        name,
        description,
        category,
        color,
        memberCount: members ? members.length : 0
      };

      groupsMemory.push(mockGroup);

      return new Response(JSON.stringify({
        success: true,
        group: mockGroup
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
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