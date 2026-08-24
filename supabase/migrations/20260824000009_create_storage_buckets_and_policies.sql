-- =============================================================================
-- CampusSwap - Backend Step 9: Supabase Storage Buckets & Access Policies DDL
-- =============================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('listing-images', 'listing-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('resource-images', 'resource-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('knowledge-files', 'knowledge-files', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']),
  ('project-files', 'project-files', false, 31457280, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain', 'text/csv', 'application/json']),
  ('donation-images', 'donation-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Objects RLS Policies

-- Public Read Policies for public buckets
CREATE POLICY "Public Read Access for Avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Public Read Access for Listing Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Public Read Access for Resource Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resource-images');

CREATE POLICY "Public Read Access for Knowledge Files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'knowledge-files');

CREATE POLICY "Public Read Access for Donation Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'donation-images');

-- Authenticated Read Policy for Project Files
CREATE POLICY "Authenticated Read Access for Project Files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-files');

-- Upload / Insert Policies (strictly restricted to authenticated user's own folder prefix)
CREATE POLICY "Users can upload avatars into their own user folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload listing images into their own user folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload resource images into their own user folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resource-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload knowledge files into their own user folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'knowledge-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload project files into their own user folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload donation images into their own user folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'donation-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update & Delete Policies (Users can only update or delete their own uploaded files)
CREATE POLICY "Users can update their own storage files"
  ON storage.objects FOR UPDATE TO authenticated
  USING ((storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own storage files"
  ON storage.objects FOR DELETE TO authenticated
  USING ((storage.foldername(name))[1] = auth.uid()::text);
