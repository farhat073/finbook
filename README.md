<h1 align="center">FinBook - A Business and Inventory Manager App</h1>

<p align="center">
  <a href="https://android-arsenal.com/api?level=21"><img alt="API" src="https://img.shields.io/badge/API-21%2B-brightgreen.svg?style=flat"/></a>
</p>

<p align="center">  
This is a complete business management Android application with modern Android tech-stacks and MVVM architecture. Features include Jetpack Compose UI, Room database for local storage, multi-language support (English and Hindi), and comprehensive business tools.
</p>

## Features

- 📊 **Dashboard** - Business overview with key metrics
- 👥 **Parties** - Manage customers and vendors
- 📦 **Items** - Products and services inventory
- 💰 **Transactions** - Sales and purchases
- 📝 **Expenses** - Track business expenses
- 📈 **Reports** - Financial reports and analytics
- 🖨️ **Printable Bills** - Generate printable invoices
- 🏪 **Online Store** - Create and manage online store
- 💳 **Cash & Bank** - Financial account management

## Tech Stack

- **Language:** Kotlin
- **Min SDK:** 21 | **Target SDK:** 30
- **UI:** Jetpack Compose + Material Design
- **Architecture:** MVVM + Clean Architecture
- **DI:** Hilt
- **Database:** Room (SQLite)
- **Navigation:** Jetpack Navigation
- **Web:** React + Vite (PWA)
- **Backend:** Supabase (PostgreSQL)

## Project Structure

```
finbook/           # Android App (Kotlin)
finbook-web/       # Web App (React + Vite PWA)
```

## Getting Started

### Android App
1. Open `finbook/` in Android Studio
2. Build and run on emulator or device

### Web App
1. Go to `finbook-web/`
2. Copy `.env.example` to `.env` and add your Supabase credentials
3. Run `npm install` then `npm run dev`

### Deploy to Vercel
1. Push code to GitHub
2. Import to Vercel
3. Add Supabase environment variables
4. Deploy!

## License

MIT
