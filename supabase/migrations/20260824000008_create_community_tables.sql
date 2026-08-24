-- =============================================================================
-- CampusSwap - Backend Step 8: Knowledge Hub, Partner Finder & Donations DDL
-- =============================================================================

-- 1. Create knowledge_resources table
CREATE TABLE IF NOT EXISTS public.knowledge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Engineering Faculty',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'GUIDE', -- 'PINOUT', 'GUIDE', 'TUTORIAL', 'DATASHEET', 'TROUBLESHOOTING'
  difficulty TEXT DEFAULT 'Beginner',
  read_time TEXT DEFAULT '5 min read',
  summary TEXT NOT NULL,
  pinout_image TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  wiring_notes TEXT,
  related_component_id TEXT,
  verified_by_faculty BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_category ON public.knowledge_resources(category);
CREATE INDEX IF NOT EXISTS idx_kb_type ON public.knowledge_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_kb_diff ON public.knowledge_resources(difficulty);

-- 2. Create saved_knowledge_resources table (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_knowledge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.knowledge_resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_kb_user ON public.saved_knowledge_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_kb_res ON public.saved_knowledge_resources(resource_id);

-- 3. Create project_partner_profiles table
CREATE TABLE IF NOT EXISTS public.project_partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'Intermediate',
  availability TEXT DEFAULT '10 hrs/week',
  current_projects TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_user ON public.project_partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_exp ON public.project_partner_profiles(experience_level);

-- 4. Create project_partner_requests table
CREATE TABLE IF NOT EXISTS public.project_partner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_title TEXT DEFAULT 'Engineering Project',
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Collaborator',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Cancelled', 'pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_req_sender ON public.project_partner_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_partner_req_receiver ON public.project_partner_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_partner_req_status ON public.project_partner_requests(status);

-- 5. Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Good',
  quantity INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL DEFAULT 'Academic Block B',
  location_id TEXT REFERENCES public.campus_locations(id) ON DELETE SET NULL,
  description TEXT DEFAULT '',
  handover_method TEXT DEFAULT 'Lab Drop-Off Box',
  recycle_tag TEXT DEFAULT 'Reusable',
  co2_saved_kg NUMERIC(4,1) DEFAULT 1.0,
  ewaste_prevented_grams INTEGER DEFAULT 150,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Claimed', 'Completed', 'Cancelled', 'available', 'reserved', 'claimed', 'completed', 'cancelled')),
  claimed_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_donor ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_category ON public.donations(category);

-- 6. Create donation_claims table
CREATE TABLE IF NOT EXISTS public.donation_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_donation ON public.donation_claims(donation_id);
CREATE INDEX IF NOT EXISTS idx_claims_requester ON public.donation_claims(requester_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_knowledge_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_claims ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for knowledge_resources
CREATE POLICY "Knowledge resources are viewable by authenticated users"
  ON public.knowledge_resources FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can contribute knowledge guides"
  ON public.knowledge_resources FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

-- 9. RLS Policies for saved_knowledge_resources
CREATE POLICY "Users can manage their own knowledge bookmarks"
  ON public.saved_knowledge_resources FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. RLS Policies for project_partner_profiles
CREATE POLICY "Partner profiles are viewable by authenticated users"
  ON public.project_partner_profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own partner profile"
  ON public.project_partner_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 11. RLS Policies for project_partner_requests
CREATE POLICY "Users can view partner requests involving themselves"
  ON public.project_partner_requests FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send partner requests as themselves"
  ON public.project_partner_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Participants can update partner request status"
  ON public.project_partner_requests FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 12. RLS Policies for donations
CREATE POLICY "Donations are viewable by authenticated students"
  ON public.donations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create donation listings"
  ON public.donations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donor can update their donations"
  ON public.donations FOR UPDATE TO authenticated
  USING (auth.uid() = donor_id OR claimed_by_id = auth.uid());

CREATE POLICY "Donor can delete their donations"
  ON public.donations FOR DELETE TO authenticated
  USING (auth.uid() = donor_id);

-- 13. RLS Policies for donation_claims
CREATE POLICY "Involved users can view donation claims"
  ON public.donation_claims FOR SELECT TO authenticated
  USING (
    auth.uid() = requester_id OR
    EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_claims.donation_id AND d.donor_id = auth.uid())
  );

CREATE POLICY "Users can submit donation claims"
  ON public.donation_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Involved users can update donation claims"
  ON public.donation_claims FOR UPDATE TO authenticated
  USING (
    auth.uid() = requester_id OR
    EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_claims.donation_id AND d.donor_id = auth.uid())
  );
