# Finbook - Smart Business Manager

Finbook is a comprehensive business management web application tailored for store owners and small businesses. It allows you to:
- Manage Customers (Parties) 
- Record Items & Inventory
- Track Sales & Purchase Transactions
- Monitor Expenses
- Generate Business Reports

## Technologies Used
- React + Vite
- Supabase (Authentication & Database)
- Capacitor (Android APK Generation)
- Lucide React (Icons)

## Setup Instructions

### Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally
```bash
npm install
npm run dev
```

### Building Android APK
This project uses Capacitor to wrap the web application into an Android app.
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```
