export async function POST(request: Request) {
  try {
    const { tripId, amount, travelers, dates, preferences } = await request.json();

    if (!tripId || !amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Mock booking process
    const booking = {
      id: 'booking_' + Date.now(),
      tripId,
      amount,
      travelers: travelers || 1,
      dates: dates || {
        departure: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        return: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString()
      },
      status: 'confirmed',
      confirmationCode: 'TRV' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      paymentStatus: 'completed',
      includes: [
        'Round-trip flights',
        'Hotel accommodation',
        'Guided tours',
        'Travel insurance',
        'Airport transfers'
      ]
    };

    // In a real app, this would:
    // 1. Process payment
    // 2. Book actual flights/hotels
    // 3. Send confirmation emails
    // 4. Create calendar events

    return new Response(JSON.stringify({
      success: true,
      booking,
      message: 'Trip booked successfully!'
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Booking failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '1';
    const status = url.searchParams.get('status');

    // Mock user bookings
    const bookings = [
      {
        id: 'booking_1',
        tripId: '1',
        tripTitle: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        amount: 2850,
        travelers: 2,
        dates: {
          departure: '2024-07-15T10:00:00Z',
          return: '2024-07-22T18:00:00Z'
        },
        status: 'confirmed',
        confirmationCode: 'TRVAB123C',
        createdAt: '2024-06-10T14:30:00Z',
        paymentStatus: 'completed'
      },
      {
        id: 'booking_2',
        tripId: '2',
        tripTitle: 'Paris Romance',
        destination: 'Paris, France',
        amount: 2200,
        travelers: 2,
        dates: {
          departure: '2024-08-20T09:00:00Z',
          return: '2024-08-25T16:00:00Z'
        },
        status: 'pending',
        confirmationCode: 'TRVCD456E',
        createdAt: '2024-06-08T11:15:00Z',
        paymentStatus: 'pending'
      }
    ];

    let filteredBookings = bookings;
    if (status) {
      filteredBookings = bookings.filter(b => b.status === status);
    }

    return new Response(JSON.stringify({
      success: true,
      bookings: filteredBookings
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