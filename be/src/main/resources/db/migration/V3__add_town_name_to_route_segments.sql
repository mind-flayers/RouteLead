-- Add town_name column to route_segments table
ALTER TABLE public.route_segments 
ADD COLUMN IF NOT EXISTS town_name VARCHAR(255) NOT NULL DEFAULT 'Unknown Location';

-- Update existing records to have a default town name if they don't have one
UPDATE public.route_segments 
SET town_name = 'Unknown Location' 
WHERE town_name IS NULL OR town_name = ''; 