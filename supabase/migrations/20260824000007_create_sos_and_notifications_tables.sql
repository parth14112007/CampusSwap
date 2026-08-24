-- =============================================================================
-- CampusSwap - Backend Step 7: SOS Emergency Network & Notifications DDL
-- =============================================================================

-- 1. Create sos_requests table
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

CREATE INDEX IF NOT EXISTS idx_sos_requester ON public.sos_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_sos_status ON public.sos_requests(status);
CREATE INDEX IF NOT EXISTS idx_sos_urgency ON public.sos_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_sos_expires ON public.sos_requests(expires_at);

-- 2. Create sos_matches table
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

CREATE INDEX IF NOT EXISTS idx_sos_matches_req ON public.sos_matches(sos_request_id);
CREATE INDEX IF NOT EXISTS idx_sos_matches_status ON public.sos_matches(status);

-- 3. Create sos_status_history table
CREATE TABLE IF NOT EXISTS public.sos_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_request_id UUID NOT NULL REFERENCES public.sos_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sos_hist_req ON public.sos_status_history(sos_request_id);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'urgent', 'high', 'normal'
  link_url TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifs_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifs_created ON public.notifications(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for sos_requests
CREATE POLICY "SOS requests are viewable by authenticated campus students"
  ON public.sos_requests FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create their own SOS requests"
  ON public.sos_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requester and peers can update SOS status"
  ON public.sos_requests FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Requesters can delete their own SOS requests"
  ON public.sos_requests FOR DELETE TO authenticated
  USING (auth.uid() = requester_id);

-- 7. RLS Policies for sos_matches
CREATE POLICY "SOS matches are viewable by authenticated users"
  ON public.sos_matches FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can add and update SOS matches"
  ON public.sos_matches FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. RLS Policies for sos_status_history
CREATE POLICY "SOS history is viewable by authenticated students"
  ON public.sos_status_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can record status transitions"
  ON public.sos_status_history FOR INSERT TO authenticated
  WITH CHECK (true);

-- 9. RLS Policies for notifications
CREATE POLICY "Users can only view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Notifications can be created for recipients"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notification read status"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
