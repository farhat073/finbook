# FinBook - Smart Business Manager

A Progressive Web App (PWA) for managing business finances, transactions, parties, and expenses. Can be installed on iOS via "Add to Home Screen" or used as a web application.

## Quick Start

### 1. Set Up Supabase Backend

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in the Supabase dashboard
3. Copy and paste the contents of [`SUPABASE_SETUP.sql`](SUPABASE_SETUP.sql) into the SQL Editor
4. Run the SQL script
5. Go to **Project Settings > API**
6. Copy the **Project URL** and **anon public** key

### 2. Configure Environment Variables

```bash
# In finbook-web directory
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies & Run Locally

```bash
cd finbook-web
npm install
npm run dev
```

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com) and import the repository
3. In the Vercel project settings, add the environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Deploy!

## Features

- 📊 **Dashboard** - Business overview with key metrics
- 👥 **Parties** - Manage customers and vendors
- 📦 **Items** - Products and services inventory
- 💰 **Transactions** - Sales and purchases
- 📝 **Expenses** - Track business expenses
- 📈 **Reports** - Financial reports and analytics
- 🖨️ **Printable Bills** - Generate printable invoices

## PWA Installation

### iOS (Safari)
1. Open the website in Safari
2. Tap the **Share** button
3. Tap **Add to Home Screen**
4. The app will appear as an installed app

### Android (Chrome)
1. Open the website in Chrome
2. Tap the menu (three dots)
3. Tap **Add to Home Screen**
4. The app will be installable

## Project Structure

```
finbook-web/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── App.jsx          # Main app component
│   ├── AppContext.jsx   # Global state management
│   ├── supabase.js      # Supabase client
│   └── main.jsx         # App entry point
├── public/
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── SUPABASE_SETUP.sql   # Database schema
└── .env.example        # Environment template
```

## Tech Stack

- **Frontend**: React 19 + Vite
- **PWA**: Service Worker + Web App Manifest
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React

## Supabase Tables

| Table | Description |
|-------|-------------|
| `store_profiles` | User store information |
| `parties` | Customers and vendors |
| `items` | Products and services |
| `transactions` | Sales and purchases |
| `expenses` | Business expenses |

## License

MIT
