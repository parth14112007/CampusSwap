-- =============================================================================
-- CampusSwap - Backend Step 6: AI & Project Ecosystem DDL
-- =============================================================================

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  project_type TEXT DEFAULT 'Robotics',
  experience_level TEXT DEFAULT 'Intermediate',
  budget NUMERIC(10,2) DEFAULT 0,
  deadline TEXT DEFAULT '2 Weeks',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  readiness_percentage INTEGER DEFAULT 0,
  total_components INTEGER DEFAULT 0,
  available_components INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(project_type);

-- 2. Create project_requirements table
CREATE TABLE IF NOT EXISTS public.project_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  category TEXT DEFAULT 'Components',
  quantity INTEGER NOT NULL DEFAULT 1,
  role TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'missing', 'unknown')),
  matched_resource_id TEXT REFERENCES public.campus_resources(id) ON DELETE SET NULL,
  matched_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  location_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reqs_project ON public.project_requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_reqs_status ON public.project_requirements(availability_status);

-- 3. Create project_kits table
CREATE TABLE IF NOT EXISTS public.project_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'Beginner',
  estimated_duration TEXT DEFAULT '1-2 Weeks',
  status TEXT DEFAULT 'saved' CHECK (status IN ('draft', 'saved', 'active', 'completed')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kits_project ON public.project_kits(project_id);
CREATE INDEX IF NOT EXISTS idx_kits_user ON public.project_kits(user_id);
CREATE INDEX IF NOT EXISTS idx_kits_status ON public.project_kits(status);

-- 4. Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Hardware Contributor',
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'removed')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.project_members(user_id);

-- 5. Create project_invitations table
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Hardware Collaborator',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_project ON public.project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invites_invitee ON public.project_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invites_inviter ON public.project_invitations(inviter_id);

-- 6. Create smart_match_history table
CREATE TABLE IF NOT EXISTS public.smart_match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  requirement TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  transaction_type TEXT DEFAULT 'All',
  max_budget NUMERIC(10,2) DEFAULT 1000,
  urgency TEXT DEFAULT 'Normal',
  top_match_title TEXT,
  top_match_score INTEGER,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_match_user ON public.smart_match_history(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_match_saved ON public.smart_match_history(is_saved);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_match_history ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for projects
CREATE POLICY "Users can view projects they own or belong to"
  ON public.projects FOR SELECT TO authenticated
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id AND pm.user_id = auth.uid() AND pm.status = 'active'
    )
  );

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their projects"
  ON public.projects FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- 9. RLS Policies for project_requirements
CREATE POLICY "Authorized project users can view requirements"
  ON public.project_requirements FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_requirements.project_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid() AND pm.status = 'active'
        )
      )
    )
  );

CREATE POLICY "Project owners can manage requirements"
  ON public.project_requirements FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_requirements.project_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_requirements.project_id AND p.owner_id = auth.uid()
    )
  );

-- 10. RLS Policies for project_kits
CREATE POLICY "Users can view and manage their project kits"
  ON public.project_kits FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 11. RLS Policies for project_members
CREATE POLICY "Members and owners can view project members"
  ON public.project_members FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage project members"
  ON public.project_members FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id AND p.owner_id = auth.uid()
    )
  );

-- 12. RLS Policies for project_invitations
CREATE POLICY "Inviters and invitees can view invitations"
  ON public.project_invitations FOR SELECT TO authenticated
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Project owners can create invitations"
  ON public.project_invitations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitees and inviters can update invitation status"
  ON public.project_invitations FOR UPDATE TO authenticated
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- 13. RLS Policies for smart_match_history
CREATE POLICY "Users can view and manage their smart match history"
  ON public.smart_match_history FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
