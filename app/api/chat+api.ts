interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestions?: string[];
  tripSuggestions?: any[];
  paymentRequest?: any;
}

// Mock AI responses with financial context
const generateFinancialResponse = (userMessage: string, context?: any): { text: string; suggestions?: string[] } => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('analyz') || lowerMessage.includes('spending') || lowerMessage.includes('pattern')) {
    return {
      text: "Based on your recent transactions, you're spending 36% on food & dining ($1,245.50), which is above the recommended 25%. Your transportation costs are 24% ($845.30), and entertainment is 16% ($567.80). Consider setting a monthly dining budget of $800 to optimize your savings.",
      suggestions: [
        "Set dining budget",
        "Track daily expenses", 
        "Find cooking recipes",
        "Show category breakdown"
      ]
    };
  }
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return {
      text: "Great question! I notice you could save $200/month by reducing dining out by just 2 meals per week. Your current savings rate is 23%, which is excellent! This would help you reach your vacation fund goal 2 months earlier and boost your overall savings rate to 28%.",
      suggestions: [
        "Set up auto-savings",
        "Create meal plans",
        "Find discounts",
        "Track progress"
      ]
    };
  }
  
  if (lowerMessage.includes('vacation') || lowerMessage.includes('fund') || lowerMessage.includes('progress')) {
    return {
      text: "Your vacation fund is at 57% completion ($2,847 of $5,000). At your current contribution rate of $400/month from 4 members, you'll reach your goal by July 15th. Sarah has contributed the most ($950), followed by you ($800). Want me to suggest ways to accelerate this?",
      suggestions: [
        "Invite more friends",
        "Set up auto-contributions",
        "Find cheaper alternatives",
        "Create milestone rewards"
      ]
    };
  }
  
  if (lowerMessage.includes('split') || lowerMessage.includes('bill') || lowerMessage.includes('restaurant')) {
    return {
      text: "I can help you split bills efficiently! Just tell me the total amount and who was involved. I'll calculate everyone's share and can even send payment requests through your shared wallets. For restaurants, I can also factor in tax and tip automatically.",
      suggestions: [
        "Split restaurant bill",
        "Split utility bill",
        "Add custom tip",
        "Send payment requests"
      ]
    };
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('limit')) {
    return {
      text: "Based on your income and spending patterns, I recommend a 50/30/20 budget: 50% for needs ($2,100), 30% for wants ($1,260), and 20% for savings ($840). You're currently saving 23%, which is above the recommended 20% - excellent work!",
      suggestions: [
        "Set category limits",
        "Track monthly progress",
        "Adjust budget",
        "View spending alerts"
      ]
    };
  }
  
  if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
    return {
      text: "You have 3 active savings goals: Vacation Fund (57% complete), House Expenses (62% complete), and Dinner Club (31% complete). Your total goal amount is $7,500 with $4,238 saved. You're on track to complete all goals within your target timeframes!",
      suggestions: [
        "Create new goal",
        "Adjust timelines",
        "Set milestones",
        "Share with friends"
      ]
    };
  }
  
  if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('vacation') || lowerMessage.includes('japan') || lowerMessage.includes('paris') || lowerMessage.includes('new york')) {
    const tripSuggestions = [
      {
        id: '1',
        title: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        duration: '7 days',
        price: 2850,
        rating: 4.8,
        image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
        highlights: ['Shibuya Crossing', 'Mount Fuji', 'Traditional Temples'],
        category: 'Cultural'
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
      }
    ];
    
    return {
      text: "I found some amazing trip options for you! Based on your budget and preferences, here are my top recommendations. Each includes flights, accommodation, and guided tours. Would you like me to help you book any of these?",
      tripSuggestions,
      suggestions: [
        "Show more destinations",
        "Filter by budget",
        "Add travel dates",
        "Book selected trip"
      ]
    };
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('interested') || lowerMessage.includes('hotel') || lowerMessage.includes('flight')) {
    const paymentRequest = {
      id: 'payment_' + Date.now(),
      description: 'Tokyo Adventure Package',
      amount: 2850,
      currency: 'USD',
      breakdown: [
        { item: 'Round-trip flights', cost: 1200 },
        { item: 'Hotel (7 nights)', cost: 980 },
        { item: 'Guided tours', cost: 450 },
        { item: 'Travel insurance', cost: 120 },
        { item: 'Airport transfers', cost: 100 }
      ]
    };
    
    return {
      text: "Perfect choice! I can help you book the Tokyo Adventure package. Here's the complete breakdown of costs. This includes everything you need for an amazing 7-day trip. Would you like to proceed with the payment?",
      paymentRequest,
      suggestions: [
        "Modify package",
        "Add travel insurance",
        "Change dates",
        "Split with friends"
      ]
    };
  }
  
  return {
    text: "I'm your AI financial assistant! I can help you analyze spending patterns, optimize savings, manage shared wallets, split bills, set budgets, and track your financial goals. What would you like to explore today?",
    suggestions: [
      "Analyze my spending",
      "Show savings tips",
      "Check goal progress",
      "Plan a trip"
    ]
  };
};

export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Message is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate contextual response
    const response = generateFinancialResponse(message);

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      text: response.text,
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: response.suggestions,
      tripSuggestions: response.tripSuggestions,
      paymentRequest: response.paymentRequest
    };

    return new Response(JSON.stringify({
      success: true,
      message: aiMessage,
      conversationId: conversationId || 'default'
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
    const conversationId = url.searchParams.get('conversationId') || 'default';

    // Return conversation history (mock implementation)
    const initialMessage: ChatMessage = {
      id: '1',
      text: "Hi! I'm your financial assistant. I can help you analyze your spending, set savings goals, and manage your shared wallets. What would you like to know?",
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: [
        "Analyze my spending patterns",
        "How can I save more money?",
        "Show vacation fund progress",
        "Split a restaurant bill"
      ]
    };

    return new Response(JSON.stringify({
      success: true,
      messages: [initialMessage],
      conversationId
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