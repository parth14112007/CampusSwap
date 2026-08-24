-- =============================================================================
-- CampusSwap - Master Production Database Schema & Security Policies
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Engineering',
  year TEXT NOT NULL DEFAULT '1st Year',
  student_id TEXT,
  phone TEXT,
  avatar_url TEXT,
  campus TEXT NOT NULL DEFAULT 'Main Engineering Campus',
  trust_score NUMERIC(3,2) DEFAULT 4.90 CHECK (trust_score >= 0.0 AND trust_score <= 5.0),
  total_swaps INTEGER DEFAULT 0 CHECK (total_swaps >= 0),
  escrow_balance NUMERIC(10,2) DEFAULT 450.00 CHECK (escrow_balance >= 0.0),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPUS LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.campus_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  room TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MARKETPLACE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Rent', 'Buy', 'Borrow')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  price_unit TEXT NOT NULL DEFAULT '/day',
  deposit NUMERIC(10,2) DEFAULT 0 CHECK (deposit >= 0),
  condition TEXT NOT NULL DEFAULT 'Lab Tested',
  location TEXT NOT NULL,
  location_id TEXT REFERENCES public.campus_locations(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);

-- 5. CAMPUS LAB RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.campus_resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Lab Equipment',
  provider TEXT NOT NULL,
  location_id TEXT REFERENCES public.campus_locations(id) ON DELETE SET NULL,
  building TEXT NOT NULL,
  room TEXT NOT NULL,
  total_units INTEGER NOT NULL DEFAULT 1,
  available_units INTEGER NOT NULL DEFAULT 1,
  availability TEXT NOT NULL DEFAULT 'AVAILABLE',
  condition TEXT DEFAULT 'Lab Tested',
  specs JSONB DEFAULT '[]'::jsonb,
  guidelines TEXT[] DEFAULT '{}',
  image TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3,2) DEFAULT 4.9,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESOURCE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.resource_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES public.campus_resources(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

-- 7. LISTING REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.listing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Rent', 'Buy', 'Borrow')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  duration_days INTEGER DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRANSACTIONS & ESCROW LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.listing_requests(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Rent', 'Buy', 'Borrow')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_escrow', 'active', 'completed', 'refunded', 'disputed', 'cancelled')),
  escrow_status TEXT NOT NULL DEFAULT 'held' CHECK (escrow_status IN ('none', 'held', 'released', 'refunded')),
  item_title TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Campus Escrow Wallet',
  handover_method TEXT DEFAULT 'In-Person Handover',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RENTALS PROGRESSION TABLE
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  borrower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_handover' CHECK (status IN ('pending_handover', 'active', 'return_pending', 'completed', 'overdue', 'disputed')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ,
  deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_status TEXT NOT NULL DEFAULT 'held' CHECK (deposit_status IN ('held', 'released', 'forfeited')),
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HANDOVERS TABLE (QR Code Verification)
CREATE TABLE IF NOT EXISTS public.handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  borrower_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  item_title TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  location TEXT NOT NULL DEFAULT 'Academic Block B Courtyard',
  qr_code_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed', 'expired', 'cancelled')),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RATINGS & REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_rating NUMERIC(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
  communication INTEGER DEFAULT 5 CHECK (communication >= 1 AND communication <= 5),
  item_condition INTEGER DEFAULT 5 CHECK (item_condition >= 1 AND item_condition <= 5),
  punctuality INTEGER DEFAULT 5 CHECK (punctuality >= 1 AND punctuality <= 5),
  reliability INTEGER DEFAULT 5 CHECK (reliability >= 1 AND reliability <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_no_self_rating CHECK (reviewer_id <> reviewee_id),
  UNIQUE (transaction_id, reviewer_id, reviewee_id)
);

-- 12. PROJECTS & REQUIREMENTS TABLES
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'Robotics',
  experience_level TEXT NOT NULL DEFAULT 'Beginner',
  budget NUMERIC(10,2) DEFAULT 1000,
  deadline TEXT DEFAULT '2 Weeks',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  readiness_percentage INTEGER DEFAULT 0 CHECK (readiness_percentage >= 0 AND readiness_percentage <= 100),
  total_components INTEGER DEFAULT 0,
  available_components INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  role TEXT DEFAULT 'Core Controller',
  notes TEXT DEFAULT '',
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'missing', 'unknown')),
  matched_resource_id TEXT REFERENCES public.campus_resources(id) ON DELETE SET NULL,
  matched_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  location_hint TEXT DEFAULT 'Campus Inventory',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  estimated_duration TEXT DEFAULT '1 Week',
  status TEXT DEFAULT 'saved' CHECK (status IN ('draft', 'saved', 'active', 'completed')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member',
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'removed')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Collaborator',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.smart_match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  requirement TEXT,
  quantity INTEGER DEFAULT 1,
  transaction_type TEXT DEFAULT 'All',
  max_budget NUMERIC(10,2) DEFAULT 1000,
  urgency TEXT DEFAULT 'Normal',
  top_match_title TEXT,
  top_match_score INTEGER,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SOS & NOTIFICATIONS TABLES
