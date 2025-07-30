import { supabaseService } from '../../services/supabaseService';
import { getGroups, addGroup } from './file-store';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

    // Get groups from file store
    const groups = await getGroups();
    
    console.log('Returning groups from API:', groups.length, groups.map(g => g.name));

    return new Response(JSON.stringify({
      success: true,
      groups: groups
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
    const { 
      name, 
      description, 
      category, 
      userId, 
      memberCount, 
      estimatedBudget, 
      duration, 
      destination 
    } = await request.json();

    if (!name || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name and userId are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Helper function to get category colors
    const getCategoryColor = (cat: string): string => {
      const colors: { [key: string]: string } = {
        dining: '#EF4444',
        transport: '#3B82F6', 
        household: '#10B981',
        entertainment: '#8B5CF6',
        travel: '#F59E0B',
        other: '#6B7280'
      };
      return colors[cat] || colors.other;
    };

    // Create new group with enhanced properties
    const newGroup = {
      id: 'group_' + Date.now(),
      name,
      description: description || `${category === 'travel' ? 'Trip to' : 'Group for'} ${name}`,
      category: category || 'other',
      color: getCategoryColor(category || 'other'),
      memberCount: memberCount || 2,
      user_id: userId,
      created_at: new Date().toISOString(),
      balance: 0,
      totalSpent: 0,
      savings: 0,
      estimatedBudget: estimatedBudget || null,
      duration: duration || null,
      destination: destination || null,
      tripDate: category === 'travel' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    // Add to file store
    await addGroup(newGroup);

    return new Response(JSON.stringify({
      success: true,
      group: newGroup,
      message: `Successfully created ${category === 'travel' ? 'trip' : 'group'}: ${name}${estimatedBudget ? ` with $${estimatedBudget} budget` : ''}`
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