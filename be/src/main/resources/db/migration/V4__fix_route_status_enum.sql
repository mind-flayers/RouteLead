-- Fix route_status enum handling by changing to VARCHAR
-- Change the status column from enum to VARCHAR
ALTER TABLE return_routes 
ALTER COLUMN status TYPE VARCHAR(20) USING status::VARCHAR(20);

-- Set the default value
ALTER TABLE return_routes 
ALTER COLUMN status SET DEFAULT 'OPEN'; 