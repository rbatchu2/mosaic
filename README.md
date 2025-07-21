# Mosaic - AI-Powered Financial App

A React Native financial management app with intelligent bill splitting powered by GPT and real-time data storage with Supabase.

## Features

- **Smart Bill Splitting**: AI-powered suggestions for splitting expenses with friends
- **Intelligent Chat**: GPT-powered financial assistant
- **Transaction Analysis**: AI categorization and insights
- **Expense Groups**: Manage recurring expense groups with smart matching
- **Real-time Database**: Supabase PostgreSQL backend for data persistence
- **Cross-platform**: Works on iOS, Android, and Web

## Setup Instructions

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Supabase Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema** by copying the SQL from `database/schema.sql` and pasting it into your Supabase SQL Editor
3. **Get your project credentials** from Project Settings > API

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# For Expo builds (mobile-compatible variables)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
EXPO_PUBLIC_OPENAI_MODEL=gpt-4o-mini
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Schema

The app uses the following main tables:
- **users**: User profiles and authentication data
- **accounts**: Bank accounts and financial accounts
- **transactions**: Financial transactions with AI categorization
- **expense_groups**: Groups for splitting expenses
- **group_members**: Members of expense groups
- **split_suggestions**: AI-generated bill splitting suggestions
- **chat_messages**: Chat history with AI assistant

### 5. Start the Development Server

```bash
npm run dev
```

## Key Features Breakdown

### 🤖 AI-Powered Features

#### Smart Split Suggestions (`/api/plaid/split-suggestions`)
- Analyzes transaction context (merchant, amount, description, location)
- Matches transactions to appropriate expense groups using AI
- Provides confidence scores and reasoning for suggestions
- Suggests optimal split types (equal, custom, percentage)
- Stores suggestions in Supabase for tracking

#### Intelligent Chat (`/api/chat`)
- GPT-powered financial advice and responses
- Contextual analysis based on user's transaction history
- Actionable suggestions and insights
- Chat history stored in database

#### Transaction Enhancement
- AI-powered transaction categorization
- Merchant type identification
- Recurring transaction detection
- Smart tagging and insights

### 💾 Database Features

#### Real-time Data Storage
- PostgreSQL database with Supabase
- Real-time subscriptions for live updates
- Row Level Security (RLS) for data protection
- Automatic timestamps and data validation

#### Analytics & Insights
- Spending analysis by category and time period
- Transaction trends and patterns
- Budget tracking and recommendations
- Custom analytics views

### 📱 Cross-Platform Support

#### Mobile (iOS/Android)
- React Native with Expo
- Native performance and UX
- Platform-specific optimizations
- Push notifications support

#### Web
- Progressive Web App (PWA)
- Desktop-responsive design
- Keyboard shortcuts and accessibility
- Real-time sync with mobile

## API Endpoints

### User Data
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Financial Data
- `GET /api/plaid/accounts` - Get user accounts
- `GET /api/plaid/transactions` - Get transactions with filtering
- `GET /api/plaid/analysis` - Get spending analysis

### AI Features
- `GET /api/plaid/split-suggestions` - Get AI split suggestions
- `POST /api/chat` - Chat with AI financial assistant

### Expense Management
- `POST /api/bills/split` - Create bill splits
- `GET /api/groups` - Get expense groups
- `POST /api/groups` - Create expense groups

## Database Performance

The app includes optimized database queries with:
- **Indexes** on frequently queried columns
- **Views** for complex analytics
- **Triggers** for automatic timestamp updates
- **Connection pooling** for better performance

## Development Notes

### Mock Data
The database comes pre-seeded with realistic demo data:
- Sample user (Alex Johnson)
- Multiple bank accounts (checking, savings, credit)
- 10+ sample transactions across different categories
- 3 expense groups with members
- Chat history and split suggestions

### AI Integration
- Uses fetch-based OpenAI client (React Native compatible)
- Robust error handling with fallback responses
- JSON validation and parsing improvements
- Environment variable management for cross-platform

### Security
- Row Level Security policies implemented
- Environment variables properly scoped
- API key validation and error handling
- Data sanitization and validation

## Production Deployment

### Environment Setup
1. Set up production Supabase project
2. Configure proper RLS policies for your use case
3. Set up API rate limiting
4. Configure monitoring and logging

### Performance Optimization
- Enable Supabase connection pooling
- Set up CDN for static assets
- Implement caching strategies
- Monitor database query performance

### Security Considerations
- Rotate API keys regularly
- Implement proper user authentication
- Set up database backups
- Monitor for unusual activity

For more details on the AI integration, see `services/openaiService.ts`.
For database operations, see `services/supabaseService.ts`.
For database schema, see `database/schema.sql`. 