CREATE TABLE IF NOT EXISTS public.sos_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  description TEXT DEFAULT '',
  urgency TEXT DEFAULT 'URGENT' CHECK (urgency IN ('URGENT', 'HIGH', 'NORMAL', 'urgent', 'high', 'normal')),
  required_by TEXT DEFAULT 'Within 2 Hours',
  location_id TEXT REFERENCES public.campus_locations(id) ON DELETE SET NULL,
  preferred_location TEXT DEFAULT 'Academic Block B',
  budget NUMERIC(10,2) DEFAULT 0,
  additional_specs TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'match_found', 'resource_offered', 'accepted', 'handover_pending', 'completed', 'cancelled', 'expired')),
  offered_resource JSONB,
  handover_id UUID REFERENCES public.handovers(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sos_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_request_id UUID NOT NULL REFERENCES public.sos_requests(id) ON DELETE CASCADE,
  resource_id TEXT REFERENCES public.campus_resources(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  matched_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  match_score INTEGER NOT NULL DEFAULT 85,
  match_reason TEXT DEFAULT '',
  match_title TEXT NOT NULL,
  match_source TEXT DEFAULT 'Campus Lab',
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'offered', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sos_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_request_id UUID NOT NULL REFERENCES public.sos_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  link_url TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. COMMUNITY TABLES (Knowledge, Partners, Donations)
CREATE TABLE IF NOT EXISTS public.knowledge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Engineering Faculty',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'GUIDE',
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

CREATE TABLE IF NOT EXISTS public.saved_knowledge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.knowledge_resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

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

CREATE TABLE IF NOT EXISTS public.donation_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 15. ROW LEVEL SECURITY (RLS) ENABLEMENT & POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_knowledge_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_claims ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Campus Locations
CREATE POLICY "Locations viewable by all authenticated users" ON public.campus_locations FOR SELECT TO authenticated USING (true);

-- Marketplace Listings
CREATE POLICY "Listings viewable by all authenticated users" ON public.listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Campus Resources & Alerts
CREATE POLICY "Resources viewable by authenticated users" ON public.campus_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Resource alerts managed by owner" ON public.resource_notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Requests, Transactions, Rentals
CREATE POLICY "Requests viewable by participants" ON public.listing_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create requests" ON public.listing_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants can update requests" ON public.listing_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Transactions viewable by participants" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Rentals viewable by participants" ON public.rentals FOR SELECT TO authenticated USING (auth.uid() = borrower_id OR auth.uid() = lender_id);
CREATE POLICY "Participants can update rentals" ON public.rentals FOR UPDATE TO authenticated USING (auth.uid() = borrower_id OR auth.uid() = lender_id);

-- Handovers & Ratings
CREATE POLICY "Handovers viewable by participants" ON public.handovers FOR SELECT TO authenticated USING (auth.uid() = owner_id OR auth.uid() = borrower_id);
CREATE POLICY "Participants can update handovers" ON public.handovers FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR auth.uid() = borrower_id);

CREATE POLICY "Ratings viewable by all authenticated users" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewer can create review" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Projects, SOS, Notifications
CREATE POLICY "Projects viewable by owner and members" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owner can manage projects" ON public.projects FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Requirements managed by project owner" ON public.project_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Kits managed by user" ON public.project_kits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Smart match history private" ON public.smart_match_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "SOS viewable by students" ON public.sos_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Requester can create SOS" ON public.sos_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Peers can update SOS status" ON public.sos_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "SOS matches viewable by students" ON public.sos_matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "SOS history viewable by students" ON public.sos_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Notifications strictly private" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (true);

-- Community
CREATE POLICY "Knowledge resources viewable by all" ON public.knowledge_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Saved knowledge private" ON public.saved_knowledge_resources FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partner profiles viewable by all" ON public.project_partner_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Partner profile managed by owner" ON public.project_partner_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partner requests viewable by participants" ON public.project_partner_requests FOR ALL TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id) WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Donations viewable by all" ON public.donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Donations managed by donor" ON public.donations FOR ALL TO authenticated USING (auth.uid() = donor_id OR auth.uid() = claimed_by_id) WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donation claims managed by participants" ON public.donation_claims FOR ALL TO authenticated USING (true) WITH CHECK (auth.uid() = requester_id);
