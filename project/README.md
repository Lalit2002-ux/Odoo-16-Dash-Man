# OIG Financial Dashboard

A modern, interactive financial dashboard that connects to Odoo 16 and displays comprehensive profit & loss reports with beautiful visualizations.

## Features

- **Secure Authentication**: Login with your Odoo credentials
- **Dynamic Filters**: Filter data by year and month
- **Real-time Data**: Fetch financial data directly from Odoo 16
- **Interactive Charts**: Beautiful bar charts showing financial overview and revenue breakdowns
- **Key Metrics**: Display of crucial financial metrics including:
  - Total Revenue
  - Cost of Goods Sold (COGS)
  - Total Expenses
  - Gross Profit
  - Percentage metrics of revenue
  - Net profit margins

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Supabase Edge Functions
- **Data Source**: Odoo 16

## Setup

1. **Environment Variables**

   The `.env` file contains your Supabase configuration:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

1. **Login**: Enter your Odoo email and password on the login page
2. **Dashboard**: Once authenticated, you'll see the main dashboard with:
   - Filter controls at the top (Year and Month)
   - Four key metric cards showing Revenue, COGS, Expenses, and Gross Profit
   - Financial Overview chart showing all major financial categories
   - Revenue Breakdown chart showing percentages
   - Three additional metric cards showing percentage calculations

3. **Filters**:
   - Select a year from the dropdown (last 6 years available)
   - Select a month or "All Year" to see yearly totals
   - Data automatically refreshes when filters change

4. **Logout**: Click the logout button in the top-right corner

## API Endpoints

The backend Edge Function provides two main endpoints:

- `/authenticate` - Authenticates users with Odoo credentials
- `/financial-data` - Fetches financial data (P&L or Balance Sheet)

## Data Calculations

The dashboard calculates:
- **Total Income**: Sum of all income and other income accounts
- **COGS**: Cost of goods sold from direct expense accounts
- **Expenses**: Operating expenses
- **Gross Profit**: Income - COGS
- **Operating Income**: Gross Profit - Expenses
- **Net Income**: Operating Income - Depreciation

All percentages are calculated relative to total revenue.

## Security

- Passwords are never stored in the frontend
- All API calls are made through secure Supabase Edge Functions
- CORS is properly configured for security
- Authentication is required for all financial data requests

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard with charts
│   ├── Login.tsx          # Login page
│   ├── MetricCard.tsx     # Reusable metric card component
│   └── Filters.tsx        # Year/month filter component
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── services/
│   └── odooApi.ts         # API service for Odoo integration
├── App.tsx                # Main app component
└── main.tsx              # App entry point
```

## Notes

- The application connects to Odoo at: `https://testoig1.odoo.com`
- Database: `oig1-25stagnov14-25595867`
- Only posted journal entries are included in calculations
- Date ranges are inclusive for the selected period
