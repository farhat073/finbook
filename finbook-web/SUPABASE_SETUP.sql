-- FinBook Supabase Database Setup (CORRECTED)
-- Run this SQL in your Supabase SQL Editor
-- WARNING: This will DROP and recreate all tables. Any existing data will be lost.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DROP existing tables (order matters due to foreign keys)
-- ============================================================
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.parties CASCADE;
DROP TABLE IF EXISTS public.store_profiles CASCADE;

-- ============================================================
-- Table: store_profiles
-- ============================================================
CREATE TABLE public.store_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'My Store',
  tagline TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- Table: parties
-- ============================================================
CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: items
-- ============================================================
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  "salePrice" NUMERIC DEFAULT 0,
  "purchasePrice" NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: transactions
-- ============================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'payment-in', 'payment-out')),
  "partyName" TEXT NOT NULL,
  "partyPhone" TEXT DEFAULT '',
  "billNo" TEXT,
  "billedItems" TEXT DEFAULT '',
  "billedQty" TEXT DEFAULT '',
  total NUMERIC DEFAULT 0,
  received NUMERIC DEFAULT 0,
  "paidAmt" NUMERIC DEFAULT 0,
  timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: expenses
-- ============================================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  "itemName" TEXT DEFAULT '',
  description TEXT DEFAULT '',
  qty NUMERIC DEFAULT 1,
  price NUMERIC DEFAULT 0,
  "totalAmount" NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.store_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: store_profiles
-- ============================================================
CREATE POLICY "Users can view own store_profiles" ON public.store_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own store_profiles" ON public.store_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own store_profiles" ON public.store_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: parties
-- ============================================================
CREATE POLICY "Users can view own parties" ON public.parties
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own parties" ON public.parties
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own parties" ON public.parties
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own parties" ON public.parties
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: items
-- ============================================================
CREATE POLICY "Users can view own items" ON public.items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: transactions
-- ============================================================
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies: expenses
-- ============================================================
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_parties_user_id ON public.parties(user_id);
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);

-- ============================================================
-- Auto-create store_profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.store_profiles (user_id, name, created_at, updated_at)
  VALUES (NEW.id, 'My Store', NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Enable Realtime
-- ============================================================
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.parties; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.items; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.store_profiles; EXCEPTION WHEN others THEN NULL; END;
END $$;

SELECT 'FinBook database setup completed successfully!' as message;
