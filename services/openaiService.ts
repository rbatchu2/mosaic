import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Environment configuration for OpenAI
const getOpenAIConfig = () => {
  // On mobile, use EXPO_PUBLIC_ variables since process.env isn't available
  const apiKey = Platform.OS === 'web' 
    ? (process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY)
    : process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  
  const organization = Platform.OS === 'web'
    ? (process.env.OPENAI_ORGANIZATION || process.env.EXPO_PUBLIC_OPENAI_ORGANIZATION)
    : process.env.EXPO_PUBLIC_OPENAI_ORGANIZATION;
  
  const model = Platform.OS === 'web'
    ? (process.env.OPENAI_MODEL || process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini')
    : (process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini');

  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
  }

  return { apiKey, organization, model };
};

// OpenAI API client using fetch (React Native compatible)
class OpenAIClient {
  private apiKey: string;
  private organization?: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(config: { apiKey: string; organization?: string }) {
    this.apiKey = config.apiKey;
    this.organization = config.organization;
  }

  async createChatCompletion(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }
}

// Initialize OpenAI client
let openaiClient: OpenAIClient | null = null;

const getOpenAIClient = (): OpenAIClient => {
  if (!openaiClient) {
    const config = getOpenAIConfig();
    openaiClient = new OpenAIClient({
      apiKey: config.apiKey,
      organization: config.organization,
    });
  }
  return openaiClient;
};

// Interface definitions
interface Transaction {
  id: string;
  description: string;
  amount: number;
  merchantName?: string;
  category?: string[];
  date: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
  };
  aiInsights?: {
    merchantType?: string;
    isRecurring?: boolean;
    splitSuggestion?: string;
    tags?: string[];
  };
}

interface ExpenseGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  context: {
    keywords: string[];
    locations: string[];
    merchants: string[];
  };
}

interface SplitSuggestion {
  confidence: number;
  splitType: 'equal' | 'custom' | 'percentage';
  reasoning: string;
  suggestedParticipants: Array<{
    id: string;
    name: string;
    confidence: number;
    reason: string;
  }>;
  amounts: { [userId: string]: number };
  matchedGroup?: ExpenseGroup;
  groupSuggestions?: Array<{
    group: ExpenseGroup;
    confidence: number;
    reasoning: string;
    matchingFactors: string[];
  }>;
  categories: string[];
}

class OpenAIService {
  private model: string;

  constructor() {
    this.model = getOpenAIConfig().model;
  }

  /**
   * Analyze a transaction and suggest smart bill splitting
   */
  async analyzeSplitSuggestion(
    transaction: Transaction,
    expenseGroups: ExpenseGroup[],
    userContext?: {
      recentSplits?: Array<{ participants: string[]; merchant?: string; category?: string }>;
      preferences?: { favoriteGroups: string[]; defaultSplitType: string };
    }
  ): Promise<SplitSuggestion> {
    try {
      const client = getOpenAIClient();

      const prompt = this.buildSplitAnalysisPrompt(transaction, expenseGroups, userContext);

      const response = await client.createChatCompletion({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a financial AI assistant specialized in analyzing transactions and suggesting intelligent bill splitting. 
            
            Your goal is to:
            1. Analyze the transaction context (merchant, amount, description, location)
            2. Match it to the most appropriate expense group based on patterns
            3. Suggest participants with confidence scores
            4. Recommend the best split type (equal, custom, percentage)
            5. Provide clear reasoning for your recommendations
            
            CRITICAL: Respond ONLY with valid JSON. Do not include any text before or after the JSON. Use double quotes for all strings and property names. No comments allowed in JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      let suggestion: SplitSuggestion;
      try {
        suggestion = JSON.parse(content) as SplitSuggestion;
      } catch (parseError) {
        console.error('Failed to parse OpenAI split response:', content);
        console.error('Parse error:', parseError);
        
        // Try to extract JSON from response if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            suggestion = JSON.parse(jsonMatch[0]) as SplitSuggestion;
          } catch (secondParseError) {
            console.error('Second parse attempt failed:', secondParseError);
            throw new Error('Invalid JSON response from OpenAI');
          }
        } else {
          throw new Error('Invalid JSON response from OpenAI');
        }
      }
      
      // Map group names back to group objects and enhance with multiple suggestions
      if (suggestion.groupSuggestions) {
        suggestion.groupSuggestions = suggestion.groupSuggestions.map((groupSugg: any) => ({
          group: expenseGroups.find(g => g.name === groupSugg.groupName) || expenseGroups[0],
          confidence: groupSugg.confidence,
          reasoning: groupSugg.reasoning,
          matchingFactors: groupSugg.matchingFactors || []
        }));
      }

      // Set matchedGroup to the highest confidence group
      if (suggestion.groupSuggestions && suggestion.groupSuggestions.length > 0) {
        suggestion.matchedGroup = suggestion.groupSuggestions[0].group;
      }
      
      // Validate and ensure amounts add up correctly
      this.validateSplitSuggestion(suggestion, transaction.amount);
      
      return suggestion;

    } catch (error) {
      console.error('OpenAI split analysis error:', error);
      
      // Fallback to basic suggestion if AI fails
      return this.generateFallbackSuggestion(transaction, expenseGroups);
    }
  }

