# Financial Wellness App

A comprehensive Next.js application for managing your personal finances, tracking expenses, managing debts, and getting personalized financial wellness insights.

## Features

### 🏠 Dashboard
- Overview of your financial health
- Monthly income, expenses, and debt tracking
- Savings rate visualization
- Real-time financial insights and warnings

### 💰 Expense Management
- Add and track expenses with categories
- View expenses by category
- Filter and sort expenses
- Monthly expense summaries

### 💳 Debt Management
- Track multiple debts (credit cards, loans, mortgages)
- Monitor interest rates and minimum payments
- Record payments and track progress
- Visual progress indicators

### 👤 Profile Management
- Personal information management
- Monthly income tracking
- Savings goals setting

### 💡 Financial Insights
- Personalized financial tips and advice
- Budgeting recommendations
- Debt management strategies
- Savings guidance

### 🔐 Authentication
- Email/password registration and login
- Google OAuth login (optional, requires setup)
- Secure session management
- User-specific data isolation

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Lucide React** - Beautiful icons
- **date-fns** - Date formatting utilities
- **@react-oauth/google** - Google OAuth integration
- **localStorage** - Client-side data persistence

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Set up Google OAuth:
   - Create a `.env.local` file in the root directory
   - Get your Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add the following to `.env.local`:
     ```
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
     ```
   - **Steps to get Google Client ID:**
     1. Go to [Google Cloud Console](https://console.cloud.google.com/)
     2. Create a new project or select an existing one
     3. Enable Google+ API
     4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
     5. Choose "Web application"
     6. Add authorized JavaScript origins: `http://localhost:3000` (for development)
     7. Add authorized redirect URIs: `http://localhost:3000` (for development)
     8. Copy the Client ID and add it to `.env.local`
   - **Note:** Google login will only appear if the Client ID is configured. The app works fine without it using email/password authentication.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
onewayout/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard
│   ├── expenses/          # Expenses page
│   ├── debts/            # Debts page
│   ├── profile/          # Profile page
│   └── insights/         # Financial insights page
├── components/            # React components
│   ├── Dashboard.tsx
│   ├── ExpenseList.tsx
│   ├── DebtList.tsx
│   ├── ProfileForm.tsx
│   ├── FinancialInsights.tsx
│   └── Navigation.tsx
├── lib/                  # Utility functions
│   └── storage.ts        # localStorage management
└── types/                # TypeScript type definitions
    └── index.ts
```

## Data Storage

The app uses browser localStorage to persist data. All your financial information is stored locally in your browser and never sent to any server.

## Features in Detail

### Expense Categories
- Food & Dining
- Transportation
- Shopping
- Bills & Utilities
- Entertainment
- Healthcare
- Education
- Other

### Debt Types
- Credit Card
- Loan
- Mortgage
- Other

## Future Enhancements

Potential features for future versions:
- Export data to CSV/PDF
- Charts and visualizations
- Budget planning tools
- Recurring expense tracking
- Financial goal tracking
- Multi-currency support
- Cloud sync (optional)

## License

This project is open source and available for personal use.
