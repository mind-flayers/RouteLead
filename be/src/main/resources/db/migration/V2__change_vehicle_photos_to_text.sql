-- Ensure vehicle_photos column is properly set up for JSONB
-- First drop the column if it exists
ALTER TABLE vehicle_details DROP COLUMN IF EXISTS vehicle_photos;

-- Then add it back with proper JSONB type
ALTER TABLE vehicle_details ADD COLUMN vehicle_photos JSONB DEFAULT '[]'::jsonb; 