  /**
   * Generate intelligent chat responses for financial queries
   */
  async generateChatResponse(
    message: string,
    context?: {
      userProfile?: any;
      recentTransactions?: Transaction[];
      goalProgress?: any;
      spendingAnalysis?: any;
    }
  ): Promise<{
    text: string;
    suggestions: string[];
    actionItems?: Array<{
      type: 'split_bill' | 'set_budget' | 'create_goal' | 'analyze_spending';
      data?: any;
    }>;
  }> {
    try {
      const client = getOpenAIClient();

      const prompt = this.buildChatPrompt(message, context);

      const response = await client.createChatCompletion({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful financial AI assistant for a personal finance app called Mosaic. 
            
            Your capabilities include:
            - Analyzing spending patterns and providing insights
            - Helping with bill splitting and expense management
            - Setting and tracking financial goals
            - Budgeting advice and recommendations
            - Trip planning and expense forecasting
            
            Always provide helpful, actionable advice. Be conversational but professional. 
            If you can suggest specific actions the user can take in the app, include them in actionItems.
            
            FORMATTING GUIDELINES:
            - Use **text** for bold/important information (like costs, totals, key numbers)
            - Structure responses with clear sections and bullet points
            - Make financial amounts and key metrics stand out with bold formatting
            
            CRITICAL: Respond ONLY with valid JSON. Do not include any text before or after the JSON. Use double quotes for all strings and property names.
            
            Format:
            {
              "text": "Your response text with **bold formatting** for important information",
              "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
              "actionItems": [{"type": "action_type", "data": {}}]
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        console.error('Parse error:', parseError);
        
        // Try to extract JSON from response if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            console.error('Second parse attempt failed:', secondParseError);
          }
        }
        
        // Fallback response
        throw new Error('Invalid JSON response from OpenAI');
      }

    } catch (error) {
      console.error('OpenAI chat response error:', error);
      
      // Fallback response
      return {
        text: "I'm here to help with your finances! I can assist with analyzing spending, splitting bills, setting budgets, and tracking your financial goals. What would you like to explore?",
        suggestions: [
          "Analyze my spending patterns",
          "Help split a bill",
          "Set a new budget",
          "Track my goals"
        ]
      };
    }
  }

