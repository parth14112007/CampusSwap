-- =============================================================================
-- CampusSwap - Backend Step 4: Requests, Rentals & Transaction Backbone DDL
-- =============================================================================

-- 1. Create or ensure listing_requests table
CREATE TABLE IF NOT EXISTS public.listing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  request_type TEXT DEFAULT 'Buy', -- 'Buy', 'Rent', 'Borrow'
  urgency TEXT DEFAULT 'MEDIUM',
  max_budget NUMERIC(10,2) DEFAULT 0,
  needed_by_date TEXT,
  campus_location TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.listing_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_owner ON public.listing_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.listing_requests(status);

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.listing_requests(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'Buy', 'Rent', 'Borrow', 'SOS', 'Donation'
  item_title TEXT NOT NULL,
  item_image TEXT,
  amount NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  deposit_amount NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'handover_pending', 'active', 'returned', 'completed', 'cancelled'
  handover_status TEXT DEFAULT 'Pending Handover',
  is_rated BOOLEAN DEFAULT FALSE,
  rating_score NUMERIC(2,1),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_buyer ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_tx_seller ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_tx_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_tx_type ON public.transactions(transaction_type);

-- 3. Create rentals table
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  item_image TEXT,
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
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rentals_tx ON public.rentals(transaction_id);
CREATE INDEX IF NOT EXISTS idx_rentals_renter ON public.rentals(renter_id);
CREATE INDEX IF NOT EXISTS idx_rentals_lender ON public.rentals(lender_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.listing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for listing_requests
CREATE POLICY "Users can view relevant requests or open board"
  ON public.listing_requests FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can create requests for themselves"
  ON public.listing_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requester and owner can update request status"
  ON public.listing_requests FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Requester can delete their own requests"
  ON public.listing_requests FOR DELETE TO authenticated
  USING (auth.uid() = requester_id);

-- 6. RLS Policies for transactions
CREATE POLICY "Users can view transactions they are part of"
  ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions as participant"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Participants can update their transaction status"
  ON public.transactions FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 7. RLS Policies for rentals
CREATE POLICY "Renters and lenders can view their rentals"
  ON public.rentals FOR SELECT TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = lender_id);

CREATE POLICY "Renters can create rentals"
  ON public.rentals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Participants can update rental progress and status"
  ON public.rentals FOR UPDATE TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = lender_id);
