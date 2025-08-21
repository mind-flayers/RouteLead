-- Update disputes table to use parcel_request_id instead of related_bid_id
-- First drop the existing foreign key constraint
ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_related_bid_id_fkey;

-- Drop the related_bid_id column
ALTER TABLE disputes DROP COLUMN IF EXISTS related_bid_id;

-- Add the new parcel_request_id column
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS parcel_request_id UUID REFERENCES parcel_requests(id);

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_disputes_parcel_request_id ON disputes(parcel_request_id);
