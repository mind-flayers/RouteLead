-- Drop the existing status column
ALTER TABLE return_routes DROP COLUMN IF EXISTS status;

-- Create the route_status enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE route_status AS ENUM ('OPEN', 'BOOKED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the status column with the proper enum type
ALTER TABLE return_routes ADD COLUMN status route_status NOT NULL DEFAULT 'OPEN'; 