  /**
   * Categorize and enhance transaction data with AI
   */
  async enhanceTransactionData(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      const client = getOpenAIClient();

      // Process transactions in batches to avoid token limits
      const batchSize = 10;
      const enhancedTransactions: Transaction[] = [];

      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        
        const prompt = `Analyze these financial transactions and enhance them with better categorization and insights:

${batch.map((t, idx) => `
Transaction ${idx + 1}:
- Description: ${t.description}
- Merchant: ${t.merchantName || 'Unknown'}
- Amount: $${Math.abs(t.amount)}
- Current Category: ${t.category?.join(', ') || 'None'}
- Date: ${t.date}
`).join('\n')}

For each transaction, provide enhanced categorization and insights. Respond with valid JSON array:
[
  {
    "id": "transaction_id",
    "enhancedCategory": ["Primary Category", "Sub Category"],
    "merchantType": "restaurant|grocery|entertainment|transport|utility|other",
    "isRecurring": boolean,
    "splitSuggestion": "none|likely|recommended",
    "tags": ["tag1", "tag2"]
  }
]`;

        const response = await client.createChatCompletion({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a financial transaction categorization expert. Analyze transactions and provide enhanced categorization data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 800,
        });

        const content = response.choices?.[0]?.message?.content;
        if (content) {
          try {
            let enhancements;
            try {
              enhancements = JSON.parse(content);
            } catch (parseError) {
              console.error('Failed to parse enhancement response:', content);
              console.error('Parse error:', parseError);
              
              // Try to extract JSON array from response
              const jsonMatch = content.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                enhancements = JSON.parse(jsonMatch[0]);
              } else {
                throw parseError;
              }
            }
            
            // Apply enhancements to transactions
            batch.forEach((transaction, idx) => {
              const enhancement = enhancements[idx];
              if (enhancement) {
                enhancedTransactions.push({
                  ...transaction,
                  category: enhancement.enhancedCategory || transaction.category,
                  // Add additional AI insights as metadata
                  aiInsights: {
                    merchantType: enhancement.merchantType,
                    isRecurring: enhancement.isRecurring,
                    splitSuggestion: enhancement.splitSuggestion,
                    tags: enhancement.tags,
                  }
                });
              } else {
                enhancedTransactions.push(transaction);
              }
            });
          } catch (parseError) {
            console.error('Enhancement parsing failed completely:', parseError);
            // If parsing fails, return original transactions
            enhancedTransactions.push(...batch);
          }
        } else {
          enhancedTransactions.push(...batch);
        }
      }

      return enhancedTransactions;

    } catch (error) {
      console.error('Transaction enhancement error:', error);
      return transactions; // Return original data on error
    }
  }

  // Private helper methods
  private buildSplitAnalysisPrompt(
    transaction: Transaction,
    expenseGroups: ExpenseGroup[],
    userContext?: any
  ): string {
    return `Analyze this transaction for intelligent bill splitting:

TRANSACTION:
- Description: ${transaction.description}
- Merchant: ${transaction.merchantName || 'Unknown'}
- Amount: $${Math.abs(transaction.amount)}
- Category: ${transaction.category?.join(', ') || 'None'}
- Date: ${transaction.date}
- Location: ${transaction.location ? `${transaction.location.city}, ${transaction.location.region}` : 'Unknown'}

AVAILABLE EXPENSE GROUPS:
${expenseGroups.map((group, idx) => `
${idx + 1}. ${group.name} (${group.category})
   Members: ${group.members.map(m => m.name).join(', ')}
   Keywords: ${group.context.keywords.join(', ')}
   Merchants: ${group.context.merchants.join(', ')}
   Locations: ${group.context.locations.join(', ')}
`).join('\n')}

 ${userContext?.recentSplits ? `
 RECENT SPLIT PATTERNS:
 ${userContext.recentSplits.slice(0, 3).map((split: any, idx: number) => `
 - Split ${idx + 1}: ${split.participants.length} people, ${split.merchant || 'Unknown merchant'}, Category: ${split.category || 'Unknown'}
 `).join('\n')}
 ` : ''}

Analyze this transaction and provide a JSON response with the following structure:
{
  "confidence": 0.85,
  "splitType": "equal", 
  "reasoning": "This appears to be a restaurant expense that matches your dining group pattern",
  "suggestedParticipants": [
    {
      "id": "user_id",
      "name": "User Name", 
      "confidence": 0.9,
      "reason": "Frequently dines with this group"
    }
  ],
  "amounts": {
    "user_id": 25.50
  },
  "matchedGroup": "Best Group Name",
  "groupSuggestions": [
    {
      "groupName": "Primary Group",
      "confidence": 0.95,
      "reasoning": "Perfect match based on merchant and category",
      "matchingFactors": ["merchant_match", "category_fit", "location_proximity"]
    },
    {
      "groupName": "Secondary Group", 
      "confidence": 0.72,
      "reasoning": "Alternative option based on member overlap",
      "matchingFactors": ["member_overlap", "similar_patterns"]
    }
  ],
  "categories": ["dining", "social"]
}

IMPORTANT: Analyze ALL available groups and rank them by relevance. Provide 2-4 group suggestions ordered by confidence.

Consider for each group:
1. Transaction context (merchant type, amount, description)
2. Keyword and merchant matches from group context
3. Category alignment (dining, transport, household, etc.)
4. Location relevance 
5. Group member patterns and historical behavior
6. Transaction amount reasonableness for the group

For groupSuggestions, rank all groups that have >40% confidence. Include:
- Primary match (highest confidence)
- Alternative options (medium confidence) 
- Possible options (lower but viable confidence)

Use these matching factors: ["merchant_match", "category_perfect", "keyword_match", "location_fit", "amount_reasonable", "member_patterns", "historical_splits", "timing_context"]`;
  }

  private buildChatPrompt(message: string, context?: any): string {
    let prompt = `User message: "${message}"\n\n`;

    if (context?.recentTransactions?.length) {
      prompt += `Recent transactions context:\n${context.recentTransactions.slice(0, 5).map((t: Transaction) => 
        `- ${t.description}: $${Math.abs(t.amount)} at ${t.merchantName || 'Unknown'}`
      ).join('\n')}\n\n`;
    }

    if (context?.spendingAnalysis) {
      prompt += `Spending analysis:\n- Total spent: $${context.spendingAnalysis.totalSpent}\n- Savings rate: ${context.spendingAnalysis.savingsRate}%\n- Top category: ${context.spendingAnalysis.categories?.[0]?.name}\n\n`;
    }

    if (context?.goalProgress) {
      prompt += `Goal progress:\n- Active goals: ${context.goalProgress.activeGoals || 0}\n- Completion rate: ${context.goalProgress.completionRate || 0}%\n\n`;
    }

    prompt += `Provide a helpful response with actionable financial advice. Include 3-4 relevant follow-up suggestions.`;

    return prompt;
  }

  private validateSplitSuggestion(suggestion: SplitSuggestion, totalAmount: number): void {
    const calculatedTotal = Object.values(suggestion.amounts).reduce((sum, amount) => sum + amount, 0);
    const difference = Math.abs(calculatedTotal - Math.abs(totalAmount));
    
    // Allow for small rounding differences (up to 1 cent)
    if (difference > 0.01) {
      console.warn(`Split amounts don't match total: ${calculatedTotal} vs ${Math.abs(totalAmount)}`);
      
      // Adjust the first participant's amount to balance
      const participantIds = Object.keys(suggestion.amounts);
      if (participantIds.length > 0) {
        const adjustment = Math.abs(totalAmount) - calculatedTotal;
        suggestion.amounts[participantIds[0]] += adjustment;
      }
    }
  }

  private generateFallbackSuggestion(transaction: Transaction, expenseGroups: ExpenseGroup[]): SplitSuggestion {
    // Simple fallback logic when AI fails
    const defaultGroup = expenseGroups[0];
    const amount = Math.abs(transaction.amount);
    const participants = defaultGroup?.members || [];
    const equalAmount = participants.length > 0 ? amount / participants.length : amount;

    return {
      confidence: 0.5,
      splitType: 'equal',
      reasoning: 'Basic equal split suggestion (AI analysis unavailable)',
      suggestedParticipants: participants.map(member => ({
        id: member.id,
        name: member.name,
        confidence: 0.5,
        reason: 'Default group member'
      })),
      amounts: participants.reduce((acc, member) => {
        acc[member.id] = parseFloat(equalAmount.toFixed(2));
        return acc;
      }, {} as { [userId: string]: number }),
      matchedGroup: defaultGroup,
      categories: ['general']
    };
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
export default openaiService; 