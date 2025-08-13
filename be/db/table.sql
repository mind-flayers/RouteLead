-- Full RouteLead Database Schema Migration Script
-- Includes all 18 tables plus Disputes and Real-Time Driver Location
-- Merged delivery_tracking and driver_location_updates for normalized tracking
-- Enum definitions, triggers, and indexes

-- 1. ENUM type definitions (create if missing)
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('DRIVER','CUSTOMER','ADMIN');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'route_status') THEN
    CREATE TYPE route_status AS ENUM ('INITIATED','OPEN','BOOKED','COMPLETED','CANCELLED');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'parcel_status') THEN
    CREATE TYPE parcel_status AS ENUM ('OPEN','MATCHED','EXPIRED','CANCELLED');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
    CREATE TYPE bid_status AS ENUM ('PENDING','ACCEPTED','REJECTED');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'BID_UPDATE','BOOKING_CONFIRMED','DELIVERY_STATUS','ROUTE_CHANGED','DISPUTE_ALERT'
    );
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'review_role') THEN
    CREATE TYPE review_role AS ENUM('DRIVER','CUSTOMER');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'admin_entity_type') THEN
    CREATE TYPE admin_entity_type AS ENUM('USER','ROUTE','BID','DISPUTE');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
    CREATE TYPE payment_status_enum AS ENUM('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'earnings_status_enum') THEN
    CREATE TYPE earnings_status_enum AS ENUM('PENDING','AVAILABLE','WITHDRAWN');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status_enum') THEN
    CREATE TYPE withdrawal_status_enum AS ENUM('PENDING','PROCESSING','COMPLETED','FAILED');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
    CREATE TYPE message_type_enum AS ENUM('TEXT','IMAGE','DOCUMENT');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'document_type_enum') THEN
    CREATE TYPE document_type_enum AS ENUM(
      'DRIVERS_LICENSE','NATIONAL_ID','VEHICLE_REGISTRATION','INSURANCE','FACE_PHOTO'
    );
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'verification_status_enum') THEN
    CREATE TYPE verification_status_enum AS ENUM('PENDING','APPROVED','REJECTED');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'delivery_status_enum') THEN
    CREATE TYPE delivery_status_enum AS ENUM(
      'ACCEPTED','EN_ROUTE_PICKUP','PICKED_UP','EN_ROUTE_DELIVERY','DELIVERED'
    );
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
    CREATE TYPE gender_enum AS ENUM('MALE','FEMALE','OTHER','PNTS');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'dispute_status_enum') THEN
    CREATE TYPE dispute_status_enum AS ENUM('OPEN','IN_REVIEW','RESOLVED','CLOSED');
  END IF;
END$$;

-- 2. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  first_name VARCHAR(100), last_name VARCHAR(100),
  phone_number VARCHAR(20), nic_number VARCHAR(20),
  profile_photo_url TEXT, is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  date_of_birth DATE, gender gender_enum,
  address_line_1 VARCHAR(255), address_line_2 VARCHAR(255), city VARCHAR(100),
  bank_account_details JSONB,
  driver_license_number VARCHAR(50), license_expiry_date DATE,
  verification_status verification_status_enum,
  face_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profiles_auth_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. vehicle_details
