-- Force fix route_status by dropping and recreating the column
-- First, drop the status column completely
ALTER TABLE return_routes DROP COLUMN IF EXISTS status;

-- Add it back as VARCHAR
ALTER TABLE return_routes ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'OPEN'; 