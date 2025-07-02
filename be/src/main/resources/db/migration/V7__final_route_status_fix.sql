-- Drop the existing status column completely
ALTER TABLE return_routes DROP COLUMN IF EXISTS status;

-- Drop the enum type completely (if it exists) 
DROP TYPE IF EXISTS route_status;

-- Recreate the enum type with the exact values from Java enum
CREATE TYPE route_status AS ENUM ('OPEN', 'BOOKED', 'COMPLETED', 'CANCELLED');

-- Add the status column with the proper enum type and default
ALTER TABLE return_routes ADD COLUMN status route_status NOT NULL DEFAULT 'OPEN'; 