CREATE TABLE IF NOT EXISTS public.vehicle_details (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  color VARCHAR(255), make VARCHAR(255) NOT NULL, model VARCHAR(255) NOT NULL,
  year_of_manufacture INTEGER, plate_number VARCHAR(20) NOT NULL,
  max_weight_kg NUMERIC NOT NULL DEFAULT 0, max_volume_m3 NUMERIC NOT NULL DEFAULT 0,
  vehicle_photos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_vehicle_details_updated_at BEFORE UPDATE ON public.vehicle_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. return_routes
CREATE TABLE IF NOT EXISTS public.return_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin_lat NUMERIC NOT NULL, origin_lng NUMERIC NOT NULL,
  destination_lat NUMERIC NOT NULL, destination_lng NUMERIC NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL, detour_tolerance_km NUMERIC NOT NULL DEFAULT 0,
  suggested_price_min NUMERIC NOT NULL, suggested_price_max NUMERIC NOT NULL,
  status route_status NOT NULL DEFAULT 'INITIATED',
  route_polyline TEXT,
  total_distance_km NUMERIC,
  estimated_duration_minutes INTEGER,
  bidding_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN public.return_routes.route_polyline IS 'Google Maps encoded polyline string';
COMMENT ON COLUMN public.return_routes.total_distance_km IS 'Total route distance calculated from polyline';
COMMENT ON COLUMN public.return_routes.estimated_duration_minutes IS 'Estimated travel time in minutes';
COMMENT ON COLUMN public.return_routes.bidding_start IS 'The timestamp when bidding starts for this route. Bidding ends 2 hours before departure time.';
CREATE TRIGGER update_return_routes_updated_at BEFORE UPDATE ON public.return_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_return_routes_bidding_start
ON public.return_routes (bidding_start);

-- 5. route_segments
CREATE TABLE IF NOT EXISTS public.route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.return_routes(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,
  start_lat NUMERIC NOT NULL, start_lng NUMERIC NOT NULL,
  end_lat NUMERIC NOT NULL, end_lng NUMERIC NOT NULL,
  distance_km NUMERIC NOT NULL,
  location_name VARCHAR(255) NOT NULL DEFAULT 'Unknown Location',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(route_id, segment_index)
);

-- 6. parcel_requests
CREATE TABLE IF NOT EXISTS public.parcel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pickup_lat NUMERIC NOT NULL, pickup_lng NUMERIC NOT NULL,
  dropoff_lat NUMERIC NOT NULL, dropoff_lng NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL, volume_m3 NUMERIC NOT NULL,
  description TEXT, max_budget NUMERIC NOT NULL, deadline TIMESTAMPTZ NOT NULL,
  status parcel_status NOT NULL DEFAULT 'OPEN',
  pickup_contact_name VARCHAR(100), pickup_contact_phone VARCHAR(20),
  delivery_contact_name VARCHAR(100), delivery_contact_phone VARCHAR(20),
  parcel_photos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_parcel_requests_updated_at BEFORE UPDATE ON public.parcel_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. bids
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.parcel_requests(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.return_routes(id) ON DELETE CASCADE,
  start_index INTEGER NOT NULL, end_index INTEGER NOT NULL,
  offered_price NUMERIC NOT NULL, status bid_status NOT NULL DEFAULT 'PENDING',
  pickup_time TIMESTAMPTZ, delivery_time TIMESTAMPTZ, special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. price_predictions
CREATE TABLE IF NOT EXISTS public.price_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.return_routes(id) ON DELETE CASCADE,
  min_price NUMERIC NOT NULL, max_price NUMERIC NOT NULL,
  model_version TEXT NOT NULL, features JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.return_routes(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role review_role NOT NULL, rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL, payload JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES public.bids(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  last_message_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  message_text TEXT NOT NULL, message_type message_type_enum NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. admin_actions
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type admin_entity_type NOT NULL, entity_id UUID NOT NULL,
  action TEXT NOT NULL, notes TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. earnings
CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  bid_id UUID REFERENCES public.bids(id),
  gross_amount NUMERIC NOT NULL, app_fee NUMERIC NOT NULL, net_amount NUMERIC NOT NULL,
  status earnings_status_enum NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC NOT NULL, bank_details JSONB NOT NULL,
  status withdrawal_status_enum NOT NULL, transaction_id VARCHAR(255),
  processed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. driver_documents
CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  document_type document_type_enum NOT NULL, document_url TEXT NOT NULL,
  verification_status verification_status_enum NOT NULL,
  verified_by UUID REFERENCES public.profiles(id), verified_at TIMESTAMPTZ,
  expiry_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. delivery_tracking (status & timestamps only)
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES public.bids(id),
  status delivery_status_enum NOT NULL,
  estimated_arrival TIMESTAMPTZ, actual_pickup_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. payment_methods & payments
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  method_type VARCHAR(50) NOT NULL, last_four VARCHAR(4), card_brand VARCHAR(20),
  is_default BOOLEAN NOT NULL DEFAULT FALSE, is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  bid_id UUID REFERENCES public.bids(id), amount NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'LKR', payment_method VARCHAR(50),
  payment_status payment_status_enum NOT NULL, transaction_id VARCHAR(255),
  gateway_response JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 19. disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  related_bid_id UUID REFERENCES public.bids(id),
  related_route_id UUID REFERENCES public.return_routes(id),
  description TEXT NOT NULL,
  status dispute_status_enum NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

-- 20. driver_location_updates (linked to delivery_tracking)
CREATE TABLE IF NOT EXISTS public.driver_location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_tracking_id UUID NOT NULL REFERENCES public.delivery_tracking(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_location_updates_tracking ON public.driver_location_updates(delivery_tracking_id);
CREATE INDEX IF NOT EXISTS idx_location_updates_time ON public.driver_location_updates(recorded_at DESC);

-- 21. critical indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_driver_id ON public.earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_bid_id ON public.delivery_tracking(bid_id);
