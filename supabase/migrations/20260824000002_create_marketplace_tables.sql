-- =============================================================================
-- CampusSwap - Backend Step 2: Marketplace, Favorites, Requests & Rentals DDL
-- =============================================================================

-- 1. Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  listing_type TEXT NOT NULL, -- 'Buy', 'Rent', 'Borrow'
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_unit TEXT DEFAULT '',
  deposit NUMERIC(10,2) DEFAULT 0,
  condition TEXT NOT NULL,
  location TEXT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  image_url TEXT NOT NULL,
  specs JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performant filtering
CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_available ON public.listings(available);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- 2. Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON public.favorites(listing_id);

-- 3. Create listing_requests table
CREATE TABLE IF NOT EXISTS public.listing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'MEDIUM',
  max_budget NUMERIC(10,2) DEFAULT 0,
  needed_by_date TEXT,
  campus_location TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'matched', 'accepted', 'rejected', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.listing_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.listing_requests(status);

-- 4. Create rentals table
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  item_image TEXT NOT NULL,
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_held NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  days_remaining INTEGER DEFAULT 4,
  progress_percent INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active', -- 'requested', 'approved', 'active', 'returned', 'completed', 'cancelled'
  escrow_status TEXT DEFAULT 'held',
  qr_code TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rentals_renter ON public.rentals(renter_id);
CREATE INDEX IF NOT EXISTS idx_rentals_lender ON public.rentals(lender_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals(status);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies for Listings
CREATE POLICY "Listings are viewable by authenticated users"
  ON public.listings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create listings for themselves"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- 7. Row Level Security Policies for Favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 8. Row Level Security Policies for Requests
CREATE POLICY "Requests are viewable by involved users or public board"
  ON public.listing_requests FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create their own requests"
  ON public.listing_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests or respond as owner"
  ON public.listing_requests FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can delete their own requests"
  ON public.listing_requests FOR DELETE TO authenticated
  USING (auth.uid() = requester_id);

-- 9. Row Level Security Policies for Rentals
CREATE POLICY "Rentals are viewable by renter or lender"
  ON public.rentals FOR SELECT TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = lender_id);

CREATE POLICY "Renters can initiate rentals"
  ON public.rentals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renter and lender can update rental timeline status"
  ON public.rentals FOR UPDATE TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = lender_id);
