-- =============================================================================
-- CampusSwap - Backend Step 3: Campus Locations, Resources & Notify Me DDL
-- =============================================================================

-- 1. Create campus_locations table
CREATE TABLE IF NOT EXISTS public.campus_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  building_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  wing TEXT NOT NULL,
  zone_type TEXT NOT NULL, -- 'Academic', 'Lab / Workshop', 'Innovation', 'Robotics', 'Student Center'
  distance_text TEXT DEFAULT '2 mins walk',
  distance_meters INTEGER DEFAULT 100,
  map_coords JSONB NOT NULL, -- {"x": 24, "y": 38}
  tags TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'science',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_zone ON public.campus_locations(zone_type);
CREATE INDEX IF NOT EXISTS idx_locations_building ON public.campus_locations(building_name);

-- 2. Create campus_resources table
CREATE TABLE IF NOT EXISTS public.campus_resources (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location_id TEXT NOT NULL REFERENCES public.campus_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'equipment', -- 'equipment', 'component', 'tool', 'project_kit', 'lab_resource'
  condition TEXT NOT NULL DEFAULT 'Calibrated / Verified',
  availability TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN'
  total_stock INTEGER NOT NULL DEFAULT 1,
  available_stock INTEGER NOT NULL DEFAULT 1,
  provider TEXT NOT NULL,
  description TEXT NOT NULL,
  specifications JSONB DEFAULT '[]'::jsonb,
  image_url TEXT NOT NULL,
  distance_text TEXT DEFAULT '2 mins walk',
  distance_meters INTEGER DEFAULT 100,
  linked_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  rating NUMERIC(2,1) DEFAULT 4.9,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_location ON public.campus_resources(location_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.campus_resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_availability ON public.campus_resources(availability);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.campus_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_owner ON public.campus_resources(owner_id);

-- 3. Create resource_notifications table (Notify Me / Watch Subscriptions)
CREATE TABLE IF NOT EXISTS public.resource_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES public.campus_resources(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'triggered', 'cancelled'
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_res_notif_user ON public.resource_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_res_notif_resource ON public.resource_notifications(resource_id);
CREATE INDEX IF NOT EXISTS idx_res_notif_status ON public.resource_notifications(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies for Campus Locations
CREATE POLICY "Campus locations are viewable by authenticated students"
  ON public.campus_locations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create campus locations"
  ON public.campus_locations FOR INSERT TO authenticated
  WITH CHECK (true);

-- 6. Row Level Security Policies for Campus Resources
CREATE POLICY "Campus resources are viewable by authenticated students"
  ON public.campus_resources FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can add campus resources"
  ON public.campus_resources FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Owners can update their own resources"
  ON public.campus_resources FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Owners can delete their own resources"
  ON public.campus_resources FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- 7. Row Level Security Policies for Resource Notifications
CREATE POLICY "Users can manage their own notification watches"
  ON public.resource_notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Seed Demo Campus Locations Data
INSERT INTO public.campus_locations (id, name, description, building_name, room_number, wing, zone_type, distance_text, distance_meters, map_coords, tags, icon)
VALUES
  ('loc-main-ee', 'Electronics Lab 2', 'Digital Signal Processing & Microcontroller Testing Bench', 'Academic Block B', 'B-204', 'North Wing', 'Lab / Workshop', '2 mins walk', 120, '{"x": 28, "y": 32}'::jsonb, ARRAY['DSO', 'Microcontrollers', 'Soldering', 'Sensors'], 'memory'),
  ('loc-fab-lab', 'Innovation Lab (FabLab)', '3D Printing, Laser Cutting & Rapid Hardware Prototyping', 'Innovation Complex', 'FAB-01', 'Central Hub', 'Innovation', '4 mins walk', 250, '{"x": 58, "y": 24}'::jsonb, ARRAY['3D Printer', 'CNC', 'Laser Cutter', 'Filament'], 'precision_manufacturing'),
  ('loc-robotics', 'Robotics Society Lab', 'Autonomous Mobile Robots, Drones & Computer Vision Rig', 'Mechanical Workshop Block', 'M-102', 'East Wing', 'Robotics', '5 mins walk', 320, '{"x": 78, "y": 55}'::jsonb, ARRAY['Lidar', 'Jetson', 'Motors', 'Servos'], 'smart_toy'),
  ('loc-mecha-bay', 'Mechatronics Bay 2', 'Actuator Calibration & PLC Motor Control Stations', 'Mechanical Workshop Block', 'M-104', 'East Wing', 'Lab / Workshop', '5 mins walk', 340, '{"x": 72, "y": 68}'::jsonb, ARRAY['Pneumatics', 'PLCs', 'Sensors', 'Relays'], 'settings_suggest'),
  ('loc-iot-maker', 'IoT Student Maker Space', 'Wireless Mesh Sensor Networks & Smart Agriculture Testbed', 'Computing Center', 'CC-302', 'West Wing', 'Innovation', '3 mins walk', 180, '{"x": 22, "y": 65}'::jsonb, ARRAY['LoRaWAN', 'ESP32', 'Zigbee', 'Relays'], 'router'),
  ('loc-vlsi-lab', 'VLSI & Embedded Systems Bay', 'FPGA Prototyping, Logic Analyzers & Cleanroom Workbench', 'Academic Block A', 'A-410', 'South Wing', 'Academic', '6 mins walk', 400, '{"x": 42, "y": 82}'::jsonb, ARRAY['FPGA', 'Logic Analyzer', 'JTAG', 'ARM Cortex'], 'developer_board')
ON CONFLICT (id) DO NOTHING;
