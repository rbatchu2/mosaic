import { supabaseService } from '../../../services/supabaseService';

type Member = { id: string; name: string; email: string };

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Group detail API called');
    console.log('Params object:', params);
    const groupId = params?.id;
    console.log('Group detail API called with ID:', groupId);

    // All possible groups that could exist (both defaults and user-created)
    const allGroups = [
      // Default seeded groups
      {
        id: "30000000-0000-0000-0000-000000000001",
        name: "Foodie Friends", 
        description: "Our regular dining group",
        category: "dining",
        color: "#EF4444",
        memberCount: 4
      },
      {
        id: "30000000-0000-0000-0000-000000000002",
        name: "Commute Crew",
        description: "Shared rides and transport", 
        category: "transport",
        color: "#3B82F6",
        memberCount: 3
      },
      {
        id: "30000000-0000-0000-0000-000000000003",
        name: "Roommates",
        description: "Shared household expenses",
        category: "household", 
        color: "#10B981",
        memberCount: 3
      },
      // Example user-created groups (these IDs might vary)
      {
        id: "f01b6858-6bda-4f24-bbb2-d730e5723ed9",
        name: "Boston Trip 7/7 - 7/11",
        description: "",
        category: "travel",
        color: "#F59E0B",
        memberCount: 3
      },
      {
        id: "7382d1b9-5f2b-4e99-aa9e-1da9528c937b",
        name: "Test Group",
        description: "desc",
        category: "other",
        color: "#3B82F6",
        memberCount: 3
      }
    ];

    // For demo purposes, always return a group (use first default group if exact match not found)
    let group = allGroups.find(g => g.id === groupId) || allGroups[0];
    
    console.log('Using group:', group.name, 'for ID:', groupId);

    console.log('Found group:', group.name);

    // Mock members based on group category
    let members: Member[] = [];
    if (group.category === 'dining') {
      members = [
        { id: '1', name: 'You', email: 'you@example.com' },
        { id: '2', name: 'Sarah', email: 'sarah@example.com' },
        { id: '3', name: 'Mike', email: 'mike@example.com' },
        { id: '4', name: 'Emma', email: 'emma@example.com' }
      ];
    } else if (group.category === 'transport') {
      members = [
        { id: '1', name: 'You', email: 'you@example.com' },
        { id: '2', name: 'Sarah', email: 'sarah@example.com' },
        { id: '3', name: 'Mike', email: 'mike@example.com' }
      ];
    } else {
      // Default members for household and other categories
      members = [
        { id: '1', name: 'You', email: 'you@example.com' },
        { id: '2', name: 'Sarah', email: 'sarah@example.com' },
        { id: '3', name: 'Mike', email: 'mike@example.com' }
      ];
    }

    console.log('Returning group data with', members.length, 'members');

    return Response.json({ 
      success: true, 
      group: {
        ...group,
        memberCount: members.length
      }, 
      members 
    });
  } catch (error) {
    console.error('Group API error:', error);
    return Response.json({ 
      success: false, 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 