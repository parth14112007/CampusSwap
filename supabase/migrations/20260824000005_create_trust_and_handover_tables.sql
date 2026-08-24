-- =============================================================================
-- CampusSwap - Backend Step 5: Trust, Handover & Ratings DDL
-- =============================================================================

-- 1. Create handovers table
CREATE TABLE IF NOT EXISTS public.handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'qr_generated' CHECK (status IN ('pending', 'qr_generated', 'verification_pending', 'verified', 'completed', 'cancelled')),
  verification_code TEXT NOT NULL,
  verified_by_role TEXT DEFAULT 'Borrower',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_handovers_tx ON public.handovers(transaction_id);
CREATE INDEX IF NOT EXISTS idx_handovers_initiator ON public.handovers(initiated_by);
CREATE INDEX IF NOT EXISTS idx_handovers_status ON public.handovers(status);

-- 2. Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  communication INTEGER NOT NULL CHECK (communication >= 1 AND communication <= 5),
  item_condition INTEGER NOT NULL CHECK (item_condition >= 1 AND item_condition <= 5),
  timeliness INTEGER NOT NULL CHECK (timeliness >= 1 AND timeliness <= 5),
  overall INTEGER NOT NULL CHECK (overall >= 1 AND overall <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_rating CHECK (reviewer_id <> reviewee_id),
  CONSTRAINT unique_tx_review UNIQUE (transaction_id, reviewer_id, reviewee_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_tx ON public.ratings(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer ON public.ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewee ON public.ratings(reviewee_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for handovers
CREATE POLICY "Transaction participants can view handovers"
  ON public.handovers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = handovers.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Transaction participants can create handovers"
  ON public.handovers FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = initiated_by AND
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = handovers.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Transaction participants can update handover status"
  ON public.handovers FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = handovers.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Initiator can cancel handover"
  ON public.handovers FOR DELETE TO authenticated
  USING (auth.uid() = initiated_by);

-- 5. RLS Policies for ratings
CREATE POLICY "Ratings are viewable by authenticated users"
  ON public.ratings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Participants can submit non-self rating for completed transactions"
  ON public.ratings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    reviewer_id <> reviewee_id AND
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = ratings.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Reviewer can update their own rating"
  ON public.ratings FOR UPDATE TO authenticated
  USING (auth.uid() = reviewer_id);
