DROP POLICY IF EXISTS "Project images service upload" ON storage.objects;
CREATE POLICY "Project images service upload"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Project images service update" ON storage.objects;
CREATE POLICY "Project images service update"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'project-images')
  WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Project images service delete" ON storage.objects;
CREATE POLICY "Project images service delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'project-images');
