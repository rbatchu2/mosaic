export async function POST(request: Request) {
  try {
    const { destination, budget, duration, travelers, interests } = await request.json();

    // Mock trip suggestions based on preferences
    const suggestions = [
      {
        id: '1',
        title: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        duration: '7 days',
        price: 2850,
        rating: 4.8,
        image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Shibuya Crossing', 'Mount Fuji', 'Traditional Temples'],
        category: 'Cultural',
        itinerary: [
          {
            day: 1,
            activities: [
              { time: '09:00', title: 'Arrival & Hotel Check-in', description: 'Settle into your hotel in Shibuya', price: 0, duration: '2h', category: 'logistics' },
              { time: '14:00', title: 'Shibuya Crossing Experience', description: 'Iconic pedestrian crossing and shopping', price: 50, duration: '3h', category: 'sightseeing' },
              { time: '19:00', title: 'Traditional Dinner', description: 'Authentic Japanese cuisine', price: 80, duration: '2h', category: 'dining' }
            ]
          },
          {
            day: 2,
            activities: [
              { time: '08:00', title: 'Mount Fuji Day Trip', description: 'Guided tour to Mount Fuji and Lake Kawaguchi', price: 150, duration: '10h', category: 'nature' },
              { time: '20:00', title: 'Onsen Experience', description: 'Relaxing hot spring bath', price: 40, duration: '2h', category: 'wellness' }
            ]
          }
        ]
      },
      {
        id: '2',
        title: 'Paris Romance',
        destination: 'Paris, France',
        duration: '5 days',
        price: 2200,
        rating: 4.9,
        image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'],
        category: 'Romance'
      },
      {
        id: '3',
        title: 'NYC Explorer',
        destination: 'New York, USA',
        duration: '4 days',
        price: 1800,
        rating: 4.7,
        image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Times Square', 'Central Park', 'Broadway Shows'],
        category: 'Urban'
      },
      {
        id: '4',
        title: 'Bali Retreat',
        destination: 'Bali, Indonesia',
        duration: '6 days',
        price: 1650,
        rating: 4.6,
        image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Rice Terraces', 'Beach Resorts', 'Temple Tours'],
        category: 'Relaxation'
      }
    ];

    // Filter suggestions based on budget if provided
    let filteredSuggestions = suggestions;
    if (budget) {
      const budgetNum = parseInt(budget);
      filteredSuggestions = suggestions.filter(s => s.price <= budgetNum);
    }

    return new Response(JSON.stringify({
      success: true,
      suggestions: filteredSuggestions,
      totalResults: filteredSuggestions.length
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const maxPrice = url.searchParams.get('maxPrice');

    // Return popular destinations
    const popularDestinations = [
      { name: 'Tokyo, Japan', category: 'Cultural', avgPrice: 2800 },
      { name: 'Paris, France', category: 'Romance', avgPrice: 2200 },
      { name: 'New York, USA', category: 'Urban', avgPrice: 1800 },
      { name: 'Bali, Indonesia', category: 'Relaxation', avgPrice: 1650 },
      { name: 'London, UK', category: 'Historical', avgPrice: 2400 },
      { name: 'Dubai, UAE', category: 'Luxury', avgPrice: 3200 }
    ];

    let filtered = popularDestinations;
    if (category) {
      filtered = filtered.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }
    if (maxPrice) {
      filtered = filtered.filter(d => d.avgPrice <= parseInt(maxPrice));
    }

    return new Response(JSON.stringify({
      success: true,
      destinations: filtered
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