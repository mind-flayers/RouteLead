-- Add INITIATED status to route_status enum (compatible version)
-- Migration V10: Update route status enum to include INITIATED (fixed)

-- Add INITIATED to the enum type with proper error handling
DO $$
BEGIN
    -- Check if INITIATED already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'INITIATED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'route_status')
    ) THEN
        -- Add INITIATED if it doesn't exist
        ALTER TYPE route_status ADD VALUE 'INITIATED';
        RAISE NOTICE 'Added INITIATED to route_status enum';
    ELSE
        RAISE NOTICE 'INITIATED already exists in route_status enum';
    END IF;
END$$;

-- Update the comment to reflect the complete enum values
COMMENT ON TYPE route_status IS 'Route status values: INITIATED, OPEN, BOOKED, COMPLETED, CANCELLED';
