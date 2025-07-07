// Mock user database
let users = [
  {
    id: '1',
    email: 'alex.johnson@email.com',
    name: 'Alex Johnson',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=150',
    memberSince: 'January 2023',
    stats: {
      savingsRate: 23,
      goalsCompleted: 4,
      monthlyAverage: 1247,
    },
    settings: {
      notifications: true,
      currency: 'USD',
      language: 'en',
      theme: 'light'
    },
    createdAt: '2023-01-15',
    updatedAt: '2024-06-10'
  }
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '1';

    const user = users.find(u => u.id === userId);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Remove sensitive data
    const { ...publicUser } = user;
    
    return new Response(JSON.stringify({
      success: true,
      user: publicUser
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, ...updates } = await request.json();
    const userIdToUpdate = userId || '1';

    const userIndex = users.findIndex(u => u.id === userIdToUpdate);
    if (userIndex === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const { ...publicUser } = users[userIndex];

    return new Response(JSON.stringify({
      success: true,
      user: publicUser
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}