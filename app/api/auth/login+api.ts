export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Mock authentication - in production, use proper auth service
    if (email && password) {
      const user = {
        id: '1',
        email,
        name: 'Alex Johnson',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=150',
        memberSince: 'January 2023',
        stats: {
          savingsRate: 23,
          goalsCompleted: 4,
          monthlyAverage: 1247,
        }
      };

      return Response.json({
        success: true,
        user,
        token: 'mock-jwt-token'
      });
    }

    return Response.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}